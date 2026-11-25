from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone
import hashlib
import time
from typing import Any, Deque, Dict, Optional
import bcrypt
import jwt
from fastapi import HTTPException, status
from app.core.config import settings
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)


class RateLimiter:
    """Bounded in-memory sliding-window rate limiter for sensitive API endpoints."""

    def __init__(self, max_keys: int = 5000) -> None:
        self._hits: Dict[str, Deque[float]] = defaultdict(deque)
        self._max_keys = max_keys

    def check_rate_limit(self, key: str, max_requests: int = 20, window_seconds: int = 60) -> None:
        now = time.monotonic()
        if key not in self._hits and len(self._hits) >= self._max_keys:
            stale_keys = [
                k for k, q in self._hits.items()
                if not q or (now - q[-1]) > window_seconds
            ]
            for k in stale_keys:
                self._hits.pop(k, None)
            if len(self._hits) >= self._max_keys:
                oldest_key = next(iter(self._hits))
                self._hits.pop(oldest_key, None)

        bucket = self._hits[key]
        while bucket and now - bucket[0] > window_seconds:
            bucket.popleft()
        if len(bucket) >= max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
            )
        bucket.append(now)

    def reset(self) -> None:
        self._hits.clear()


rate_limiter = RateLimiter()


def _prepare_password_bytes(password: str) -> bytes:
    """Normalize passwords exceeding bcrypt's 72-byte limit via SHA-256 while keeping <=72-byte inputs unchanged."""
    raw = password.encode("utf-8")
    if len(raw) > 72:
        return hashlib.sha256(raw).hexdigest().encode("ascii")
    return raw


def get_password_hash(password: str) -> str:
    pwd_bytes = _prepare_password_bytes(password)
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = _prepare_password_bytes(plain_password)
        return bcrypt.checkpw(pwd_bytes, hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(
    subject: str | Any,
    extra_claims: Optional[Dict[str, Any]] = None,
    expires_delta: Optional[timedelta] = None,
) -> str:
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta if expires_delta else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode: Dict[str, Any] = {"iat": now, "exp": expire, "sub": str(subject)}
    if extra_claims:
        to_encode.update(extra_claims)
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        return jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            options={"require": ["exp", "sub"]},
        )
    except jwt.PyJWTError:
        return None
