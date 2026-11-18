from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from app.core.database import get_db
from app.api.auth import get_current_user, get_optional_current_user
from app.models.models import (
    User, Community, CommunityMember, CommunityChallenge, 
    UserChallengeParticipation, CommunityReport, AuditLog
)
from app.schemas.schemas import (
    CommunityCreate, CommunityOut, CommunityChallengeOut,
    ChallengeJoinRequest, ChallengeCompleteRequest,
    CommunityReportCreate, CommunityReportOut
)

router = APIRouter(prefix="/community", tags=["Community Action Network"])

@router.get("/list", response_model=List[CommunityOut])
async def list_communities(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Community))
    comms = res.scalars().all()
    
    output = []
    for c in comms:
        # Count members
        cnt_res = await db.execute(
            select(func.count(CommunityMember.id)).where(CommunityMember.community_id == c.id)
        )
        count = cnt_res.scalar() or 0
        output.append(CommunityOut(
            id=c.id,
            name=c.name,
            city=c.city,
            description=c.description,
            category=c.category,
            members_count=count,
            created_at=c.created_at
        ))
    return output

@router.post("/create", response_model=CommunityOut, status_code=status.HTTP_201_CREATED)
async def create_community(
    req: CommunityCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check duplicate
    res = await db.execute(select(Community).where(Community.name == req.name))
    if res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Community with this name already exists")

    new_comm = Community(
        name=req.name,
        city=req.city,
        description=req.description,
        category=req.category,
        created_by_id=current_user.id
    )
    db.add(new_comm)
    await db.commit()
    await db.refresh(new_comm)

    # Add creator as admin member
    membership = CommunityMember(
        community_id=new_comm.id,
        user_id=current_user.id,
        role="admin",
        total_points=50
    )
    db.add(membership)
    await db.commit()

    return CommunityOut(
        id=new_comm.id,
        name=new_comm.name,
        city=new_comm.city,
        description=new_comm.description,
        category=new_comm.category,
        members_count=1,
        created_at=new_comm.created_at
    )

@router.post("/join/{community_id}")
async def join_community(
    community_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check if already joined
    res = await db.execute(
        select(CommunityMember).where(
            CommunityMember.community_id == community_id,
            CommunityMember.user_id == current_user.id
        )
    )
    if res.scalar_one_or_none():
        return {"detail": "Already a member of this community"}

    membership = CommunityMember(
        community_id=community_id,
        user_id=current_user.id,
        role="member",
        total_points=25
    )
    db.add(membership)
    await db.commit()
    return {"detail": "Successfully joined community! Earned 25 welcome points."}

@router.get("/challenges", response_model=List[CommunityChallengeOut])
async def list_challenges(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(CommunityChallenge).where(CommunityChallenge.is_active == True))
    challenges = res.scalars().all()
    
    output = []
    for ch in challenges:
        cnt_res = await db.execute(
            select(func.count(UserChallengeParticipation.id)).where(UserChallengeParticipation.challenge_id == ch.id)
        )
        count = cnt_res.scalar() or 0
        output.append(CommunityChallengeOut(
            id=ch.id,
            title=ch.title,
            description=ch.description,
            challenge_type=ch.challenge_type,
            points_reward=ch.points_reward,
            duration_days=ch.duration_days,
            participants_count=count,
            is_active=ch.is_active
        ))
    return output

@router.post("/challenges/join")
async def join_challenge(
    req: ChallengeJoinRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(UserChallengeParticipation).where(
            UserChallengeParticipation.challenge_id == req.challenge_id,
            UserChallengeParticipation.user_id == current_user.id
        )
    )
    part = res.scalar_one_or_none()
    if part:
        return {"detail": "You have already joined this challenge", "status": part.status}

    new_part = UserChallengeParticipation(
        user_id=current_user.id,
        challenge_id=req.challenge_id,
        status="in_progress",
        progress_days=1
    )
    db.add(new_part)
    await db.commit()
    return {"detail": "Joined challenge successfully! Track your daily actions to complete it."}

@router.post("/challenges/complete")
async def complete_challenge(
    req: ChallengeCompleteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(UserChallengeParticipation).where(
            UserChallengeParticipation.challenge_id == req.challenge_id,
            UserChallengeParticipation.user_id == current_user.id
        )
    )
    part = res.scalar_one_or_none()
    if not part:
        raise HTTPException(status_code=400, detail="You must join the challenge first")

    ch_res = await db.execute(select(CommunityChallenge).where(CommunityChallenge.id == req.challenge_id))
    challenge = ch_res.scalar_one_or_none()
    reward = challenge.points_reward if challenge else 100

    part.status = "completed"
    part.self_reported_notes = req.self_reported_notes
    part.completed_at = datetime.now(timezone.utc)

    # Award points to community memberships
    mem_res = await db.execute(select(CommunityMember).where(CommunityMember.user_id == current_user.id))
    memberships = mem_res.scalars().all()
    for m in memberships:
        m.total_points += reward

    await db.commit()
    return {
        "detail": f"Congratulations! Challenge completed! You earned {reward} Eco Points.",
        "points_awarded": reward
    }

@router.get("/reports", response_model=List[CommunityReportOut])
async def list_reports(
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(CommunityReport).where(CommunityReport.status != "flagged_spam").order_by(CommunityReport.created_at.desc())
    )
    reports = res.scalars().all()
    
    output = []
    for r in reports:
        reported_by = "Anonymous Neighbor" if r.is_anonymous else "Community Member"
        output.append(CommunityReportOut(
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
            reported_by=reported_by
        ))
    return output

@router.post("/reports", response_model=CommunityReportOut, status_code=status.HTTP_201_CREATED)
async def submit_community_report(
    req: CommunityReportCreate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    new_report = CommunityReport(
        user_id=current_user.id if current_user else None,
        community_id=req.community_id,
        title=req.title,
        report_type=req.report_type,
        description=req.description,
        latitude=req.latitude,
        longitude=req.longitude,
        address=req.address,
        is_anonymous=req.is_anonymous,
        status="pending"
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
        reported_by="Anonymous Neighbor" if new_report.is_anonymous else "Community Member"
    )
