@echo off
title Smart Energy V2.1 - Auto Start
color 0A
cls
echo.
echo 🚀🚀 SMART ENERGY V2.1 - AUTO START 🚀🚀
echo =========================================
echo.

REM Check Python virtualenv
if not exist ".venv" (
    echo ⚠️  Virtualenv not found. Creating...
    python -m venv .venv
    .venv\Scripts\activate.bat
    pip install -r requirements.txt
)

REM Activate virtualenv
call .venv\Scripts\activate.bat

REM Backend Node.js
echo [1/3] Starting Backend Node.js (port 3000)...
start "Backend API 3000" cmd /k "cd backend && npm start"
timeout /t 4 >nul

REM Frontend Flask
echo [2/3] Starting Flask Web (port 5000)...
start "Flask Dashboard 5000" cmd /k "python app.py"

echo [3/3] ✅ SYSTEM READY!
echo.
echo 🌐 Dashboard: http://192.168.1.19:3000
echo 📊 Backend:   http://192.168.1.19:3000/health
echo 👤 Login:     admin / 123
echo.
echo 💡 TIP: Use .\run-system.bat in PowerShell
pause
