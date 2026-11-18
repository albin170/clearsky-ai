import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, RoomAssessment
from app.schemas.schemas import RoomAssessmentCreate, RoomAssessmentOut, VentilationWindowAdvice

router = APIRouter(prefix="/indoor", tags=["Indoor Air Quality Optimizer"])

INDOOR_DISCLAIMER = (
    "ClearSky Indoor Note: Indoor air quality is dynamic and affected by building infiltration, cooking fuels, "
    "dust resuspension, and occupant density. While our Room Health Planner calculates an engineering risk score "
    "and CADR requirements, direct numerical measurement of indoor AQI requires a calibrated indoor physical sensor."
)

def calculate_room_health(
    size_sqft: float,
    occupants: int,
    ventilation: str,
    has_purifier: bool,
    filter_type: str,
    cooking_exposure: str,
    sensor_pm25: Optional[float] = None
) -> tuple[int, List[str]]:
    score = 80
    tips = []

    # Space factor
    sqft_per_person = size_sqft / max(1, occupants)
    if sqft_per_person < 60:
        score -= 15
        tips.append("High occupant density for room volume causes rapid CO2 accumulation (> 1000 ppm), leading to fatigue. Ensure intermittent ventilation.")
    else:
        tips.append("Room volume is well-proportioned for the number of occupants.")

    # Ventilation
    if ventilation == "sealed_ac" and not has_purifier:
        score -= 20
        tips.append("Sealed AC without fresh air exchange or HEPA filtration recirculates stale indoor aerosols, pet dander, and respiratory droplets.")
    elif ventilation == "exhaust_only":
        tips.append("Exhaust fan creates negative pressure, pulling in outdoor air through cracks. Ensure outdoor air is not smog-polluted.")
    elif ventilation == "cross_windows":
        score += 5
        tips.append("Cross-ventilation provides effective natural airflow during low-pollution midday hours.")

    # Purifier
    if has_purifier:
        if filter_type == "hepa_h13":
            score += 15
            tips.append("True HEPA H13 filtration removes 99.97% of airborne particles down to 0.3 microns, including winter soot and pollen.")
        else:
            score += 5
            tips.append("Basic filter captures coarse dust. Upgrade to a certified HEPA H13 filter for optimal fine particulate (PM2.5) defense.")
    else:
        score -= 15
        tips.append("No active air purifier detected. During winter smog episodes, indoor particulate concentrations can reach 60-70% of outdoor levels without filtration.")

    # Cooking exposure
    if cooking_exposure == "high":
        score -= 20
        tips.append("High cooking smoke exposure detected. Frying, tadka/tempering, and grilling release dense ultrafine particles (UFP) and volatile organic compounds. Always use an exhaust chimney and close kitchen doors.")
    elif cooking_exposure == "moderate":
        score -= 10
        tips.append("Moderate cooking vapor exposure. Keep kitchen window or ventilation active during meal preparation.")

    if sensor_pm25 is not None:
        if sensor_pm25 > 60:
            score -= 15
            tips.append(f"Physical sensor reports elevated indoor PM2.5 ({sensor_pm25} µg/m³). Boost purifier fan speed to maximum.")
        elif sensor_pm25 < 25:
            score += 10
            tips.append(f"Physical sensor verifies clean indoor air ({sensor_pm25} µg/m³).")

    final_score = max(20, min(100, score))
    return final_score, tips

@router.get("/assessments", response_model=List[RoomAssessmentOut])
async def get_room_assessments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(RoomAssessment).where(RoomAssessment.user_id == current_user.id))
    rooms = res.scalars().all()
    # Format recommendations from json
    output = []
    for r in rooms:
        tips = json.loads(r.recommendations) if r.recommendations else []
        output.append(RoomAssessmentOut(
            id=r.id,
            room_name=r.room_name,
            room_size_sqft=r.room_size_sqft,
            occupants=r.occupants,
            ventilation_type=r.ventilation_type,
            has_purifier=r.has_purifier,
            purifier_filter_type=r.purifier_filter_type,
            cooking_smoke_exposure=r.cooking_smoke_exposure,
            calculated_score=r.calculated_score,
            recommendations=tips,
            created_at=r.created_at,
            updated_at=r.updated_at
        ))
    return output

