from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, oauth2_scheme, decode_access_token
from app.models.models import User, AuditLog
from app.schemas.schemas import UserCreate, UserLogin, UserOut, Token, UserUpdate

router = APIRouter(prefix="/auth", tags=["Authentication"])

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token or expired session")
    user_id = payload.get("sub")
    
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account")
    return user

async def get_optional_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User | None:
    if not token:
        return None
    try:
        return await get_current_user(token, db)
    except HTTPException:
        return None

def require_role(allowed_roles: list[str]):
    async def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Access forbidden: Insufficient administrative privileges"
            )
        return current_user
    return role_checker

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user already exists
    res = await db.execute(select(User).where(User.email == user_in.email.lower()))
    if res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered")

    # If first user, make them super_admin
    user_count_res = await db.execute(select(User))
    users = user_count_res.scalars().all()
    role = "super_admin" if len(users) == 0 else "standard_user"

    new_user = User(
        email=user_in.email.lower(),
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        role=role,
        preferred_language=user_in.preferred_language,
        default_city=user_in.default_city,
        default_lat=user_in.default_lat,
        default_lon=user_in.default_lon
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Audit log
    audit = AuditLog(user_id=new_user.id, action="USER_REGISTERED", details=f"User {new_user.email} registered with role {role}")
    db.add(audit)
    await db.commit()

    token = create_access_token(subject=new_user.id, extra_claims={"role": new_user.role})
    return {"access_token": token, "token_type": "bearer", "user": new_user}

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(User).where(User.email == credentials.email.lower()))
    user = res.scalar_one_or_none()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

    token = create_access_token(subject=user.id, extra_claims={"role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserOut)
async def update_profile(
    updates: UserUpdate, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    if updates.full_name is not None:
        current_user.full_name = updates.full_name
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

@router.delete("/delete-account")
async def delete_account(
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    """Right-to-be-forgotten / Data privacy compliance"""
    audit = AuditLog(user_id=None, action="USER_DELETED_ACCOUNT", details=f"User {current_user.email} (ID {current_user.id}) purged all personal data")
    db.add(audit)
    await db.delete(current_user)
    await db.commit()
    return {"detail": "Account and associated private data permanently deleted in accordance with data privacy standards."}
