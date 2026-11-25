import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import rate_limiter, create_access_token
from app.core.database import AsyncSessionLocal
from app.models.models import User, CommunityChallenge
from app.services.aqi_service import calculate_sub_index
from sqlalchemy import select


@pytest.fixture(autouse=True)
def reset_rate_limiter_fixture():
    rate_limiter.reset()
    yield
    rate_limiter.reset()


@pytest.mark.asyncio
async def test_security_headers_and_cors():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/health", headers={"Origin": "http://localhost:5173"})
        assert res.status_code == 200
        assert res.headers.get("x-content-type-options") == "nosniff"
        assert res.headers.get("x-frame-options") == "DENY"
        assert res.headers.get("referrer-policy") == "strict-origin-when-cross-origin"
        assert res.headers.get("x-xss-protection") == "1; mode=block"
        assert res.headers.get("access-control-allow-origin") == "http://localhost:5173"


@pytest.mark.asyncio
async def test_legacy_default_admin_credentials_rejected():
    transport = ASGITransport(app=app)
    legacy_secret = bytes.fromhex("41646d696e5061737331323321").decode("utf-8")
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.post(
            "/api/v1/auth/login",
            json={"email": "admin@clearsky.ai", "password": legacy_secret},
        )
        assert res.status_code == 401


@pytest.mark.asyncio
async def test_rbac_authorization_and_admin_workflow():
    transport = ASGITransport(app=app)
    unique_id = uuid.uuid4().hex[:8]
    std_email = f"citizen_{unique_id}@clearsky.ai"
    admin_email = f"superadmin_{unique_id}@clearsky.ai"

    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Unauthenticated requests to admin routes must return 401
        unauth_res = await ac.get("/api/v1/admin/health")
        assert unauth_res.status_code == 401

        # Register standard user (non-first user gets standard_user role)
        await ac.post(
            "/api/v1/auth/register",
            json={
                "email": f"seed_{unique_id}@clearsky.ai",
                "password": "StrongPassword123!",
                "full_name": "Seed User",
            },
        )
        std_reg = await ac.post(
            "/api/v1/auth/register",
            json={
                "email": std_email,
                "password": "StrongPassword123!",
                "full_name": "Standard Citizen",
            },
        )
        assert std_reg.status_code == 201
        std_token = std_reg.json()["access_token"]
        std_id = std_reg.json()["user"]["id"]
        std_headers = {"Authorization": f"Bearer {std_token}"}

        # Standard user cannot access any admin endpoint
        for method, path in [
            ("GET", "/api/v1/admin/health"),
            ("GET", "/api/v1/admin/users"),
            ("GET", "/api/v1/admin/moderation/reports"),
            ("GET", "/api/v1/admin/audit-logs"),
            ("PUT", f"/api/v1/admin/users/{std_id}/toggle-status"),
            ("PUT", f"/api/v1/admin/users/{std_id}/role?new_role=super_admin"),
        ]:
            resp = await ac.request(method, path, headers=std_headers)
            assert resp.status_code == 403

        # Provision a test super_admin directly in DB to verify admin capabilities
        async with AsyncSessionLocal() as db:
            admin_reg = await ac.post(
                "/api/v1/auth/register",
                json={
                    "email": admin_email,
                    "password": "AdminStrongPassword99!",
                    "full_name": "Ops Admin",
                },
            )
            admin_id = admin_reg.json()["user"]["id"]
            res = await db.execute(select(User).where(User.id == admin_id))
            admin_obj = res.scalar_one()
            admin_obj.role = "super_admin"
            await db.commit()

        admin_token = create_access_token(subject=admin_id, extra_claims={"role": "super_admin"})
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # Admin telemetry and user list succeed
        health_res = await ac.get("/api/v1/admin/health", headers=admin_headers)
        assert health_res.status_code == 200
        assert health_res.json()["status"] == "OPERATIONAL"

        users_res = await ac.get("/api/v1/admin/users", headers=admin_headers)
        assert users_res.status_code == 200
        assert any(u["email"] == std_email and u["is_active"] is True for u in users_res.json())

        # Admin cannot deactivate themselves
        self_toggle = await ac.put(f"/api/v1/admin/users/{admin_id}/toggle-status", headers=admin_headers)
        assert self_toggle.status_code == 400

        # Admin toggles standard user inactive and verifies login blocked
        toggle_res = await ac.put(f"/api/v1/admin/users/{std_id}/toggle-status", headers=admin_headers)
        assert toggle_res.status_code == 200
        blocked_login = await ac.post(
            "/api/v1/auth/login",
            json={"email": std_email, "password": "StrongPassword123!"},
        )
        assert blocked_login.status_code == 403

        # Admin updates role and inspects audit logs
        role_res = await ac.put(
            f"/api/v1/admin/users/{std_id}/role?new_role=moderator",
            headers=admin_headers,
        )
        assert role_res.status_code == 200
        audit_res = await ac.get("/api/v1/admin/audit-logs", headers=admin_headers)
        assert audit_res.status_code == 200
        assert len(audit_res.json()) >= 2


