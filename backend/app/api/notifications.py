from fastapi import APIRouter, Body, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.core.database import get_db
from app.api.auth import get_current_user, get_optional_current_user
from app.models.models import User, NotificationPreference
from app.schemas.schemas import (
    DetailMessageResponse,
    NotificationAlertOut,
    NotificationPreferenceOut,
    NotificationPreferenceUpdate,
)
from app.services.aqi_service import fetch_air_quality_and_weather

router = APIRouter(prefix="/notifications", tags=["Smart Notifications & Alerts"])


@router.get("/preferences", response_model=NotificationPreferenceOut)
async def get_preferences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(NotificationPreference).where(NotificationPreference.user_id == current_user.id))
    pref = res.scalar_one_or_none()
    if not pref:
        pref = NotificationPreference(
            user_id=current_user.id,
            high_aqi_alert=True,
            aqi_threshold=150,
            daily_morning_briefing=True,
            purifier_filter_reminders=True,
            community_challenge_reminders=True,
            quiet_hours_start="22:00",
            quiet_hours_end="07:00",
            preferred_channel="in_app",
        )
        db.add(pref)
        await db.commit()
        await db.refresh(pref)

    return NotificationPreferenceOut(
        high_aqi_alert=pref.high_aqi_alert,
        aqi_threshold=pref.aqi_threshold,
        daily_morning_briefing=pref.daily_morning_briefing,
        purifier_filter_reminders=pref.purifier_filter_reminders,
        community_challenge_reminders=pref.community_challenge_reminders,
        quiet_hours_start=pref.quiet_hours_start,
        quiet_hours_end=pref.quiet_hours_end,
        preferred_channel=pref.preferred_channel,
    )


@router.put("/preferences", response_model=DetailMessageResponse)
async def update_preferences(
    updates: Optional[NotificationPreferenceUpdate] = Body(default=None),
    high_aqi_alert: Optional[bool] = None,
    aqi_threshold: Optional[int] = Query(default=None, ge=25, le=500),
    daily_morning_briefing: Optional[bool] = None,
    purifier_filter_reminders: Optional[bool] = None,
    community_challenge_reminders: Optional[bool] = None,
    quiet_hours_start: Optional[str] = None,
    quiet_hours_end: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(NotificationPreference).where(NotificationPreference.user_id == current_user.id))
    pref = res.scalar_one_or_none()
    if not pref:
        pref = NotificationPreference(user_id=current_user.id)
        db.add(pref)

    payload = updates or NotificationPreferenceUpdate()
    eff_high = payload.high_aqi_alert if payload.high_aqi_alert is not None else high_aqi_alert
    eff_threshold = payload.aqi_threshold if payload.aqi_threshold is not None else aqi_threshold
    eff_briefing = payload.daily_morning_briefing if payload.daily_morning_briefing is not None else daily_morning_briefing
    eff_filter = payload.purifier_filter_reminders if payload.purifier_filter_reminders is not None else purifier_filter_reminders
    eff_comm = payload.community_challenge_reminders if payload.community_challenge_reminders is not None else community_challenge_reminders
    eff_q_start = payload.quiet_hours_start if payload.quiet_hours_start is not None else quiet_hours_start
    eff_q_end = payload.quiet_hours_end if payload.quiet_hours_end is not None else quiet_hours_end

    if eff_high is not None:
        pref.high_aqi_alert = eff_high
    if eff_threshold is not None:
        pref.aqi_threshold = eff_threshold
    if eff_briefing is not None:
        pref.daily_morning_briefing = eff_briefing
    if eff_filter is not None:
        pref.purifier_filter_reminders = eff_filter
    if eff_comm is not None:
        pref.community_challenge_reminders = eff_comm
    if eff_q_start is not None:
        pref.quiet_hours_start = eff_q_start
    if eff_q_end is not None:
        pref.quiet_hours_end = eff_q_end
    if payload.preferred_channel is not None:
        pref.preferred_channel = payload.preferred_channel

    await db.commit()
    return {"detail": "Notification settings updated"}


@router.get("/active-alerts", response_model=List[NotificationAlertOut])
async def get_active_alerts(
    lat: float = Query(28.6139, ge=-90.0, le=90.0),
    lon: float = Query(77.2090, ge=-180.0, le=180.0),
    city: str = Query("Delhi"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
):
    aqi_data = await fetch_air_quality_and_weather(lat, lon, city)
    curr_aqi = aqi_data["current"]["aqi_in"]
    pm25 = aqi_data["current"]["pm2_5"]

    threshold = 150
    if current_user:
        res = await db.execute(select(NotificationPreference).where(NotificationPreference.user_id == current_user.id))
        pref = res.scalar_one_or_none()
        if pref:
            threshold = pref.aqi_threshold

    alerts = []
    if curr_aqi >= threshold:
        alerts.append({
            "id": "alert-aqi-threshold",
            "severity": "high" if curr_aqi > 250 else "warning",
            "title": f"High Pollution Advisory ({city})",
            "message": f"Ambient AQI ({curr_aqi}) exceeds your notification threshold of {threshold}. PM2.5 is at {pm25:.1f} µg/m³.",
            "recommended_action": "Switch outdoor activities indoors and verify bedroom HEPA purifier is operational.",
        })

    hourly = aqi_data.get("hourly", [])
    if len(hourly) >= 3 and hourly[1]["pm2_5"] > (hourly[0]["pm2_5"] * 1.25):
        alerts.append({
            "id": "alert-spike-detected",
            "severity": "warning",
            "title": "Particulate Surge Warning",
            "message": "PM2.5 increased by over 25% across the latest measurement intervals.",
            "recommended_action": "Seal windows before evening thermal inversion traps additional traffic emissions.",
        })

    alerts.append({
        "id": "alert-purifier-check",
        "severity": "info",
        "title": "Air Purifier Filter Maintenance",
        "message": "Routine check: Inspect your pre-filter mesh for coarse dust accumulation to preserve HEPA efficiency.",
        "recommended_action": "Vacuum or wash coarse pre-filter monthly.",
    })

    return alerts
