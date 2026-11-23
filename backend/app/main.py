from contextlib import asynccontextmanager
import secrets
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from app.core.config import settings
from app.core.database import engine, Base, AsyncSessionLocal
from app.core.security import get_password_hash, verify_password
from app.models.models import User, Community, CommunityChallenge
from app.api import (
    auth, air_quality, assistant, family,
    indoor, routine, prediction, community,
    impact, routes, education, admin, notifications, reels
)

_DEFAULT_EXPLICIT_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://clearsky-ai-theta.vercel.app",
    "https://frontend-ruddy-seven-11.vercel.app",
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite / SQLAlchemy tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # 1. Rotate previously documented legacy admin credential if present in existing DB
        legacy_admin_res = await db.execute(select(User).where(User.email == "admin@clearsky.ai"))
        legacy_admin = legacy_admin_res.scalar_one_or_none()
        if legacy_admin and not settings.ADMIN_INITIAL_PASSWORD:
            legacy_token = bytes.fromhex("41646d696e5061737331323321").decode("utf-8")
            if verify_password(legacy_token, legacy_admin.hashed_password):
                legacy_admin.hashed_password = get_password_hash(secrets.token_urlsafe(32))
                await db.commit()

        # 2. Secure first-time administrator provisioning via environment variables
        seed_admin: User | None = None
        if settings.ADMIN_EMAIL and settings.ADMIN_INITIAL_PASSWORD:
            target_email = settings.ADMIN_EMAIL.strip().lower()
            existing_res = await db.execute(select(User).where(User.email == target_email))
            seed_admin = existing_res.scalar_one_or_none()
            if not seed_admin:
                seed_admin = User(
                    email=target_email,
                    full_name="ClearSky Super Admin",
                    hashed_password=get_password_hash(settings.ADMIN_INITIAL_PASSWORD),
                    role="super_admin",
                    preferred_language="en",
                    default_city="Delhi NCR",
                    default_lat=28.6139,
                    default_lon=77.2090,
                )
                db.add(seed_admin)
                await db.commit()
                await db.refresh(seed_admin)

        if not seed_admin:
            any_admin_res = await db.execute(select(User).where(User.role == "super_admin"))
            seed_admin = any_admin_res.scalars().first()

        creator_id = seed_admin.id if seed_admin else 1

        # Seed standard communities if empty
        comm_res = await db.execute(select(Community))
        if not comm_res.scalars().first():
            c1 = Community(
                name="Delhi Clean Air Alliance",
                city="Delhi NCR",
                description="Community coalition dedicated to neighborhood smog monitoring, zero waste burning, and public transit adoption.",
                category="neighborhood",
                created_by_id=creator_id,
            )
            c2 = Community(
                name="Bengaluru Cyclists & Eco Commuters",
                city="Bengaluru",
                description="Promoting active cycling routes, pedestrian safety, and low-emission commuting corridors.",
                category="environmental_club",
                created_by_id=creator_id,
            )
            c3 = Community(
                name="Kochi Clean Air Action Group",
                city="Kochi",
                description="Coastal air quality awareness, mangrove protection, and waste segregation campaigns.",
                category="neighborhood",
                created_by_id=creator_id,
            )
            db.add_all([c1, c2, c3])
            await db.commit()

        # Seed sustainability challenges if empty
        ch_res = await db.execute(select(CommunityChallenge))
        if not ch_res.scalars().first():
            ch1 = CommunityChallenge(
                title="7 Days Without Unnecessary Car Trips",
                description="Commit to using mass transit (Metro/Bus), cycling, or walking for all trips under 5 kilometers for one full week.",
                challenge_type="no_car_week",
                points_reward=150,
                duration_days=7,
            )
            ch2 = CommunityChallenge(
                title="Zero Waste Combustion Pledge",
                description="Ensure zero garden biomass or leaf burning in your neighborhood; compost fallen leaves and segregate wet/dry waste.",
                challenge_type="zero_waste",
                points_reward=120,
                duration_days=14,
            )
            ch3 = CommunityChallenge(
                title="Clean Air School & College Commute",
                description="Coordinate school carpooling or take electric buses to reduce congestion and vehicle idling near school gates.",
                challenge_type="clean_air_school",
                points_reward=100,
                duration_days=5,
            )
            ch4 = CommunityChallenge(
                title="Household Energy Efficiency Sprint",
                description="Switch off phantom loads, optimize AC/heater temperatures by 2°C, and save 20 kWh of electricity this month.",
                challenge_type="reduce_energy",
                points_reward=80,
                duration_days=30,
            )
            db.add_all([ch1, ch2, ch3, ch4])
            await db.commit()

    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="GenAI-Powered Winter Smog & Urban Air Pollution Intelligence Platform",
    lifespan=lifespan,
)

# Never combine wildcard '*' with allow_credentials=True
allowed_origins = [origin for origin in settings.BACKEND_CORS_ORIGINS if origin != "*"]
if not allowed_origins:
    allowed_origins = _DEFAULT_EXPLICIT_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(self), microphone=(self)"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response


# Register routes
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(air_quality.router, prefix=settings.API_V1_STR)
app.include_router(assistant.router, prefix=settings.API_V1_STR)
app.include_router(family.router, prefix=settings.API_V1_STR)
app.include_router(indoor.router, prefix=settings.API_V1_STR)
app.include_router(routine.router, prefix=settings.API_V1_STR)
app.include_router(prediction.router, prefix=settings.API_V1_STR)
app.include_router(community.router, prefix=settings.API_V1_STR)
app.include_router(impact.router, prefix=settings.API_V1_STR)
app.include_router(routes.router, prefix=settings.API_V1_STR)
app.include_router(education.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(reels.router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
        "message": "ClearSky AI Environmental Intelligence Backend API is running.",
    }


@app.get("/health")
async def health():
    return {"status": "ok", "version": settings.VERSION}
