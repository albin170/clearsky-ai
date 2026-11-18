#!/usr/bin/env bash
echo "Starting ClearSky AI Platform..."

# Start Backend in background
cd backend && python run.py &
BACKEND_PID=$!

# Start Frontend
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo "ClearSky AI Backend running on PID $BACKEND_PID (http://127.0.0.1:8000)"
echo "ClearSky AI Frontend running on PID $FRONTEND_PID (http://localhost:5173)"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
