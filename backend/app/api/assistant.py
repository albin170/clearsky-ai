import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.auth import get_client_rate_key, get_optional_current_user
from app.core.database import get_db
from app.core.security import rate_limiter
from app.models.models import AssistantConversation, AssistantMessage, FamilyMember, User
from app.schemas.schemas import (
    AssistantChatRequest,
    AssistantChatResponse,
    DailyBriefingResponse,
    SuggestedQuestionsResponse,
)
from app.services.aqi_service import fetch_air_quality_and_weather
from app.services.gemini_service import generate_assistant_response

router = APIRouter(prefix="/assistant", tags=["ClearSky AI Assistant"])

SUGGESTED_QUESTIONS_EN = [
    "Is it safe to go jogging or exercise outdoors right now?",
    "When is the best time to open my windows today for ventilation?",
    "How can I protect my children and elderly family members from winter smog?",
    "What are the most cost-effective indoor air quality improvements?",
    "How much carbon and particulate emissions can my family avoid by taking the metro?",
]

SUGGESTED_QUESTIONS_ML = [
    "ഇന്ന് പുറത്തിറങ്ങി വ്യായാമം ചെയ്യുകയോ നടക്കുകയോ ചെയ്യുന്നത് സുരക്ഷിതമാണോ?",
    "വീടിനകത്ത് ശുദ്ധവായു ലഭിക്കാൻ ജനലുകൾ തുറന്നിടാൻ ഏറ്റവും അനുയോജ്യമായ സമയം ഏതാണ്?",
    "ശൈത്യകാലത്തെ പുകമഞ്ഞിൽ നിന്ന് കുട്ടികളെയും പ്രായമായവരെയും എങ്ങനെ സംരക്ഷിക്കാം?",
    "വീട്ടിനുള്ളിലെ വായുമലിനീകരണം കുറയ്ക്കാൻ എന്ത് മുൻകരുതലുകൾ എടുക്കണം?",
    "മെട്രോ അല്ലെങ്കിൽ പൊതുഗതാഗതം ഉപയോഗിക്കുന്നത് വഴി എത്രമാത്രം മലിനീകരണം കുറയ്ക്കാം?",
]


@router.get("/suggested-questions", response_model=SuggestedQuestionsResponse)
async def get_suggested_questions(lang: str = Query("en", max_length=10)):
    if lang == "ml":
        return {"language": "ml", "questions": SUGGESTED_QUESTIONS_ML}
    return {"language": "en", "questions": SUGGESTED_QUESTIONS_EN}


@router.post("/chat", response_model=AssistantChatResponse)
async def chat_with_assistant(
    request: Request,
    req: AssistantChatRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
):
    rate_limiter.check_rate_limit(get_client_rate_key(request, "assistant_chat"), max_requests=30, window_seconds=60)
    cleaned_msg = req.message.strip()
    if not cleaned_msg:
        raise HTTPException(status_code=422, detail="Message cannot be empty")

    lat = req.lat if req.lat is not None else (current_user.default_lat if current_user and current_user.default_lat else 28.6139)
    lon = req.lon if req.lon is not None else (current_user.default_lon if current_user and current_user.default_lon else 77.2090)
    city = req.location_name or (current_user.default_city if current_user and current_user.default_city else "your location")

    aqi_data = await fetch_air_quality_and_weather(lat, lon, city)

    family_data = []
    conversation = None
    if current_user:
        fam_res = await db.execute(select(FamilyMember).where(FamilyMember.user_id == current_user.id))
        members = fam_res.scalars().all()
        family_data = [
            {
                "name": m.name,
                "relation": m.relation,
                "age_group": m.age_group,
                "sensitivity_profile": m.sensitivity_profile,
            }
            for m in members
        ]

        if req.conversation_id:
            conv_res = await db.execute(
                select(AssistantConversation).where(
                    AssistantConversation.id == req.conversation_id,
                    AssistantConversation.user_id == current_user.id,
                )
            )
            conversation = conv_res.scalar_one_or_none()

        if not conversation:
            conv_title = cleaned_msg[:40] + ("..." if len(cleaned_msg) > 40 else "")
            conversation = AssistantConversation(
                user_id=current_user.id,
                title=conv_title,
                language=req.language,
            )
            db.add(conversation)
            await db.commit()
            await db.refresh(conversation)

        db.add(
            AssistantMessage(
                conversation_id=conversation.id,
                role="user",
                content=cleaned_msg,
            )
        )
        await db.commit()

    ai_result = await generate_assistant_response(
        user_query=cleaned_msg,
        language=req.language,
        current_aqi_data=aqi_data,
        family_members_data=family_data,
        city_name=city,
    )

    conv_id = conversation.id if conversation else 0

    if current_user and conversation:
        db.add(
            AssistantMessage(
                conversation_id=conversation.id,
                role="assistant",
                content=ai_result["content"],
                structured_data=json.dumps(ai_result.get("structured_advice")),
            )
        )
        await db.commit()

    return {
        "conversation_id": conv_id,
        "role": "assistant",
        "content": ai_result["content"],
        "language": req.language,
        "structured_advice": ai_result.get("structured_advice"),
        "sources_cited": ai_result.get("sources_cited", []),
        "disclaimer": ai_result.get("disclaimer", ""),
    }


@router.get("/daily-briefing", response_model=DailyBriefingResponse)
async def get_daily_environmental_briefing(
    lat: float = Query(28.6139, ge=-90.0, le=90.0),
    lon: float = Query(77.2090, ge=-180.0, le=180.0),
    city: str = Query("Delhi", max_length=100),
    lang: str = Query("en", max_length=10),
):
    aqi_data = await fetch_air_quality_and_weather(lat, lon, city)
    curr = aqi_data["current"]
    w = aqi_data["weather"]

    if lang == "ml":
        briefing_text = (
            f"സുപ്രഭാതം! {city}-ൽ ഇന്നത്തെ എക്യുഐ {curr['aqi_in']} ({curr['category_in']}) ആണ്. "
            f"പ്രധാന മലിനീകരണ ഘടകം {curr['dominant_pollutant']} (PM2.5: {curr['pm2_5']} µg/m³). "
            f"താപനില {w['temperature_c']}°C, കാറ്റ് {w['wind_speed_kmh']} km/h വേഗതയിൽ വീശുന്നു. "
            f"രാവിലെ പുറത്തിറങ്ങുമ്പോൾ മാസ്ക് ധരിക്കാൻ ശ്രദ്ധിക്കുക. ഉച്ചസമയത്ത് ജനലുകൾ തുറന്ന് വായുസഞ്ചാരം ഉറപ്പാക്കുക."
        )
    else:
        briefing_text = (
            f"Good morning! In {city}, today's AQI is {curr['aqi_in']} ({curr['category_in']}). "
            f"Dominant pollutant is {curr['dominant_pollutant']} with PM2.5 at {curr['pm2_5']} µg/m³. "
            f"Atmospheric conditions: {w['temperature_c']}°C with {w['wind_speed_kmh']} km/h winds ({w['weather_description']}). "
            f"Keep windows closed during early morning inversion peaks and plan outdoor activities for mid-afternoon."
        )

    return {
        "date": aqi_data["daily"][0]["date"],
        "city": city,
        "aqi": curr["aqi_in"],
        "category": curr["category_in"],
        "briefing": briefing_text,
        "key_action": "Switch today's routine car trip to public transit or carpooling to reduce community emissions.",
        "language": lang,
    }