@router.post("/assessments", response_model=RoomAssessmentOut, status_code=status.HTTP_201_CREATED)
async def create_room_assessment(
    req: RoomAssessmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    score, tips = calculate_room_health(
        size_sqft=req.room_size_sqft,
        occupants=req.occupants,
        ventilation=req.ventilation_type,
        has_purifier=req.has_purifier,
        filter_type=req.purifier_filter_type,
        cooking_exposure=req.cooking_smoke_exposure,
        sensor_pm25=req.sensor_pm25
    )

    room = RoomAssessment(
        user_id=current_user.id,
        room_name=req.room_name,
        room_size_sqft=req.room_size_sqft,
        occupants=req.occupants,
        ventilation_type=req.ventilation_type,
        has_purifier=req.has_purifier,
        purifier_filter_type=req.purifier_filter_type,
        cooking_smoke_exposure=req.cooking_smoke_exposure,
        calculated_score=score,
        recommendations=json.dumps(tips)
    )
    db.add(room)
    await db.commit()
    await db.refresh(room)

    return RoomAssessmentOut(
        id=room.id,
        room_name=room.room_name,
        room_size_sqft=room.room_size_sqft,
        occupants=room.occupants,
        ventilation_type=room.ventilation_type,
        has_purifier=room.has_purifier,
        purifier_filter_type=room.purifier_filter_type,
        cooking_smoke_exposure=room.cooking_smoke_exposure,
        calculated_score=score,
        recommendations=tips,
        created_at=room.created_at,
        updated_at=room.updated_at
    )

@router.delete("/assessments/{room_id}")
async def delete_room_assessment(
    room_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(RoomAssessment).where(
            RoomAssessment.id == room_id,
            RoomAssessment.user_id == current_user.id
        )
    )
    room = res.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room assessment not found")
    await db.delete(room)
    await db.commit()
    return {"detail": "Room assessment removed"}

@router.get("/ventilation-advice", response_model=VentilationWindowAdvice)
async def get_ventilation_window_advice(
    room_size_sqft: float = Query(180.0, description="Room area in sqft"),
    outdoor_aqi: int = Query(160, description="Current outdoor AQI")
):
    # Air Purifier Clean Air Delivery Rate (CADR) recommendation based on AHAM standard
    # Rule of thumb: CADR (CFM) >= 2/3 of room area in sq ft (assuming 8 ft ceiling for 4.8 air changes per hour)
    recommended_cadr_cfm = round((2.0 / 3.0) * room_size_sqft, 1)

    if outdoor_aqi > 200:
        optimal = ["12:30 PM - 02:30 PM (Brief 15-min burst ventilation)"]
        worst = ["06:00 AM - 09:30 AM (Severe Inversion Peak)", "07:30 PM - 11:00 PM (Nocturnal Stagnation)"]
        advice = (
            "Keep windows firmly shut for most of the day. If room feels stuffy due to CO2 buildup, perform a quick 10-15 minute "
            "cross-ventilation purge between 1:00 PM and 2:00 PM when atmospheric convective lifting is highest, then seal immediately "
            "and run your air purifier on high speed."
        )
    else:
        optimal = ["11:00 AM - 03:30 PM (Optimal Natural Airflow)"]
        worst = ["07:00 AM - 09:00 AM (Rush hour vehicle exhaust)"]
        advice = (
            "Open opposing windows to create natural cross-breeze between late morning and mid-afternoon. "
            "This will naturally dilute volatile organic compounds and CO2 without compromising fine particulate defense."
        )

    return VentilationWindowAdvice(
        optimal_window_opening_hours=optimal,
        worst_window_opening_hours=worst,
        recommendation_text=advice,
        air_purifier_cadre_recommendation_cfm=recommended_cadr_cfm,
        disclaimer=INDOOR_DISCLAIMER
    )
