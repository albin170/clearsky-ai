from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import date
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, FamilyMember
from app.schemas.schemas import FamilyMemberCreate, FamilyMemberOut, FamilyDailyPlanResponse, FamilyPlanActivity
from app.services.aqi_service import fetch_air_quality_and_weather

router = APIRouter(prefix="/family", tags=["Family Lifestyle Intelligence"])

@router.get("/members", response_model=List[FamilyMemberOut])
async def get_family_members(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(FamilyMember).where(FamilyMember.user_id == current_user.id))
    return res.scalars().all()

@router.post("/members", response_model=FamilyMemberOut, status_code=status.HTTP_201_CREATED)
async def create_family_member(
    member_in: FamilyMemberCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    member = FamilyMember(
        user_id=current_user.id,
        name=member_in.name,
        relation=member_in.relation,
        age_group=member_in.age_group,
        sensitivity_profile=member_in.sensitivity_profile,
        activity_preferences=member_in.activity_preferences
    )
    db.add(member)
    await db.commit()
    await db.refresh(member)
    return member

@router.delete("/members/{member_id}")
async def delete_family_member(
    member_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(FamilyMember).where(
            FamilyMember.id == member_id,
            FamilyMember.user_id == current_user.id
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
    lat: float = Query(28.6139),
    lon: float = Query(77.2090),
    city: str = Query("Delhi"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch members
    res = await db.execute(select(FamilyMember).where(FamilyMember.user_id == current_user.id))
    members = res.scalars().all()

    # Fetch live AQI
    aqi_data = await fetch_air_quality_and_weather(lat, lon, city)
    curr_aqi = aqi_data["current"]["aqi_in"]
    category = aqi_data["current"]["category_in"]
    pm25 = aqi_data["current"]["pm2_5"]

    activities: List[FamilyPlanActivity] = []

    # If no family members yet, provide smart general household activities
    target_names = [m.name for m in members] if members else ["Household"]

    for name in target_names:
        # Match member specific profile if available
        mem_obj = next((m for m in members if m.name == name), None)
        sens = mem_obj.sensitivity_profile if mem_obj else "standard"
        age = mem_obj.age_group if mem_obj else "adult"

        if curr_aqi > 200:
            activities.append(FamilyPlanActivity(
                period="Morning (07:00 - 10:00)",
                target_member=name,
                recommendation="Replace outdoor jogging/sports with 30-min indoor functional exercise in filtered room.",
                reason=f"Morning thermal inversion traps {pm25:.1f} µg/m³ PM2.5 near ground level. Aerobic breathing elevates deep alveolar deposition.",
                expected_benefit="Prevents airway hyper-reactivity, coughing spells, and acute cardiovascular strain.",
                estimated_cost="₹0 (Free)",
                difficulty="Low",
                environmental_impact="Reduces vehicle cold-starts if avoiding morning drive to gym.",
                source="WHO Global Air Quality Guidelines 2021"
            ))
            activities.append(FamilyPlanActivity(
                period="Afternoon (12:00 - 15:30)",
                target_member=name,
                recommendation="Travel via metro or air-conditioned bus; wear an N95 respirator if walking on arterial streets.",
                reason="Solar convection provides temporary atmospheric lifting, but roadside diesel exhaust remains concentrated.",
                expected_benefit="Filters out up to 95% of fine combustion soot and toxic particulate matter.",
                estimated_cost="₹30 - ₹50 (N95 mask reusable)",
                difficulty="Low",
                environmental_impact="Public transit reduces personal tailpipe footprint by ~78%.",
                source="Central Pollution Control Board Guidelines"
            ))
            activities.append(FamilyPlanActivity(
                period="Evening (18:00 - 22:00)",
                target_member=name,
                recommendation="Keep bedroom windows sealed; run HEPA purifier on continuous medium mode and prepare a clean sleeping zone.",
                reason="Nocturnal cooling drops the planetary boundary layer, causing nocturnal smog spikes.",
                expected_benefit="Lowers indoor nighttime PM2.5 exposure to < 15 µg/m³, ensuring restorative sleep.",
                estimated_cost="~₹4/day in electricity for HEPA fan",
                difficulty="Easy",
                environmental_impact="Conserves household heat and minimizes indoor infiltration.",
                source="US EPA Indoor Air Quality Guidelines"
            ))
        else:
            activities.append(FamilyPlanActivity(
                period="Morning (07:00 - 09:30)",
                target_member=name,
                recommendation="Enjoy outdoor morning walk or light sports in nearby green park or tree-lined street.",
                reason=f"Current AQI is {curr_aqi} ({category}), allowing safe ambient breathing for active members.",
                expected_benefit="Boosts vitamin D synthesis, cardiovascular endurance, and mental clarity.",
                estimated_cost="₹0",
                difficulty="Easy",
                environmental_impact="Walking creates zero emissions.",
                source="WHO Physical Activity & Air Quality Directives"
            ))
            activities.append(FamilyPlanActivity(
                period="Afternoon (11:30 - 15:00)",
                target_member=name,
                recommendation="Open windows for cross-ventilation for 25 minutes to flush indoor CO2 and cooking vapors.",
                reason="Atmospheric dispersion is highest midday with lowest ambient particulate density.",
                expected_benefit="Refreshes indoor oxygen levels, preventing afternoon drowsiness and indoor stale air.",
                estimated_cost="₹0",
                difficulty="Easy",
                environmental_impact="Zero energy consumption for natural air exchange.",
                source="ASHRAE Standard 62.1 Indoor Air Quality"
            ))
            activities.append(FamilyPlanActivity(
                period="Evening (17:30 - 20:30)",
                target_member=name,
                recommendation="Combine neighborhood errands into a single walking or cycling trip instead of taking a motorbike or car.",
                reason="Short vehicle trips with cold engines emit disproportionate amounts of unburned hydrocarbons and CO.",
                expected_benefit="Avoids peak traffic frustration and saves vehicle wear-and-tear.",
                estimated_cost="Saves ₹40 - ₹80 in fuel",
                difficulty="Easy",
                environmental_impact="Eliminates ~0.85 kg CO2 and 0.08 g PM2.5 tailpipe pollution.",
                source="ARAI Automotive Environmental Emission Study"
            ))

    overview = (
        f"Customized daily protection and lifestyle roadmap for {len(target_names)} household profile(s) "
        f"based on current {category} conditions (AQI {curr_aqi}) in {city}."
    )

    return FamilyDailyPlanResponse(
        date=date.today().isoformat(),
        aqi_context=curr_aqi,
        aqi_category=category,
        activities=activities,
        overview=overview
    )
