@echo off
title MindBridge AI - Automated Pytest Suite
echo ========================================================
echo   Running Automated Test Suite for MindBridge AI
echo ========================================================
cd /d "%~dp0"
call .\venv\Scripts\activate
pytest backend\tests -v
pause
