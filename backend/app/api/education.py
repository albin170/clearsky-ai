from typing import List
from fastapi import APIRouter, Query
from app.schemas.schemas import EducationalTopicOut, QuizQuestionOut
from app.services.education_service import (
    get_daily_facts_by_language,
    get_quiz_questions,
    get_topics_by_language,
)

router = APIRouter(prefix="/education", tags=["Educational Environmental Intelligence"])


@router.get("/topics", response_model=List[EducationalTopicOut])
async def get_educational_topics(lang: str = Query("en", max_length=10)):
    return get_topics_by_language(lang)


@router.get("/quiz", response_model=List[QuizQuestionOut])
async def get_quiz():
    return get_quiz_questions()


@router.get("/daily-facts", response_model=List[str])
async def get_daily_facts(lang: str = Query("en", max_length=10)):
    return get_daily_facts_by_language(lang)
