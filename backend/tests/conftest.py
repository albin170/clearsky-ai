import asyncio
import os
from pathlib import Path
import shutil
import tempfile
import pytest

_TEMP_DB_DIR = tempfile.mkdtemp(prefix="clearsky_pytest_")
_TEMP_DB_PATH = Path(_TEMP_DB_DIR) / "test_clearsky.db"
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{_TEMP_DB_PATH.as_posix()}"

from app.core.database import AsyncSessionLocal, Base, engine  # noqa: E402
from app.core.security import rate_limiter  # noqa: E402
from app.main import seed_initial_reference_data  # noqa: E402
from app.services.reels_service import reels_repository  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    async def _init() -> None:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        async with AsyncSessionLocal() as db:
            await seed_initial_reference_data(db)
        await engine.dispose()

    asyncio.run(_init())
    yield
    asyncio.run(engine.dispose())
    shutil.rmtree(_TEMP_DB_DIR, ignore_errors=True)


@pytest.fixture(autouse=True)
def isolate_mutable_services():
    rate_limiter.reset()
    reels_repository.reset()
    yield
    rate_limiter.reset()
