import pytest
import asyncio
from app.core.database import engine, Base

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    async def init_models():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            
    loop.run_until_complete(init_models())
    yield
    loop.close()
