from fastapi import APIRouter
from app.schemas.schemas import CleanRouteRequest, CleanRouteResponse
from app.services.aqi_service import fetch_air_quality_and_weather
from app.services.route_service import compute_clean_routes

router = APIRouter(prefix="/routes", tags=["Smart Clean-Air Route Planner"])


@router.post("/clean-route", response_model=CleanRouteResponse)
async def plan_clean_route(req: CleanRouteRequest):
    aqi_data = await fetch_air_quality_and_weather(req.start_lat, req.start_lon, "Route Origin")
    curr = aqi_data.get("current", {})
    return compute_clean_routes(
        req=req,
        ambient_pm25=curr.get("pm2_5"),
        ambient_aqi=curr.get("aqi_in"),
    )
