@echo off
echo =====================================================================
echo Starting ClearSky AI Platform (Backend + Frontend)
echo =====================================================================

REM Start Backend
start "ClearSky AI Backend (FastAPI)" cmd /k "cd backend && python run.py"

REM Start Frontend
start "ClearSky AI Frontend (Vite React)" cmd /k "cd frontend && npm run dev"

echo.
echo ClearSky AI is launching!
echo Backend:  http://127.0.0.1:8000 (API Docs: http://127.0.0.1:8000/docs)
echo Frontend: http://localhost:5173
echo.
echo Admin Setup: Register the first user or set ADMIN_EMAIL / ADMIN_INITIAL_PASSWORD.
echo =====================================================================
