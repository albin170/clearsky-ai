from datetime import timedelta
import uuid
import httpx
import jwt
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.security import (
    RateLimiter,
    create_access_token,
    decode_access_token,
    get_password_hash,
    verify_password,
)
from app.main import app
from app.models.models import AuditLog, User
from app.schemas.schemas import CleanRouteRequest
from app.services.aqi_service import (
    clear_aqi_cache,
    fetch_air_quality_and_weather,
    get_cached_locations_count,
    parse_aqi_and_weather,
)
from app.services.family_service import build_family_daily_plan
from app.services.gemini_service import generate_assistant_response
from app.services.indoor_service import build_ventilation_window_advice, calculate_room_health
from app.services.route_service import compute_clean_routes


def test_password_hashing_handles_long_passwords_and_jwt_expiry():
    # Regression test for bcrypt > 72-byte password boundary
    long_password = "CleanAirWinterSmogDefense!" * 4  # 104 bytes (> 72 bytes)
    hashed = get_password_hash(long_password)
    assert verify_password(long_password, hashed) is True
    assert verify_password(long_password + "x", hashed) is False
    assert verify_password("any", "not-a-valid-bcrypt-hash") is False

    # Valid token includes iat, exp, sub
    tok = create_access_token(subject=42, extra_claims={"role": "standard_user"})
    decoded = decode_access_token(tok)
    assert decoded is not None
    assert decoded["sub"] == "42"
    assert "iat" in decoded and "exp" in decoded

    # Expired token returns None
    expired = create_access_token(subject=42, expires_delta=timedelta(seconds=-10))
    assert decode_access_token(expired) is None

    # Token missing required sub claim is rejected
    no_sub = jwt.encode({"role": "super_admin"}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    assert decode_access_token(no_sub) is None


def test_bounded_rate_limiter_key_eviction():
    limiter = RateLimiter(max_keys=3)
    limiter.check_rate_limit("k1", max_requests=2, window_seconds=60)
    limiter.check_rate_limit("k2", max_requests=2, window_seconds=60)
    limiter.check_rate_limit("k3", max_requests=2, window_seconds=60)
    limiter.check_rate_limit("k4", max_requests=2, window_seconds=60)
    assert len(limiter._hits) <= 3


@pytest.mark.asyncio
async def test_csp_hsts_headers_and_login_audit_trail_without_secret_leak():
    transport = ASGITransport(app=app)
    uid = uuid.uuid4().hex[:8]
    email = f"audit_{uid}@clearsky.ai"
    secret_pw = f"UniqueSecretPwd_{uid}!"

    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        health = await ac.get("/health")
        assert "content-security-policy" in health.headers
        assert "strict-transport-security" in health.headers
        assert health.headers.get("cross-origin-opener-policy") == "same-origin"

        reg = await ac.post(
            "/api/v1/auth/register",
            json={"email": email, "password": secret_pw, "full_name": "Audit Citizen"},
        )
        assert reg.status_code == 201

        bad_login = await ac.post(
            "/api/v1/auth/login",
            json={"email": email, "password": secret_pw + "wrong"},
        )
        assert bad_login.status_code == 401

        good_login = await ac.post(
            "/api/v1/auth/login",
            json={"email": email, "password": secret_pw},
        )
        assert good_login.status_code == 200

    async with AsyncSessionLocal() as db:
        logs = (await db.execute(select(AuditLog).order_by(AuditLog.id.desc()).limit(10))).scalars().all()
        actions = {log.action for log in logs}
        assert "USER_LOGIN" in actions
        assert "USER_LOGIN_FAILED" in actions
        for log in logs:
            assert secret_pw not in (log.details or "")


@pytest.mark.asyncio
async def test_idor_isolation_across_users():
    transport = ASGITransport(app=app)
    uid = uuid.uuid4().hex[:8]

    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        u1 = await ac.post(
            "/api/v1/auth/register",
            json={"email": f"u1_{uid}@clearsky.ai", "password": "Password123!", "full_name": "User One"},
        )
        u2 = await ac.post(
            "/api/v1/auth/register",
            json={"email": f"u2_{uid}@clearsky.ai", "password": "Password123!", "full_name": "User Two"},
        )
        h1 = {"Authorization": f"Bearer {u1.json()['access_token']}"}
        h2 = {"Authorization": f"Bearer {u2.json()['access_token']}"}

        loc = (
            await ac.post(
                "/api/v1/air-quality/saved-locations",
                headers=h1,
                json={"name": "U1 Home", "city": "Delhi", "latitude": 28.61, "longitude": 77.20},
            )
        ).json()
        mem = (
            await ac.post(
                "/api/v1/family/members",
                headers=h1,
                json={"name": "Diya", "relation": "child", "age_group": "child", "sensitivity_profile": "standard"},
            )
        ).json()
        room = (
            await ac.post(
                "/api/v1/indoor/assessments",
                headers=h1,
                json={"room_name": "Nursery", "room_size_sqft": 140, "occupants": 2},
            )
        ).json()
        chat1 = (
            await ac.post(
                "/api/v1/assistant/chat",
                headers=h1,
                json={"message": "Window ventilation advice?", "language": "en"},
            )
        ).json()

        # User 2 cannot delete User 1's resources
        assert (await ac.delete(f"/api/v1/air-quality/saved-locations/{loc['id']}", headers=h2)).status_code == 404
        assert (await ac.delete(f"/api/v1/family/members/{mem['id']}", headers=h2)).status_code == 404
        assert (await ac.delete(f"/api/v1/indoor/assessments/{room['id']}", headers=h2)).status_code == 404

        # User 2 supplying User 1's conversation_id gets a separate conversation ID
        chat2 = (
            await ac.post(
                "/api/v1/assistant/chat",
                headers=h2,
                json={
                    "message": "Jogging advice?",
                    "conversation_id": chat1["conversation_id"],
                    "language": "en",
                },
            )
        ).json()
        assert chat2["conversation_id"] != chat1["conversation_id"]


@pytest.mark.asyncio
async def test_role_hierarchy_and_report_moderation_filtering():
    transport = ASGITransport(app=app)
    uid = uuid.uuid4().hex[:8]

    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        mod_reg = await ac.post(
            "/api/v1/auth/register",
            json={"email": f"mod_{uid}@clearsky.ai", "password": "Password123!", "full_name": "Mod User"},
        )
        mgr_reg = await ac.post(
            "/api/v1/auth/register",
            json={"email": f"mgr_{uid}@clearsky.ai", "password": "Password123!", "full_name": "Mgr User"},
        )
        mod_id = mod_reg.json()["user"]["id"]
        mgr_id = mgr_reg.json()["user"]["id"]

        async with AsyncSessionLocal() as db:
            mod_u = (await db.execute(select(User).where(User.id == mod_id))).scalar_one()
            mgr_u = (await db.execute(select(User).where(User.id == mgr_id))).scalar_one()
            mod_u.role = "moderator"
            mgr_u.role = "community_manager"
            await db.commit()

        mod_headers = {"Authorization": f"Bearer {create_access_token(mod_id, {'role': 'moderator'})}"}
        mgr_headers = {"Authorization": f"Bearer {create_access_token(mgr_id, {'role': 'community_manager'})}"}

        # Community manager can view health, but cannot list users or moderate reports
        assert (await ac.get("/api/v1/admin/health", headers=mgr_headers)).status_code == 200
        assert (await ac.get("/api/v1/admin/users", headers=mgr_headers)).status_code == 403
        assert (await ac.get("/api/v1/admin/moderation/reports", headers=mgr_headers)).status_code == 403

        # Submit a community report and have moderator flag it as spam
        rep = (
            await ac.post(
                "/api/v1/community/reports",
                json={
                    "title": f"Spam Report {uid}",
                    "report_type": "other",
                    "description": "Test spam",
                    "latitude": 28.61,
                    "longitude": 77.20,
                    "address": "Sector 1",
                    "is_anonymous": False,
                },
            )
        ).json()
        rep_id = rep["id"]

        # Invalid status rejected with 400; nonexistent report rejected with 404
        assert (
            await ac.put(f"/api/v1/admin/moderation/reports/{rep_id}?status_update=invalid_state", headers=mod_headers)
        ).status_code == 400
        assert (
            await ac.put("/api/v1/admin/moderation/reports/999999?status_update=resolved", headers=mod_headers)
        ).status_code == 404

        mod_ok = await ac.put(
            f"/api/v1/admin/moderation/reports/{rep_id}?status_update=flagged_spam",
            headers=mod_headers,
        )
        assert mod_ok.status_code == 200

        # Flagged spam report is excluded from public feed
        public_reports = (await ac.get("/api/v1/community/reports")).json()
        assert all(r["id"] != rep_id for r in public_reports)


def test_family_indoor_and_route_domain_services():
    # Personalized family plan differentiates infant/child, senior, athlete, worker
    class StubMember:
        def __init__(self, name: str, age_group: str, sensitivity_profile: str):
            self.name = name
            self.age_group = age_group
            self.sensitivity_profile = sensitivity_profile

    members = [
        StubMember("Aarav", "child", "respiratory_sensitive"),
        StubMember("Grandpa", "senior", "cardiovascular_sensitive"),
        StubMember("Meera", "adult", "outdoor_athlete"),
        StubMember("Raju", "adult", "outdoor_worker"),
    ]
    high_smog_data = {"current": {"aqi_in": 285, "category_in": "Poor", "pm2_5": 118.4}}
    plan_high = build_family_daily_plan(members, high_smog_data, "Delhi NCR")
    assert len(plan_high.activities) == 12
    recs = " ".join(a.recommendation for a in plan_high.activities)
    assert "KF94/N95" in recs
    assert "blood pressure" in recs
    assert "cardio indoors" in recs
    assert "outdoor shifts" in recs

    low_aqi_data = {"current": {"aqi_in": 42, "category_in": "Good", "pm2_5": 18.0}}
    plan_low = build_family_daily_plan(members, low_aqi_data, "Kochi")
    assert plan_low.aqi_context == 42

    # Indoor room health branches
    low_score, low_tips = calculate_room_health(
        size_sqft=90.0,
        occupants=3,
        ventilation="sealed_ac",
        has_purifier=False,
        filter_type="none",
        cooking_exposure="high",
        sensor_pm25=88.0,
    )
    assert low_score == 20
    assert any("CO2" in t for t in low_tips)

    high_score, _ = calculate_room_health(
        size_sqft=220.0,
        occupants=2,
        ventilation="cross_windows",
        has_purifier=True,
        filter_type="hepa_h13",
        cooking_exposure="low",
        sensor_pm25=12.0,
    )
    assert high_score == 100

    advice_low = build_ventilation_window_advice(180.0, 85)
    assert "11:00 AM" in advice_low.optimal_window_opening_hours[0]

    # Clean route computation grounded in high smog (>200 AQI triggers N95 guidance)
    route_res = compute_clean_routes(
        CleanRouteRequest(start_lat=28.61, start_lon=77.20, end_lat=28.61, end_lon=77.20, mode="cycling"),
        ambient_pm25=120.0,
        ambient_aqi=290,
    )
    assert route_res.routes[1].estimated_pm25_exposure_index < route_res.routes[0].estimated_pm25_exposure_index
    assert "N95" in route_res.guidance


@pytest.mark.asyncio
async def test_aqi_fallback_cache_and_assistant_bilingual_branches(monkeypatch):
    clear_aqi_cache()
    assert get_cached_locations_count() == 0

    # Parse offline fallback directly
    fallback = parse_aqi_and_weather({}, {}, 28.61, 77.20, "Delhi NCR", is_fallback=True)
    assert "Demo Mode" in fallback["current"]["source"]
    assert len(fallback["hourly"]) == 24
    assert len(fallback["daily"]) == 7

    # Cache hit verification
    first = await fetch_air_quality_and_weather(19.076, 72.8777, "Mumbai")
    assert first["cached"] is False
    assert get_cached_locations_count() >= 1
    second = await fetch_air_quality_and_weather(19.076, 72.8777, "Mumbai")
    assert second["cached"] is True

    # Assistant RAG branches in English and Malayalam across low and high AQI
    for lang in ("en", "ml"):
        for aqi_val in (55, 240):
            sample_aq = {
                "current": {"aqi_in": aqi_val, "category_in": "Good" if aqi_val < 100 else "Poor", "pm2_5": 22.0 if aqi_val < 100 else 105.0, "pm10": 45.0},
                "weather": {"temperature_c": 21.0, "wind_speed_kmh": 6.5},
            }
            for q in ("Can I jog outdoors?", "Should I open windows?", "How to protect children at school?", "General overview"):
                ans = await generate_assistant_response(
                    user_query=q,
                    language=lang,
                    current_aqi_data=sample_aq,
                    family_members_data=[{"name": "Anu", "relation": "child", "age_group": "child", "sensitivity_profile": "respiratory_sensitive"}],
                    city_name="Kochi",
                )
                assert ans["language"] == lang
                assert len(ans["content"]) > 30
                assert len(ans["sources_cited"]) >= 3

    # Test Gemini API failure fallback when GEMINI_API_KEY is set
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "test-ephemeral-key")

    async def mock_failing_post(*args, **kwargs):
        raise httpx.ConnectError("Simulated network failure")

    monkeypatch.setattr(httpx.AsyncClient, "post", mock_failing_post)
    fallback_ans = await generate_assistant_response("Can I run outside?", "en", fallback, None, "Delhi")
    assert "AQI" in fallback_ans["content"]


