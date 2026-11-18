import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_root_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["platform"] == "ClearSky AI"
        assert data["status"] == "online"

@pytest.mark.asyncio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"

@pytest.mark.asyncio
async def test_air_quality_current():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/air-quality/current?lat=28.6139&lon=77.2090&city=Delhi")
        assert response.status_code == 200
        data = response.json()
        assert "current" in data
        assert "aqi_in" in data["current"]
        assert "pm2_5" in data["current"]
        assert "pollutants" in data["current"]
        assert "hourly" in data
        assert "daily" in data
        assert "ai_summary" in data

@pytest.mark.asyncio
async def test_what_if_simulator_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "participating_families": 150,
            "avg_commute_km": 12.5,
            "shift_mode": "car_to_metro"
        }
        response = await ac.post("/api/v1/impact/what-if", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["participating_families"] == 150
        assert data["annual_co2_avoided_tons"] > 0
        assert "ambient air quality" in data["disclaimer"]

@pytest.mark.asyncio
async def test_clean_route_planner_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "start_lat": 28.6139,
            "start_lon": 77.2090,
            "end_lat": 28.6304,
            "end_lon": 77.2177,
            "mode": "walking"
        }
        response = await ac.post("/api/v1/routes/clean-route", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert len(data["routes"]) == 2
        assert data["routes"][1]["estimated_pm25_exposure_index"] < data["routes"][0]["estimated_pm25_exposure_index"]

@pytest.mark.asyncio
async def test_auth_and_user_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Register test user
        user_email = "testrunner@clearsky.ai"
        reg_payload = {
            "email": user_email,
            "password": "Password123!",
            "full_name": "Test Runner",
            "preferred_language": "en",
            "default_city": "Kochi",
            "default_lat": 9.9312,
            "default_lon": 76.2673
        }
        reg_res = await ac.post("/api/v1/auth/register", json=reg_payload)
        assert reg_res.status_code in [201, 400] # 400 if rerun with existing email

        # Login
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": user_email,
            "password": "Password123!"
        })
        assert login_res.status_code == 200
        token_data = login_res.json()
        assert "access_token" in token_data
        token = token_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Check me
        me_res = await ac.get("/api/v1/auth/me", headers=headers)
        assert me_res.status_code == 200
        assert me_res.json()["email"] == user_email

        # Add family member
        fam_res = await ac.post("/api/v1/family/members", headers=headers, json={
            "name": "Aarav",
            "relation": "child",
            "age_group": "child",
            "sensitivity_profile": "respiratory_sensitive",
            "activity_preferences": "indoor_reading,drawing"
        })
        assert fam_res.status_code == 201

        # Get family plan
        plan_res = await ac.get("/api/v1/family/daily-plan?city=Kochi", headers=headers)
        assert plan_res.status_code == 200
        plan_data = plan_res.json()
        assert len(plan_data["activities"]) > 0
