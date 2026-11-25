import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.auth import get_current_user
from app.core.database import get_db
from app.models.models import RoomAssessment, User
from app.schemas.schemas import (
    DetailMessageResponse,
    RoomAssessmentCreate,
    RoomAssessmentOut,
    VentilationWindowAdvice,
)
from app.services.indoor_service import build_ventilation_window_advice, calculate_room_health

router = APIRouter(prefix="/indoor", tags=["Indoor Air Quality Optimizer"])


@router.get("/assessments", response_model=List[RoomAssessmentOut])
async def get_room_assessments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(RoomAssessment).where(RoomAssessment.user_id == current_user.id))
    rooms = res.scalars().all()
    return [
        RoomAssessmentOut(
            id=r.id,
            room_name=r.room_name,
            room_size_sqft=r.room_size_sqft,
            occupants=r.occupants,
            ventilation_type=r.ventilation_type,
            has_purifier=r.has_purifier,
            purifier_filter_type=r.purifier_filter_type,
            cooking_smoke_exposure=r.cooking_smoke_exposure,
            calculated_score=r.calculated_score,
            recommendations=json.loads(r.recommendations) if r.recommendations else [],
            created_at=r.created_at,
            updated_at=r.updated_at,
        )
        for r in rooms
    ]


@router.post("/assessments", response_model=RoomAssessmentOut, status_code=status.HTTP_201_CREATED)
async def create_room_assessment(
    req: RoomAssessmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cleaned_name = req.room_name.strip()
    if not cleaned_name:
        raise HTTPException(status_code=422, detail="Room name cannot be empty")

    score, tips = calculate_room_health(
        size_sqft=req.room_size_sqft,
        occupants=req.occupants,
        ventilation=req.ventilation_type,
        has_purifier=req.has_purifier,
        filter_type=req.purifier_filter_type,
        cooking_exposure=req.cooking_smoke_exposure,
        sensor_pm25=req.sensor_pm25,
    )

    room = RoomAssessment(
        user_id=current_user.id,
        room_name=cleaned_name,
        room_size_sqft=req.room_size_sqft,
        occupants=req.occupants,
        ventilation_type=req.ventilation_type,
        has_purifier=req.has_purifier,
        purifier_filter_type=req.purifier_filter_type,
        cooking_smoke_exposure=req.cooking_smoke_exposure,
        calculated_score=score,
        recommendations=json.dumps(tips),
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
        updated_at=room.updated_at,
    )


@router.delete("/assessments/{room_id}", response_model=DetailMessageResponse)
async def delete_room_assessment(
    room_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(RoomAssessment).where(
            RoomAssessment.id == room_id,
            RoomAssessment.user_id == current_user.id,
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
    room_size_sqft: float = Query(180.0, gt=0.0, le=50000.0, description="Room area in sqft"),
    outdoor_aqi: int = Query(160, ge=0, le=1000, description="Current outdoor AQI"),
):
    return build_ventilation_window_advice(room_size_sqft=room_size_sqft, outdoor_aqi=outdoor_aqi)
