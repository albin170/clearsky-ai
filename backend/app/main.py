from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from app.core.config import settings
from app.core.database import engine, Base, AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.models import User, Community, CommunityChallenge
from app.api import (
    auth, air_quality, assistant, family, 
    indoor, routine, prediction, community, 
    impact, routes, education, admin, notifications
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Seed default data
    async with AsyncSessionLocal() as db:
        # Check if super admin exists
        res = await db.execute(select(User).where(User.email == "admin@clearsky.ai"))
        admin_user = res.scalar_one_or_none()
        if not admin_user:
            admin_user = User(
                email="admin@clearsky.ai",
                full_name="ClearSky Super Admin",
                hashed_password=get_password_hash("AdminPass123!"),
                role="super_admin",
                preferred_language="en",
                default_city="Delhi NCR",
                default_lat=28.6139,
                default_lon=77.2090
            )
            db.add(admin_user)
            await db.commit()
            await db.refresh(admin_user)

        # Seed standard communities if empty
        comm_res = await db.execute(select(Community))
        if not comm_res.scalars().first():
            c1 = Community(
                name="Delhi Clean Air Alliance",
                city="Delhi NCR",
                description="Community coalition dedicated to neighborhood smog monitoring, zero waste burning, and public transit adoption.",
                category="neighborhood",
                created_by_id=admin_user.id
            )
            c2 = Community(
                name="Bengaluru Cyclists & Eco Commuters",
                city="Bengaluru",
                description="Promoting active cycling routes, pedestrian safety, and low-emission commuting corridors.",
                category="environmental_club",
                created_by_id=admin_user.id
            )
            c3 = Community(
                name="Kochi Clean Air Action Group",
                city="Kochi",
                description="Coastal air quality awareness, mangrove protection, and waste segregation campaigns.",
                category="neighborhood",
                created_by_id=admin_user.id
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
                duration_days=7
            )
            ch2 = CommunityChallenge(
                title="Zero Waste Combustion Pledge",
                description="Ensure zero garden biomass or leaf burning in your neighborhood; compost fallen leaves and segregate wet/dry waste.",
                challenge_type="zero_waste",
                points_reward=120,
                duration_days=14
            )
            ch3 = CommunityChallenge(
                title="Clean Air School & College Commute",
                description="Coordinate school carpooling or take electric buses to reduce congestion and vehicle idling near school gates.",
                challenge_type="clean_air_school",
                points_reward=100,
                duration_days=5
            )
            ch4 = CommunityChallenge(
                title="Household Energy Efficiency Sprint",
                description="Switch off phantom loads, optimize AC/heater temperatures by 2°C, and save 20 kWh of electricity this month.",
                challenge_type="reduce_energy",
                points_reward=80,
                duration_days=30
            )
            db.add_all([ch1, ch2, ch3, ch4])
            await db.commit()

    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="GenAI-Powered Winter Smog & Urban Air Pollution Intelligence Platform",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/")
async def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
        "message": "ClearSky AI Environmental Intelligence Backend API is running."
    }

@app.get("/health")
async def health():
    return {"status": "ok", "version": settings.VERSION}
