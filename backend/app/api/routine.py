import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, DailyRoutine
from app.schemas.schemas import RoutineCreate, RoutineOut, SustainableAlternative
from app.services.emission_service import calculate_commute_emissions, generate_sustainable_routine_alternatives

router = APIRouter(prefix="/routine", tags=["Low-Emission Daily Routine Generator"])

@router.get("/my-routine", response_model=Optional[RoutineOut])
async def get_my_routine(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(DailyRoutine).where(
            DailyRoutine.user_id == current_user.id,
            DailyRoutine.active == True
        ).order_by(DailyRoutine.created_at.desc())
    )
    routine = res.scalars().first()
    if not routine:
        return None

    alternatives = generate_sustainable_routine_alternatives(
        routine.commute_mode, 
        routine.daily_distance_km
    )

    return RoutineOut(
        id=routine.id,
        commute_mode=routine.commute_mode,
        daily_distance_km=routine.daily_distance_km,
        schedule_type=routine.schedule_type,
        estimated_daily_co2_kg=routine.estimated_daily_co2_kg,
        estimated_daily_pm25_g=routine.estimated_daily_pm25_g,
        alternatives=[SustainableAlternative(**alt) for alt in alternatives],
        created_at=routine.created_at
    )

@router.post("/generate", response_model=RoutineOut)
async def generate_routine(
    req: RoutineCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    emissions = calculate_commute_emissions(req.commute_mode, req.daily_distance_km)
    alternatives = generate_sustainable_routine_alternatives(req.commute_mode, req.daily_distance_km)

    new_routine = DailyRoutine(
        user_id=current_user.id,
        commute_mode=req.commute_mode,
        daily_distance_km=req.daily_distance_km,
        schedule_type=req.schedule_type,
        estimated_daily_co2_kg=emissions["co2_kg"],
        estimated_daily_pm25_g=emissions["pm25_g"],
        alternatives_selected=json.dumps(alternatives),
        active=True
    )
    db.add(new_routine)
    await db.commit()
    await db.refresh(new_routine)

    return RoutineOut(
        id=new_routine.id,
        commute_mode=new_routine.commute_mode,
        daily_distance_km=new_routine.daily_distance_km,
        schedule_type=new_routine.schedule_type,
        estimated_daily_co2_kg=new_routine.estimated_daily_co2_kg,
        estimated_daily_pm25_g=new_routine.estimated_daily_pm25_g,
        alternatives=[SustainableAlternative(**alt) for alt in alternatives],
        created_at=new_routine.created_at
    )