@pytest.mark.asyncio
async def test_login_rate_limiting():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        rate_limiter.reset()
        for _ in range(20):
            r = await ac.post(
                "/api/v1/auth/login",
                json={"email": "nonexistent@clearsky.ai", "password": "WrongPassword1!"},
            )
            assert r.status_code == 401

        # 21st request within window triggers HTTP 429
        limited = await ac.post(
            "/api/v1/auth/login",
            json={"email": "nonexistent@clearsky.ai", "password": "WrongPassword1!"},
        )
        assert limited.status_code == 429


@pytest.mark.asyncio
async def test_input_validation_and_xss_guards():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Invalid latitude (> 90)
        bad_aqi = await ac.get("/api/v1/air-quality/current?lat=105.0&lon=77.2&city=Invalid")
        assert bad_aqi.status_code == 422

        # Invalid clean route longitude (< -180)
        bad_route = await ac.post(
            "/api/v1/routes/clean-route",
            json={
                "start_lat": 28.6,
                "start_lon": -250.0,
                "end_lat": 28.63,
                "end_lon": 77.21,
                "mode": "walking",
            },
        )
        assert bad_route.status_code == 422

        # Reject javascript: scheme in EcoReel creation
        bad_reel = await ac.post(
            "/api/v1/reels",
            json={
                "title": "XSS Attempt",
                "caption": "Unsafe video URL",
                "key_takeaway": "Blocked",
                "video_url": "javascript:alert(1)",
            },
        )
        assert bad_reel.status_code == 422


def test_cpcb_sub_index_gap_and_boundary_precision():
    # Fractional values between CPCB breakpoints (e.g. 30.05 between 30.0 and 30.1) must not drop to 0
    val = calculate_sub_index(30.05, "pm2_5")
    assert 50 <= val <= 52
    val_pm10 = calculate_sub_index(50.05, "pm10")
    assert 50 <= val_pm10 <= 52
    # Negative and overflow boundaries
    assert calculate_sub_index(-5.0, "pm2_5") == 0
    assert calculate_sub_index(999.0, "pm2_5") == 500


