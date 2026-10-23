@echo off
title MindBridge AI - FastAPI Backend
echo ========================================================
echo   MindBridge AI - Digital Mental Health Support System
echo   Starting Backend API Server on http://localhost:8000
echo ========================================================
cd /d "%~dp0"
call .\venv\Scripts\activate
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --app-dir backend
pause
