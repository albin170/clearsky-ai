from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.auth import get_client_rate_key, get_current_user, get_optional_current_user
from app.core.database import get_db
from app.core.security import rate_limiter
from app.models.models import (
    Community,
    CommunityChallenge,
    CommunityMember,
    CommunityReport,
    User,
    UserChallengeParticipation,
)
from app.schemas.schemas import (
    ChallengeCompleteRequest,
    ChallengeJoinRequest,
    CommunityChallengeOut,
    CommunityCreate,
    CommunityOut,
    CommunityReportCreate,
    CommunityReportOut,
    DetailMessageResponse,
)

router = APIRouter(prefix="/community", tags=["Community Action Network"])


@router.get("/list", response_model=List[CommunityOut])
async def list_communities(db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(Community, func.count(CommunityMember.id))
        .outerjoin(CommunityMember, CommunityMember.community_id == Community.id)
        .group_by(Community.id)
    )
    rows = res.all()
    return [
        CommunityOut(
            id=c.id,
            name=c.name,
            city=c.city,
            description=c.description,
            category=c.category,
            members_count=count or 0,
            created_at=c.created_at,
        )
        for c, count in rows
    ]


@router.post("/create", response_model=CommunityOut, status_code=status.HTTP_201_CREATED)
async def create_community(
    request: Request,
    req: CommunityCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    rate_limiter.check_rate_limit(get_client_rate_key(request, "community_create"), max_requests=15, window_seconds=60)
    cleaned_name = req.name.strip()
    if not cleaned_name:
        raise HTTPException(status_code=422, detail="Community name cannot be empty")

    res = await db.execute(select(Community).where(Community.name == cleaned_name))
    if res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Community with this name already exists")

    new_comm = Community(
        name=cleaned_name,
        city=req.city.strip(),
        description=req.description.strip(),
        category=req.category,
        created_by_id=current_user.id,
    )
    db.add(new_comm)
    await db.commit()
    await db.refresh(new_comm)

    db.add(
        CommunityMember(
            community_id=new_comm.id,
            user_id=current_user.id,
            role="admin",
            total_points=50,
        )
    )
    await db.commit()

    return CommunityOut(
        id=new_comm.id,
        name=new_comm.name,
        city=new_comm.city,
        description=new_comm.description,
        category=new_comm.category,
        members_count=1,
        created_at=new_comm.created_at,
    )


@router.post("/join/{community_id}", response_model=DetailMessageResponse)
async def join_community(
    community_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    comm_res = await db.execute(select(Community).where(Community.id == community_id))
    if not comm_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Community not found")

    res = await db.execute(
        select(CommunityMember).where(
            CommunityMember.community_id == community_id,
            CommunityMember.user_id == current_user.id,
        )
    )
    if res.scalar_one_or_none():
        return {"detail": "Already a member of this community"}

    db.add(
        CommunityMember(
            community_id=community_id,
            user_id=current_user.id,
            role="member",
            total_points=25,
        )
    )
    await db.commit()
    return {"detail": "Successfully joined community! Earned 25 welcome points."}


@router.get("/challenges", response_model=List[CommunityChallengeOut])
async def list_challenges(db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(CommunityChallenge, func.count(UserChallengeParticipation.id))
        .outerjoin(
            UserChallengeParticipation,
            UserChallengeParticipation.challenge_id == CommunityChallenge.id,
        )
        .where(CommunityChallenge.is_active.is_(True))
        .group_by(CommunityChallenge.id)
    )
    rows = res.all()
    return [
        CommunityChallengeOut(
            id=ch.id,
            title=ch.title,
            description=ch.description,
            challenge_type=ch.challenge_type,
            points_reward=ch.points_reward,
            duration_days=ch.duration_days,
            participants_count=count or 0,
            is_active=ch.is_active,
        )
        for ch, count in rows
    ]


@router.post("/challenges/join", response_model=DetailMessageResponse)
async def join_challenge(
    req: ChallengeJoinRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ch_res = await db.execute(select(CommunityChallenge).where(CommunityChallenge.id == req.challenge_id))
    if not ch_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Challenge not found")
    res = await db.execute(
        select(UserChallengeParticipation).where(
            UserChallengeParticipation.challenge_id == req.challenge_id,
            UserChallengeParticipation.user_id == current_user.id,
        )
    )
    part = res.scalar_one_or_none()
    if part:
        return {"detail": "You have already joined this challenge", "status": part.status}

    db.add(
        UserChallengeParticipation(
            user_id=current_user.id,
            challenge_id=req.challenge_id,
            status="in_progress",
            progress_days=1,
        )
    )
    await db.commit()
    return {"detail": "Joined challenge successfully! Track your daily actions to complete it."}


@router.post("/challenges/complete", response_model=DetailMessageResponse)
async def complete_challenge(
    req: ChallengeCompleteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(UserChallengeParticipation).where(
            UserChallengeParticipation.challenge_id == req.challenge_id,
            UserChallengeParticipation.user_id == current_user.id,
        )
    )
    part = res.scalar_one_or_none()
    if not part:
        raise HTTPException(status_code=400, detail="You must join the challenge first")

    if part.status == "completed":
        return {"detail": "Challenge already completed", "points_awarded": 0}

    ch_res = await db.execute(select(CommunityChallenge).where(CommunityChallenge.id == req.challenge_id))
    challenge = ch_res.scalar_one_or_none()
    reward = challenge.points_reward if challenge else 100

    part.status = "completed"
    part.self_reported_notes = req.self_reported_notes.strip()
    part.completed_at = datetime.now(timezone.utc)

    mem_res = await db.execute(select(CommunityMember).where(CommunityMember.user_id == current_user.id))
    for m in mem_res.scalars().all():
        m.total_points += reward

    await db.commit()
    return {
        "detail": f"Congratulations! Challenge completed! You earned {reward} Eco Points.",
        "points_awarded": reward,
    }


@router.get("/reports", response_model=List[CommunityReportOut])
async def list_reports(db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(CommunityReport)
        .where(CommunityReport.status != "flagged_spam")
        .order_by(CommunityReport.created_at.desc())
    )
    reports = res.scalars().all()
    return [
        CommunityReportOut(
            id=r.id,
            title=r.title,
            report_type=r.report_type,
            description=r.description,
            latitude=r.latitude,
            longitude=r.longitude,
            address=r.address,
            status=r.status,
            is_anonymous=r.is_anonymous,
            created_at=r.created_at,
            reported_by="Anonymous Neighbor" if r.is_anonymous else "Community Member",
        )
        for r in reports
    ]


@router.post("/reports", response_model=CommunityReportOut, status_code=status.HTTP_201_CREATED)
async def submit_community_report(
    request: Request,
    req: CommunityReportCreate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
):
    rate_limiter.check_rate_limit(get_client_rate_key(request, "community_report"), max_requests=20, window_seconds=60)
    new_report = CommunityReport(
        user_id=current_user.id if current_user else None,
        community_id=req.community_id,
        title=req.title.strip(),
        report_type=req.report_type,
        description=req.description.strip(),
        latitude=req.latitude,
        longitude=req.longitude,
        address=req.address.strip(),
        is_anonymous=req.is_anonymous,
        status="pending",
    )
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)

    return CommunityReportOut(
        id=new_report.id,
        title=new_report.title,
        report_type=new_report.report_type,
        description=new_report.description,
        latitude=new_report.latitude,
        longitude=new_report.longitude,
        address=new_report.address,
        status=new_report.status,
        is_anonymous=new_report.is_anonymous,
        created_at=new_report.created_at,
        reported_by="Anonymous Neighbor" if new_report.is_anonymous else "Community Member",
    )
