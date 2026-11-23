import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_get_reels_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/reels")
        assert response.status_code == 200
        reels = response.json()
        assert isinstance(reels, list)
        assert len(reels) >= 6
        first = reels[0]
        assert "id" in first
        assert "title" in first
        assert "caption" in first
        assert "creator_name" in first
        assert "likes_count" in first
        assert "comments" in first

@pytest.mark.asyncio
async def test_filter_reels_by_category():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/reels?category=smog_alert")
        assert response.status_code == 200
        reels = response.json()
        assert len(reels) >= 1
        for r in reels:
            assert r["category"] == "smog_alert"

@pytest.mark.asyncio
async def test_get_single_reel():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/reels/reel-1")
        assert response.status_code == 200
        reel = response.json()
        assert reel["id"] == "reel-1"
        assert "Inversion" in reel["title"]

@pytest.mark.asyncio
async def test_toggle_reel_like():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Get initial state
        initial = (await ac.get("/api/v1/reels/reel-1")).json()
        init_liked = initial.get("is_liked", False)
        init_count = initial.get("likes_count", 0)

        # Toggle like
        toggle_res = await ac.post("/api/v1/reels/reel-1/like")
        assert toggle_res.status_code == 200
        data = toggle_res.json()
        assert data["is_liked"] == (not init_liked)
        if data["is_liked"]:
            assert data["likes_count"] == init_count + 1
        else:
            assert data["likes_count"] == init_count - 1

@pytest.mark.asyncio
async def test_add_reel_comment():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "author": "Dr. Aarav",
            "handle": "@aarav_pulmo",
            "text": "Excellent explanation of PM2.5 alveolar diffusion!"
        }
        res = await ac.post("/api/v1/reels/reel-1/comments", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["detail"] == "Comment added successfully"
        assert data["comment"]["author"] == "Dr. Aarav"
        assert "alv" in data["comment"]["text"]

@pytest.mark.asyncio
async def test_create_custom_reel():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "title": "Air Purifier Filter Replacement Warning Signs",
            "caption": "How to tell your HEPA filter is fully saturated with soot: color change from white to charcoal grey, foul stale odor on startup, and air outflow dropping by 40%.",
            "tags": ["#FilterChange", "#AirPurifier", "#HEPA", "#WinterCare"],
            "category": "home_hacks",
            "creator_name": "Eco Technician",
            "creator_handle": "@ecotech",
            "aqi_badge": "HEPA Alert",
            "theme_gradient": "from-purple-900 via-indigo-950 to-neutral-950",
            "visual_type": "purifier_cadr",
            "key_takeaway": "Inspect HEPA filters every 60 days during peak winter smog months."
        }
        res = await ac.post("/api/v1/reels", json=payload)
        assert res.status_code == 201
        data = res.json()
        assert "reel-" in data["id"]
        assert data["title"] == payload["title"]
        assert data["creator_name"] == "Eco Technician"
