from typing import List, Optional
from fastapi import APIRouter, Query, Request
from app.api.auth import get_client_rate_key
from app.core.security import rate_limiter
from app.schemas.schemas import (
    ReelCommentAddedOut,
    ReelCommentCreate,
    ReelCreate,
    ReelLikeOut,
    ReelOut,
    ReelSaveOut,
)
from app.services.reels_service import reels_repository

router = APIRouter(prefix="/reels", tags=["EcoReels Environmental Shorts"])


@router.get("", response_model=List[ReelOut])
def get_reels(
    category: Optional[str] = Query(
        None,
        max_length=40,
        description="Filter reels by category (smog_alert, health, home_hacks, stubble_fire, tech)",
    ),
    search: Optional[str] = Query(None, max_length=120, description="Search reels by title, tag, or creator"),
):
    """Retrieve environmental reels for the vertical short-video feed."""
    return reels_repository.list_reels(category=category, search=search)


@router.get("/{reel_id}", response_model=ReelOut)
def get_reel_by_id(reel_id: str):
    """Retrieve a single environmental reel by ID."""
    return reels_repository.get_by_id(reel_id)


@router.post("/{reel_id}/like", response_model=ReelLikeOut)
def toggle_reel_like(request: Request, reel_id: str):
    """Toggle like state on an environmental reel."""
    rate_limiter.check_rate_limit(get_client_rate_key(request, "reel_like"), max_requests=60, window_seconds=60)
    return reels_repository.toggle_like(reel_id)


@router.post("/{reel_id}/save", response_model=ReelSaveOut)
def toggle_reel_save(request: Request, reel_id: str):
    """Toggle bookmark/save state on an environmental reel."""
    rate_limiter.check_rate_limit(get_client_rate_key(request, "reel_save"), max_requests=60, window_seconds=60)
    return reels_repository.toggle_save(reel_id)


@router.post("/{reel_id}/comments", response_model=ReelCommentAddedOut)
def add_reel_comment(request: Request, reel_id: str, comment: ReelCommentCreate):
    """Add a viewer comment to an environmental reel."""
    rate_limiter.check_rate_limit(get_client_rate_key(request, "reel_comment"), max_requests=20, window_seconds=60)
    return reels_repository.add_comment(reel_id, comment)


@router.post("", status_code=201, response_model=ReelOut)
def create_reel(request: Request, payload: ReelCreate):
    """Create a community environmental awareness reel."""
    rate_limiter.check_rate_limit(get_client_rate_key(request, "reel_create"), max_requests=15, window_seconds=60)
    return reels_repository.create_reel(payload)
