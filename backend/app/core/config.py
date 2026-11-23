import os
import secrets
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "ClearSky AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Security: dynamically generate an ephemeral high-entropy key if not supplied via environment
    SECRET_KEY: str = os.getenv("SECRET_KEY") or secrets.token_urlsafe(48)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Optional first-run administrator provisioning via environment variables
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "")
    ADMIN_INITIAL_PASSWORD: str = os.getenv("ADMIN_INITIAL_PASSWORD", "")

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./clearsky.db")

    # External APIs
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAQ_API_KEY: str = os.getenv("OPENAQ_API_KEY", "")

    # CORS (Explicit allowed origins - never mix wildcard '*' with allow_credentials=True)
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://clearsky-ai-theta.vercel.app",
        "https://frontend-ruddy-seven-11.vercel.app",
    ]

    # Cache settings
    AQI_CACHE_TTL_SECONDS: int = 900  # 15 minutes

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="allow")


settings = Settings()
