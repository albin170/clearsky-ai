# ClearSky AI - Security Architecture & Threat Mitigation

Security is treated as a foundational architectural requirement for ClearSky AI. This document outlines the safeguards implemented across all system boundaries.

---

## 1. Authentication & Session Security
- **Algorithm:** Signed JSON Web Tokens (JWT) using `HS256` with strong 256-bit entropy keys.
- **Password Protection:** Irreversible password hashing using `bcrypt` with automatic salt generation (`bcrypt.gensalt()`).
- **Session Duration:** Configurable expiration (default 7 days) with strict server-side signature and expiry verification.
- **Client Security:** Tokens stored in isolated browser storage with clear logout purging.

---

## 2. Server-Side Authorization & RBAC
- **Strict Role Enforcement:** ClearSky implements 4 discrete hierarchical roles:
  1. `super_admin`: Full system telemetry, user management, and configuration.
  2. `moderator`: Citizen pollution reports review, spam flagging, and dispute resolution.
  3. `community_manager`: Local neighborhood coalition management.
  4. `standard_user`: Household lifestyle profiles, routine generation, and personal impact logs.
- **Server Dependency Guards:** Authorization checks are enforced at FastAPI routing boundaries (`require_role([...])`) and cannot be bypassed via client-side manipulation.

---

## 3. Input Validation & Injection Prevention
- **Schema Validation:** Strict Pydantic v2 schemas for every request and response body, validating data types, string constraints, and sanitizing inputs.
- **SQL Injection Prevention:** 100% parameterized queries via SQLAlchemy 2.0 ORM over async SQLite (`aiosqlite`) / PostgreSQL. No dynamic string concatenation is permitted.
- **XSS Defense:** Automatic HTML escaping in React virtual DOM; strict sanitization of markdown and user-submitted text.

---

## 4. Privacy & Data Minimization
- **Non-Invasive Family Profiles:** The system requires only functional categories (e.g., `child`, `elderly`, `respiratory_sensitive`) and explicitly **does not store** confidential medical diagnoses, prescription histories, or personal health records.
- **Right to Be Forgotten:** Dedicated `DELETE /api/v1/auth/delete-account` endpoint that irrevocably purges all user records, saved locations, and impact logs upon citizen request.
- **Anonymous Reporting:** Community pollution reports support an `is_anonymous` flag, protecting citizen whistleblowers reporting illegal open waste combustion.

---

## 5. Network & API Protection
- **CORS Configuration:** Configurable origins restricting unapproved domain access.
- **Rate Limiting & Caching:** In-memory 15-minute response caching for weather and AQI endpoints to prevent external API exhaustion and protect against Denial of Service (DoS).
- **Prompt Injection Defense:** Strict grounding prompts that separate immutable ground truth sensor inputs from user questions, preventing prompt injection attacks from overriding environmental metrics.

---

## 6. Audit Logging
- Dedicated `audit_logs` database table tracking critical security events:
  - User registrations and logins
  - Administrative role elevations
  - User status toggles
  - Account deletion requests
  - Citizen report moderation actions
