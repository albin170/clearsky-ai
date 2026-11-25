from datetime import date, timedelta
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.auth import get_current_user, get_optional_current_user
from app.core.database import get_db
from app.models.models import ImpactLog, User
from app.schemas.schemas import (
    ImpactLogCreate,
    ImpactLogOut,
    ImpactSummaryResponse,
    WhatIfRequest,
    WhatIfResponse,
)
from app.services.emission_service import (
    IMPACT_DISCLAIMER,
    calculate_activity_impact,
    run_what_if_simulation,
)

router = APIRouter(prefix="/impact", tags=["Environmental Impact Tracker"])


@router.get("/summary", response_model=ImpactSummaryResponse)
async def get_impact_summary(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
):
    total_co2 = 0.0
    total_pm25 = 0.0
    total_fuel = 0.0
    total_money = 0.0
    logs_count = 0
    history = []
    is_demo_data = False

    if current_user:
        res = await db.execute(
            select(ImpactLog).where(ImpactLog.user_id == current_user.id).order_by(ImpactLog.log_date.desc())
        )
        logs = res.scalars().all()
        logs_count = len(logs)
        total_co2 = sum(log.co2_saved_kg for log in logs)
        total_pm25 = sum(log.pm25_avoided_g for log in logs)
        total_fuel = sum(log.fuel_saved_liters for log in logs)
        total_money = sum(log.money_saved_estimate for log in logs)

        for log in logs[:10]:
            history.append(
                {
                    "activity": log.activity_type.replace("_", " ").capitalize(),
                    "units": log.units_count,
                    "co2_saved_kg": log.co2_saved_kg,
                    "pm25_avoided_g": log.pm25_avoided_g,
                    "fuel_saved_liters": log.fuel_saved_liters,
                    "date": str(log.log_date),
                }
            )

    if logs_count == 0:
        is_demo_data = True
        total_co2 = 14.8
        total_pm25 = 1.35
        total_fuel = 6.5
        total_money = 680.0
        logs_count = 5
        history = [
            {
                "activity": "Metro commute (Sample)",
                "units": 18.0,
                "co2_saved_kg": 2.75,
                "pm25_avoided_g": 0.25,
                "fuel_saved_liters": 1.35,
                "date": str(date.today()),
            },
            {
                "activity": "Shared office carpool (Sample)",
                "units": 24.0,
                "co2_saved_kg": 2.71,
                "pm25_avoided_g": 0.24,
                "fuel_saved_liters": 1.18,
                "date": str(date.today() - timedelta(days=1)),
            },
            {
                "activity": "Composted household organics (Sample)",
                "units": 5.0,
                "co2_saved_kg": 6.0,
                "pm25_avoided_g": 42.5,
                "fuel_saved_liters": 0.0,
                "date": str(date.today() - timedelta(days=2)),
            },
            {
                "activity": "Active cycling errand (Sample)",
                "units": 6.0,
                "co2_saved_kg": 1.02,
                "pm25_avoided_g": 0.09,
                "fuel_saved_liters": 0.45,
                "date": str(date.today() - timedelta(days=3)),
            },
            {
                "activity": "Conserved 4 kWh power (Sample)",
                "units": 4.0,
                "co2_saved_kg": 2.84,
                "pm25_avoided_g": 0.05,
                "fuel_saved_liters": 0.0,
                "date": str(date.today() - timedelta(days=4)),
            },
        ]

    eco_score = min(100, int(55 + (logs_count * 5) + (total_co2 * 0.8)))

    return ImpactSummaryResponse(
        total_co2_avoided_kg=round(total_co2, 2),
        total_pm25_avoided_g=round(total_pm25, 2),
        total_fuel_saved_liters=round(total_fuel, 2),
        total_money_saved_estimate=round(total_money, 1),
        activities_completed_count=logs_count,
        daily_history=history,
        methodology_note=IMPACT_DISCLAIMER,
        eco_score=eco_score,
        is_demo_data=is_demo_data,
    )


@router.post("/log", response_model=ImpactLogOut)
async def log_impact_activity(
    req: ImpactLogCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    metrics = calculate_activity_impact(req.activity_type, req.units_count)

    new_log = ImpactLog(
        user_id=current_user.id,
        activity_type=req.activity_type,
        units_count=req.units_count,
        co2_saved_kg=metrics["co2_saved_kg"],
        pm25_avoided_g=metrics["pm25_avoided_g"],
        fuel_saved_liters=metrics["fuel_saved_liters"],
        money_saved_estimate=metrics["money_saved_estimate"],
        log_date=date.today(),
    )
    db.add(new_log)
    await db.commit()

    return ImpactLogOut(
        detail="Impact activity logged successfully!",
        co2_saved_kg=round(metrics["co2_saved_kg"], 2),
        pm25_avoided_g=round(metrics["pm25_avoided_g"], 2),
        fuel_saved_liters=round(metrics["fuel_saved_liters"], 2),
        money_saved_estimate=round(metrics["money_saved_estimate"], 1),
    )


@router.post("/what-if", response_model=WhatIfResponse)
async def what_if_simulator(req: WhatIfRequest):
    result = run_what_if_simulation(
        participating_families=req.participating_families,
        avg_commute_km=req.avg_commute_km,
        shift_mode=req.shift_mode,
    )
    return WhatIfResponse(**result)
