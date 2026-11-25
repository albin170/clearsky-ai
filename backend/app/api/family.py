from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.auth import get_current_user
from app.core.database import get_db
from app.models.models import FamilyMember, User
from app.schemas.schemas import (
    DetailMessageResponse,
    FamilyDailyPlanResponse,
    FamilyMemberCreate,
    FamilyMemberOut,
)
from app.services.aqi_service import fetch_air_quality_and_weather
from app.services.family_service import build_family_daily_plan

router = APIRouter(prefix="/family", tags=["Family Lifestyle Intelligence"])


@router.get("/members", response_model=List[FamilyMemberOut])
async def get_family_members(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(FamilyMember).where(FamilyMember.user_id == current_user.id))
    return res.scalars().all()


@router.post("/members", response_model=FamilyMemberOut, status_code=status.HTTP_201_CREATED)
async def create_family_member(
    member_in: FamilyMemberCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cleaned_name = member_in.name.strip()
    if not cleaned_name:
        raise HTTPException(status_code=422, detail="Member name cannot be empty")

    member = FamilyMember(
        user_id=current_user.id,
        name=cleaned_name,
        relation=member_in.relation,
        age_group=member_in.age_group,
        sensitivity_profile=member_in.sensitivity_profile,
        activity_preferences=member_in.activity_preferences,
    )
    db.add(member)
    await db.commit()
    await db.refresh(member)
    return member


@router.delete("/members/{member_id}", response_model=DetailMessageResponse)
async def delete_family_member(
    member_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(FamilyMember).where(
            FamilyMember.id == member_id,
            FamilyMember.user_id == current_user.id,
        )
    )
    member = res.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Family member profile not found")
    await db.delete(member)
    await db.commit()
    return {"detail": "Family member profile removed"}


@router.get("/daily-plan", response_model=FamilyDailyPlanResponse)
async def get_family_daily_plan(
    lat: float = Query(28.6139, ge=-90.0, le=90.0),
    lon: float = Query(77.2090, ge=-180.0, le=180.0),
    city: str = Query("Delhi", max_length=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(FamilyMember).where(FamilyMember.user_id == current_user.id))
    members = res.scalars().all()
    aqi_data = await fetch_air_quality_and_weather(lat, lon, city)
    return build_family_daily_plan(members=members, aqi_data=aqi_data, city=city)