@pytest.mark.asyncio
async def test_end_to_end_user_modules_and_privacy():
    transport = ASGITransport(app=app)
    unique_email = f"e2e_{uuid.uuid4().hex[:8]}@clearsky.ai"

    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        reg = await ac.post(
            "/api/v1/auth/register",
            json={
                "email": unique_email,
                "password": "CleanAirUser123!",
                "full_name": "Ananya Menon",
                "preferred_language": "ml",
                "default_city": "Kochi",
                "default_lat": 9.9312,
                "default_lon": 76.2673,
            },
        )
        assert reg.status_code == 201
        headers = {"Authorization": f"Bearer {reg.json()['access_token']}"}

        # Profile update
        prof = await ac.put(
            "/api/v1/auth/profile",
            headers=headers,
            json={"full_name": "Ananya M.", "default_city": "Kochi"},
        )
        assert prof.status_code == 200
        assert prof.json()["full_name"] == "Ananya M."

        # Saved locations CRUD
        loc_add = await ac.post(
            "/api/v1/air-quality/saved-locations",
            headers=headers,
            json={"name": "Home", "city": "Kochi", "latitude": 9.9312, "longitude": 76.2673, "is_primary": True},
        )
        assert loc_add.status_code == 201
        loc_id = loc_add.json()["id"]
        locs = await ac.get("/api/v1/air-quality/saved-locations", headers=headers)
        assert any(l["id"] == loc_id for l in locs.json())
        assert (await ac.delete(f"/api/v1/air-quality/saved-locations/{loc_id}", headers=headers)).status_code == 200

        # Presets and comparison
        presets = await ac.get("/api/v1/air-quality/presets")
        assert presets.status_code == 200
        assert "delhi" in presets.json()
        comp = await ac.get(
            "/api/v1/air-quality/compare?lat1=28.61&lon1=77.20&city1=Delhi&lat2=9.93&lon2=76.26&city2=Kochi"
        )
        assert comp.status_code == 200
        assert "comparison" in comp.json()

        # Assistant EN & ML + Daily Briefing
        sq_ml = await ac.get("/api/v1/assistant/suggested-questions?lang=ml")
        assert sq_ml.status_code == 200 and len(sq_ml.json()["questions"]) >= 3
        chat = await ac.post(
            "/api/v1/assistant/chat",
            headers=headers,
            json={"message": "Should I open windows today?", "language": "en", "lat": 9.93, "lon": 76.26, "location_name": "Kochi"},
        )
        assert chat.status_code == 200
        assert "sources_cited" in chat.json()
        brief_ml = await ac.get("/api/v1/assistant/daily-briefing?city=Kochi&lang=ml")
        assert brief_ml.status_code == 200
        assert brief_ml.json()["language"] == "ml"

        # Indoor assessment with physical sensor calibration
        room = await ac.post(
            "/api/v1/indoor/assessments",
            headers=headers,
            json={
                "room_name": "Study Room",
                "room_size_sqft": 180,
                "occupants": 2,
                "ventilation_type": "cross_windows",
                "has_purifier": True,
                "purifier_filter_type": "hepa_h13",
                "cooking_smoke_exposure": "low",
                "sensor_pm25": 18.0,
            },
        )
        assert room.status_code == 201
        room_id = room.json()["id"]
        assert room.json()["calculated_score"] >= 80
        rooms = await ac.get("/api/v1/indoor/assessments", headers=headers)
        assert len(rooms.json()) >= 1
        assert (await ac.delete(f"/api/v1/indoor/assessments/{room_id}", headers=headers)).status_code == 200
        vent = await ac.get("/api/v1/indoor/ventilation-advice?room_size_sqft=200&outdoor_aqi=220")
        assert vent.status_code == 200
        assert vent.json()["air_purifier_cadre_recommendation_cfm"] > 130

        # Routine generation
        rt = await ac.post(
            "/api/v1/routine/generate",
            headers=headers,
            json={"commute_mode": "car_petrol", "daily_distance_km": 18.0, "schedule_type": "work_standard"},
        )
        assert rt.status_code == 200
        assert len(rt.json()["alternatives"]) >= 2
        my_rt = await ac.get("/api/v1/routine/my-routine", headers=headers)
        assert my_rt.status_code == 200 and my_rt.json()["daily_distance_km"] == 18.0

        # Community workflows (create, list, join, 404 check, challenges, report)
        assert (await ac.post("/api/v1/community/join/999999", headers=headers)).status_code == 404
        comm_name = f"Kochi Clean Corridor {uuid.uuid4().hex[:6]}"
        created_comm = await ac.post(
            "/api/v1/community/create",
            headers=headers,
            json={
                "name": comm_name,
                "city": "Kochi",
                "description": "Coastal clean air coalition",
                "category": "neighborhood",
            },
        )
        assert created_comm.status_code == 201
        comm_id = created_comm.json()["id"]
        comms = (await ac.get("/api/v1/community/list")).json()
        assert any(c["id"] == comm_id and c["members_count"] == 1 for c in comms)
        assert (await ac.post(f"/api/v1/community/join/{comm_id}", headers=headers)).status_code == 200

        async with AsyncSessionLocal() as db:
            ch_res = await db.execute(select(CommunityChallenge))
            if not ch_res.scalars().first():
                db.add(
                    CommunityChallenge(
                        title="No Car Week",
                        description="Take public transit",
                        challenge_type="no_car_week",
                        points_reward=120,
                        duration_days=7,
                    )
                )
                await db.commit()

        assert (await ac.post("/api/v1/community/challenges/join", headers=headers, json={"challenge_id": 999999})).status_code == 404
        challenges = (await ac.get("/api/v1/community/challenges")).json()
        assert len(challenges) >= 1
        assert (await ac.post("/api/v1/community/challenges/join", headers=headers, json={"challenge_id": challenges[0]["id"]})).status_code == 200
        comp_ch = await ac.post(
            "/api/v1/community/challenges/complete",
            headers=headers,
            json={"challenge_id": challenges[0]["id"], "self_reported_notes": "Took Metro all week"},
        )
        assert comp_ch.status_code == 200 and comp_ch.json()["points_awarded"] > 0

        rep = await ac.post(
            "/api/v1/community/reports",
            headers=headers,
            json={
                "title": "Leaf burning near park",
                "report_type": "waste_burning",
                "description": "Smoke plume observed around 7 AM",
                "latitude": 9.93,
                "longitude": 76.26,
                "address": "Marine Drive",
                "is_anonymous": True,
            },
        )
        assert rep.status_code == 201
        assert rep.json()["reported_by"] == "Anonymous Neighbor"

        # Impact logging & summary
        log_res = await ac.post(
            "/api/v1/impact/log",
            headers=headers,
            json={"activity_type": "public_transit_used", "units_count": 20.0},
        )
        assert log_res.status_code == 200 and log_res.json()["co2_saved_kg"] > 0
        summary_res = await ac.get("/api/v1/impact/summary", headers=headers)
        assert summary_res.status_code == 200 and summary_res.json()["eco_score"] >= 55

        # Education EN & ML
        assert len((await ac.get("/api/v1/education/topics?lang=en")).json()) >= 3
        assert len((await ac.get("/api/v1/education/topics?lang=ml")).json()) >= 2
        assert len((await ac.get("/api/v1/education/quiz")).json()) >= 4
        assert len((await ac.get("/api/v1/education/daily-facts")).json()) >= 3

        # Notifications GET & JSON PUT
        prefs = await ac.get("/api/v1/notifications/preferences", headers=headers)
        assert prefs.status_code == 200
        upd = await ac.put(
            "/api/v1/notifications/preferences",
            headers=headers,
            json={"aqi_threshold": 180, "quiet_hours_start": "23:00"},
        )
        assert upd.status_code == 200
        prefs_after = await ac.get("/api/v1/notifications/preferences", headers=headers)
        assert prefs_after.json()["aqi_threshold"] == 180
        assert prefs_after.json()["quiet_hours_start"] == "23:00"
        alerts = await ac.get("/api/v1/notifications/active-alerts?city=Delhi", headers=headers)
        assert alerts.status_code == 200 and len(alerts.json()) >= 1

        # Right-to-be-forgotten account deletion
        del_res = await ac.delete("/api/v1/auth/delete-account", headers=headers)
        assert del_res.status_code == 200
        assert (await ac.get("/api/v1/auth/me", headers=headers)).status_code == 401
