# ClearSky AI - Deployment & Operations Guide

## 1. Quick Start (Local Development)

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ & npm 9+ (tested on Node v24, npm 11)

### One-Click Launch (Windows)
Double-click `start.bat` in the repository root, or run:
```cmd
start.bat
```

### Manual Launch

#### 1. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python run.py
```
*The backend API will start on `http://127.0.0.1:8000`. The database and seed data (including `admin@clearsky.ai`) are automatically initialized on startup.*

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The React application will launch on `http://localhost:5173`.*

---

## 2. Production Build & Deployment

### Building the Frontend
```bash
cd frontend
npm run build
```
This generates a static asset bundle in `frontend/dist/`. The bundle can be hosted via Nginx, Vercel, Netlify, or served directly from the FastAPI backend as static files.

### Running Backend with Production Gunicorn / Uvicorn
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Environment Variables (.env)
| Variable | Description | Default |
|---|---|---|
| `PROJECT_NAME` | Platform Display Name | ClearSky AI |
| `SECRET_KEY` | JWT signing secret | (Set a secure random key) |
| `DATABASE_URL` | SQLite / PostgreSQL URL | `sqlite+aiosqlite:///./clearsky.db` |
| `GEMINI_API_KEY` | Optional Google Gemini key | (Uses built-in Grounded RAG if unset) |
| `AQI_CACHE_TTL_SECONDS` | In-memory cache duration | `900` |
| `ADMIN_EMAIL` | Optional initial Super Admin email | (Empty — first registered user becomes Super Admin) |
| `ADMIN_INITIAL_PASSWORD` | Optional initial Super Admin password | (Empty — required only when `ADMIN_EMAIL` is set) |

---

## 3. Initial Administrator Provisioning

No default administrator credentials are hardcoded or seeded automatically. Provision the initial Super Admin using one of two secure methods:

1. **Environment Variables:** Set `ADMIN_EMAIL` and `ADMIN_INITIAL_PASSWORD` before starting the backend.
2. **First-User Bootstrap:** Leave those variables unset and register the first account via `POST /api/v1/auth/register` (automatically assigned `super_admin`).
