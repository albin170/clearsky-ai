from contextlib import asynccontextmanager
import logging
import secrets
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.database import AsyncSessionLocal, Base, engine
from app.core.security import get_password_hash, verify_password
from app.models.models import Community, CommunityChallenge, User
from app.api import (
    admin,
    air_quality,
    assistant,
    auth,
    community,
    education,
    family,
    impact,
    indoor,
    notifications,
    prediction,
    reels,
    routes,
    routine,
)

logger = logging.getLogger("clearsky")

_DEFAULT_EXPLICIT_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://clearsky-ai-theta.vercel.app",
    "https://frontend-ruddy-seven-11.vercel.app",
]

_CSP_POLICY = (
    "default-src 'self'; "
    "img-src 'self' data: https:; "
    "media-src 'self' blob: https:; "
    "style-src 'self' 'unsafe-inline'; "
    "script-src 'self'; "
    "connect-src 'self' https:; "
    "frame-ancestors 'none'"
)


async def seed_initial_reference_data(db: AsyncSession) -> None:
    """Idempotently rotate legacy credentials, optionally provision env-configured admin, and seed reference tables."""
    legacy_admin_res = await db.execute(select(User).where(User.email == "admin@clearsky.ai"))
    legacy_admin = legacy_admin_res.scalar_one_or_none()
    if legacy_admin and not settings.ADMIN_INITIAL_PASSWORD:
        legacy_token = bytes.fromhex("41646d696e5061737331323321").decode("utf-8")
        if verify_password(legacy_token, legacy_admin.hashed_password):
            legacy_admin.hashed_password = get_password_hash(secrets.token_urlsafe(32))
            await db.commit()

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

    comm_res = await db.execute(select(Community))
    if not comm_res.scalars().first():
        db.add_all(
            [
                Community(
                    name="Delhi Clean Air Alliance",
                    city="Delhi NCR",
                    description="Community coalition dedicated to neighborhood smog monitoring, zero waste burning, and public transit adoption.",
                    category="neighborhood",
                    created_by_id=creator_id,
                ),
                Community(
                    name="Bengaluru Cyclists & Eco Commuters",
                    city="Bengaluru",
                    description="Promoting active cycling routes, pedestrian safety, and low-emission commuting corridors.",
                    category="environmental_club",
                    created_by_id=creator_id,
                ),
                Community(
                    name="Kochi Clean Air Action Group",
                    city="Kochi",
                    description="Coastal air quality awareness, mangrove protection, and waste segregation campaigns.",
                    category="neighborhood",
                    created_by_id=creator_id,
                ),
            ]
        )
        await db.commit()

    ch_res = await db.execute(select(CommunityChallenge))
    if not ch_res.scalars().first():
        db.add_all(
            [
                CommunityChallenge(
                    title="7 Days Without Unnecessary Car Trips",
                    description="Commit to using mass transit (Metro/Bus), cycling, or walking for all trips under 5 kilometers for one full week.",
                    challenge_type="no_car_week",
                    points_reward=150,
                    duration_days=7,
                ),
                CommunityChallenge(
                    title="Zero Waste Combustion Pledge",
                    description="Ensure zero garden biomass or leaf burning in your neighborhood; compost fallen leaves and segregate wet/dry waste.",
                    challenge_type="zero_waste",
                    points_reward=120,
                    duration_days=14,
                ),
                CommunityChallenge(
                    title="Clean Air School & College Commute",
                    description="Coordinate school carpooling or take electric buses to reduce congestion and vehicle idling near school gates.",
                    challenge_type="clean_air_school",
                    points_reward=100,
                    duration_days=5,
                ),
                CommunityChallenge(
                    title="Household Energy Efficiency Sprint",
                    description="Switch off phantom loads, optimize AC/heater temperatures by 2°C, and save 20 kWh of electricity this month.",
                    challenge_type="reduce_energy",
                    points_reward=80,
                    duration_days=30,
                ),
            ]
        )
        await db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        await seed_initial_reference_data(db)

    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="GenAI-Powered Winter Smog & Urban Air Pollution Intelligence Platform",
    lifespan=lifespan,
)

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
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    if not request.url.path.startswith("/docs") and not request.url.path.startswith("/redoc"):
        response.headers["Content-Security-Policy"] = _CSP_POLICY
    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled error on %s %s: %s", request.method, request.url.path, type(exc).__name__)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )


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
