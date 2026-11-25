import asyncio
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, SavedLocation
from app.schemas.schemas import (
    AirQualityResponse,
    DetailMessageResponse,
    LocationComparisonResponse,
    SavedLocationCreate,
    SavedLocationOut,
)
from app.services.aqi_service import fetch_air_quality_and_weather

router = APIRouter(prefix="/air-quality", tags=["Air Quality & Weather"])

# Predefined cities for immediate exploration
PRESET_CITIES = {
    "delhi": {"name": "Delhi NCR", "lat": 28.6139, "lon": 77.2090},
    "mumbai": {"name": "Mumbai", "lat": 19.0760, "lon": 72.8777},
    "bengaluru": {"name": "Bengaluru", "lat": 12.9716, "lon": 77.5946},
    "kochi": {"name": "Kochi (Kerala)", "lat": 9.9312, "lon": 76.2673},
    "kolkata": {"name": "Kolkata", "lat": 22.5726, "lon": 88.3639},
    "chennai": {"name": "Chennai", "lat": 13.0827, "lon": 80.2707},
    "beijing": {"name": "Beijing", "lat": 39.9042, "lon": 116.4074},
    "london": {"name": "London", "lat": 51.5074, "lon": -0.1278},
    "new_york": {"name": "New York", "lat": 40.7128, "lon": -74.0060},
}


@router.get("/current", response_model=AirQualityResponse)
async def get_current_air_quality(
    lat: float = Query(28.6139, ge=-90.0, le=90.0, description="Latitude"),
    lon: float = Query(77.2090, ge=-180.0, le=180.0, description="Longitude"),
    city: str = Query("Detected Location", description="City or area name"),
):
    return await fetch_air_quality_and_weather(lat, lon, city)


@router.get("/presets")
async def get_preset_cities():
    return PRESET_CITIES


@router.get("/saved-locations", response_model=List[SavedLocationOut])
async def get_saved_locations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(SavedLocation).where(SavedLocation.user_id == current_user.id))
    return res.scalars().all()


@router.post("/saved-locations", response_model=SavedLocationOut, status_code=status.HTTP_201_CREATED)
async def add_saved_location(
    loc_in: SavedLocationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    new_loc = SavedLocation(
        user_id=current_user.id,
        name=loc_in.name,
        city=loc_in.city,
        latitude=loc_in.latitude,
        longitude=loc_in.longitude,
        is_primary=loc_in.is_primary,
    )
    db.add(new_loc)
    await db.commit()
    await db.refresh(new_loc)
    return new_loc


@router.delete("/saved-locations/{location_id}", response_model=DetailMessageResponse)
async def delete_saved_location(
    location_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(SavedLocation).where(
            SavedLocation.id == location_id,
            SavedLocation.user_id == current_user.id,
        )
    )
    loc = res.scalar_one_or_none()
    if not loc:
        raise HTTPException(status_code=404, detail="Saved location not found")
    await db.delete(loc)
    await db.commit()
    return {"detail": "Saved location removed"}


@router.get("/compare", response_model=LocationComparisonResponse)
async def compare_locations(
    lat1: float = Query(..., ge=-90.0, le=90.0, description="Location 1 Latitude"),
    lon1: float = Query(..., ge=-180.0, le=180.0, description="Location 1 Longitude"),
    city1: str = Query("Location 1"),
    lat2: float = Query(..., ge=-90.0, le=90.0, description="Location 2 Latitude"),
    lon2: float = Query(..., ge=-180.0, le=180.0, description="Location 2 Longitude"),
    city2: str = Query("Location 2"),
):
    loc1_data, loc2_data = await asyncio.gather(
        fetch_air_quality_and_weather(lat1, lon1, city1),
        fetch_air_quality_and_weather(lat2, lon2, city2),
    )

    diff_aqi = loc1_data["current"]["aqi_in"] - loc2_data["current"]["aqi_in"]
    cleaner_city = city2 if diff_aqi > 0 else (city1 if diff_aqi < 0 else "Both equal")

    return {
        "location_1": loc1_data["current"],
        "location_2": loc2_data["current"],
        "comparison": {
            "aqi_difference": abs(diff_aqi),
            "cleaner_location": cleaner_city,
            "pm25_difference": round(abs(loc1_data["current"]["pm2_5"] - loc2_data["current"]["pm2_5"]), 1),
            "summary": f"{cleaner_city} currently has cleaner ambient air by an AQI difference of {abs(diff_aqi)} points.",
        },
    }
