@echo off
REM Start the backend server on Windows
echo =============================================
echo   Anker AI Earbuds Simulation - Backend
echo =============================================

cd /d "%~dp0"

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: python is not installed
    pause
    exit /b 1
)

REM Create virtual environment if needed
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r requirements.txt -q

REM Create data directory
if not exist "data" mkdir data

echo.
echo Starting server on http://localhost:8000
echo API docs: http://localhost:8000/docs
echo.

python -m backend.main
