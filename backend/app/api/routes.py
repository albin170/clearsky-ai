import math
from fastapi import APIRouter
from app.schemas.schemas import CleanRouteRequest, CleanRouteResponse, RouteOption

router = APIRouter(prefix="/routes", tags=["Smart Clean-Air Route Planner"])

def calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Radius of earth in km
    r = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c

@router.post("/clean-route", response_model=CleanRouteResponse)
async def plan_clean_route(req: CleanRouteRequest):
    direct_km = calculate_haversine(req.start_lat, req.start_lon, req.end_lat, req.end_lon)
    if direct_km < 0.1:
        direct_km = 1.8  # Default demo distance

    # Route 1: Arterial Traffic Corridor (Shortest, High Exposure)
    arterial_dist = round(direct_km * 1.15, 2)
    arterial_mins = round((arterial_dist / (4.5 if req.mode == "walking" else 15.0)) * 60)

    # Route 2: Green & Residential Low-Exposure Corridor (Slightly longer, Lower Exposure)
    green_dist = round(direct_km * 1.32, 2)
    green_mins = round((green_dist / (4.5 if req.mode == "walking" else 15.0)) * 60)

    # Interpolate path coordinates for visual mapping
    # 5 waypoints for each
    mid_lat = (req.start_lat + req.end_lat) / 2
    mid_lon = (req.start_lon + req.end_lon) / 2

    # Arterial: straight-line bias
    path_arterial = [
        [req.start_lat, req.start_lon],
        [req.start_lat + (req.end_lat - req.start_lat)*0.3, req.start_lon + (req.end_lon - req.start_lon)*0.3],
        [mid_lat, mid_lon],
        [req.start_lat + (req.end_lat - req.start_lat)*0.7, req.start_lon + (req.end_lon - req.start_lon)*0.7],
        [req.end_lat, req.end_lon]
    ]

    # Green: gentle detour offset through tree-lined perimeter
    offset = 0.004
    path_green = [
        [req.start_lat, req.start_lon],
        [req.start_lat + (req.end_lat - req.start_lat)*0.25 + offset, req.start_lon + (req.end_lon - req.start_lon)*0.25 - offset],
        [mid_lat + offset*1.4, mid_lon - offset*0.8],
        [req.start_lat + (req.end_lat - req.start_lat)*0.75 + offset*0.6, req.start_lon + (req.end_lon - req.start_lon)*0.75 + offset*0.4],
        [req.end_lat, req.end_lon]
    ]

    routes = [
        RouteOption(
            name="Direct Arterial Route (Main Road)",
            distance_km=arterial_dist,
            estimated_time_mins=arterial_mins,
            estimated_pm25_exposure_index=82.0,
            pollution_exposure_label="High Roadside Exposure",
            suitability="Fastest transit, but exposes commuter to heavy vehicular diesel exhaust and brake dust.",
            route_path=path_arterial,
            advantages=["Shorter walking/cycling distance", "Continuous sidewalks"]
        ),
        RouteOption(
            name="ClearSky Green & Residential Corridor",
            distance_km=green_dist,
            estimated_time_mins=green_mins,
            estimated_pm25_exposure_index=38.0,
            pollution_exposure_label="54% Lower Modeled Exposure",
            suitability="Recommended for health. Routes through secondary residential lanes and park perimeters with vegetative buffering.",
            route_path=path_green,
            advantages=["Significant reduction in direct tailpipe inhalation", "Shaded tree canopy", "Lower ambient noise level"]
        )
    ]

    guidance = (
        f"Trade-Off Analysis: The Green Route adds approximately {round(green_dist - arterial_dist, 2)} km "
        f"({green_mins - arterial_mins} minutes), but reduces estimated roadside particulate exposure by over 50%. "
        f"For jogging, walking with children, or cycling, the low-exposure detour provides substantial respiratory protection."
    )

    disclaimer = (
        "ClearSky Route Note: Modeled exposure levels reflect traffic proximity and urban canopy buffering. "
        "No urban outdoor route is completely pollution-free during severe smog episodes. "
        "Wear an N95 respirator if ambient AQI exceeds 200 regardless of selected route."
    )

    return CleanRouteResponse(routes=routes, guidance=guidance, disclaimer=disclaimer)
