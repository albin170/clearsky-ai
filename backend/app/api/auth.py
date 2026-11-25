from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    decode_access_token,
    get_password_hash,
    oauth2_scheme,
    rate_limiter,
    verify_password,
)
from app.models.models import AuditLog, User
from app.schemas.schemas import DetailMessageResponse, Token, UserCreate, UserLogin, UserOut, UserUpdate

router = APIRouter(prefix="/auth", tags=["Authentication"])


def get_client_rate_key(request: Request, action: str) -> str:
    host = request.client.host if request.client else "unknown"
    return f"{action}:{host}"


async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token or expired session")
    user_id = payload.get("sub")
    try:
        uid = int(user_id)
    except (TypeError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")

    result = await db.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account")
    return user


async def get_optional_current_user(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)
) -> User | None:
    if not token:
        return None
    try:
        return await get_current_user(token, db)
    except HTTPException:
        return None


def require_role(allowed_roles: list[str]):
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: Insufficient administrative privileges",
            )
        return current_user

    return role_checker


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(request: Request, user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    rate_limiter.check_rate_limit(get_client_rate_key(request, "register"), max_requests=20, window_seconds=60)

    normalized_email = user_in.email.strip().lower()
    cleaned_name = user_in.full_name.strip()
    if not cleaned_name:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Full name cannot be empty")

    res = await db.execute(select(User).where(User.email == normalized_email))
    if res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered")

    user_count = (await db.execute(select(func.count(User.id)))).scalar() or 0
    role = "super_admin" if user_count == 0 else "standard_user"

    new_user = User(
        email=normalized_email,
        full_name=cleaned_name,
        hashed_password=get_password_hash(user_in.password),
        role=role,
        preferred_language=user_in.preferred_language,
        default_city=user_in.default_city,
        default_lat=user_in.default_lat,
        default_lon=user_in.default_lon,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    db.add(
        AuditLog(
            user_id=new_user.id,
            action="USER_REGISTERED",
            ip_address=request.client.host if request.client else None,
            details=f"User #{new_user.id} registered with role {role}",
        )
    )
    await db.commit()

    token = create_access_token(subject=new_user.id, extra_claims={"role": new_user.role})
    return {"access_token": token, "token_type": "bearer", "user": new_user}


@router.post("/login", response_model=Token)
async def login(request: Request, credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    rate_limiter.check_rate_limit(get_client_rate_key(request, "login"), max_requests=20, window_seconds=60)

    normalized_email = credentials.email.strip().lower()
    res = await db.execute(select(User).where(User.email == normalized_email))
    user = res.scalar_one_or_none()
    if not user or not verify_password(credentials.password, user.hashed_password):
        db.add(
            AuditLog(
                user_id=user.id if user else None,
                action="USER_LOGIN_FAILED",
                ip_address=request.client.host if request.client else None,
                details="Invalid authentication attempt",
            )
        )
        await db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

    db.add(
        AuditLog(
            user_id=user.id,
            action="USER_LOGIN",
            ip_address=request.client.host if request.client else None,
            details=f"User #{user.id} authenticated",
        )
    )
    await db.commit()

    token = create_access_token(subject=user.id, extra_claims={"role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserOut)
async def update_profile(
    updates: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if updates.full_name is not None:
        cleaned = updates.full_name.strip()
        if not cleaned:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Full name cannot be empty")
        current_user.full_name = cleaned
    if updates.preferred_language is not None:
        current_user.preferred_language = updates.preferred_language
    if updates.default_city is not None:
        current_user.default_city = updates.default_city
    if updates.default_lat is not None:
        current_user.default_lat = updates.default_lat
    if updates.default_lon is not None:
        current_user.default_lon = updates.default_lon

    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.delete("/delete-account", response_model=DetailMessageResponse)
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Right-to-be-forgotten / data privacy compliance."""
    db.add(
        AuditLog(
            user_id=None,
            action="USER_DELETED_ACCOUNT",
            details=f"User ID {current_user.id} purged all personal data",
        )
    )
    await db.delete(current_user)
    await db.commit()
    return {
        "detail": "Account and associated private data permanently deleted in accordance with data privacy standards."
    }