@pytest.mark.asyncio
async def test_impact_demo_attribution_whatif_modes_and_reels_edge_cases():
    transport = ASGITransport(app=app)
    uid = uuid.uuid4().hex[:8]

    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Unauthenticated summary clearly flags is_demo_data=True
        anon_summary = (await ac.get("/api/v1/impact/summary")).json()
        assert anon_summary["is_demo_data"] is True

        # Register user and log multiple activity types -> is_demo_data becomes False
        reg = await ac.post(
            "/api/v1/auth/register",
            json={"email": f"impact_{uid}@clearsky.ai", "password": "Password123!", "full_name": "Eco Citizen"},
        )
        headers = {"Authorization": f"Bearer {reg.json()['access_token']}"}
        for act_type, units in [
            ("cycling_trip", 8.0),
            ("carpooling", 15.0),
            ("energy_saved", 6.0),
            ("no_waste_burning", 4.0),
        ]:
            r = await ac.post("/api/v1/impact/log", headers=headers, json={"activity_type": act_type, "units_count": units})
            assert r.status_code == 200

        real_summary = (await ac.get("/api/v1/impact/summary", headers=headers)).json()
        assert real_summary["is_demo_data"] is False
        assert real_summary["activities_completed_count"] == 4

        # All What-If modes
        for mode in ("car_to_metro", "car_to_bus", "car_to_cycling", "zero_waste_burning", "energy_conservation"):
            wf = await ac.post(
                "/api/v1/impact/what-if",
                json={"participating_families": 120, "avg_commute_km": 14.0, "shift_mode": mode},
            )
            assert wf.status_code == 200
            assert wf.json()["daily_co2_avoided_kg"] > 0

        # EcoReels search, save toggle, path traversal guard, and 404s
        search_res = await ac.get("/api/v1/reels?search=Microscope")
        assert search_res.status_code == 200 and len(search_res.json()) == 1
        save_res = await ac.post("/api/v1/reels/reel-1/save")
        assert save_res.status_code == 200 and "is_saved" in save_res.json()
        assert (await ac.get("/api/v1/reels/nonexistent")).status_code == 404
        assert (await ac.post("/api/v1/reels/nonexistent/like")).status_code == 404
        assert (await ac.post("/api/v1/reels/nonexistent/save")).status_code == 404
        assert (
            await ac.post("/api/v1/reels/nonexistent/comments", json={"text": "Hello"})
        ).status_code == 404

        traversal_reel = await ac.post(
            "/api/v1/reels",
            json={
                "title": "Traversal",
                "caption": "Bad path",
                "key_takeaway": "Blocked",
                "video_url": "/videos/../../etc/passwd",
            },
        )
        assert traversal_reel.status_code == 422
