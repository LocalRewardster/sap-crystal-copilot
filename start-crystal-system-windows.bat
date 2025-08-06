@echo off
echo 🚀 Starting Complete Crystal Reports System...

echo.
echo This will start all three services:
echo 1. Crystal Reports C# Service (port 5001)
echo 2. FastAPI Backend (port 8000)  
echo 3. Next.js Frontend (port 3000)
echo.

REM Check if Crystal service exists
if not exist "crystal-service\CrystalReportsService.csproj" (
    echo ❌ Crystal service not found! Please run setup-crystal-integration-windows.bat first.
    pause
    exit /b 1
)

echo Starting services...
echo.

REM Start Crystal Reports C# Service
echo 📊 Starting Crystal Reports SDK Service...
start "Crystal Reports Service" cmd /k "cd crystal-service && echo Crystal Reports SDK Service && dotnet run"

REM Wait a moment for the service to start
timeout /t 5 /nobreak >nul

REM Start FastAPI Backend
echo 🐍 Starting FastAPI Backend...
start "FastAPI Backend" cmd /k "cd backend && echo FastAPI Backend && python main.py"

REM Wait a moment for the backend to start
timeout /t 3 /nobreak >nul

REM Start Next.js Frontend
echo ⚛️ Starting Next.js Frontend...
start "Next.js Frontend" cmd /k "cd frontend && echo Next.js Frontend && npm run dev"

echo.
echo 🎉 All services are starting!
echo.
echo Services:
echo 📊 Crystal Reports SDK: http://localhost:5001
echo 🐍 FastAPI Backend: http://localhost:8000
echo ⚛️ Frontend App: http://localhost:3000
echo.
echo 📖 API Documentation: http://localhost:8000/docs
echo.
echo Wait 10-15 seconds for all services to fully start, then open:
echo http://localhost:3000
echo.
echo To stop all services, close all terminal windows.
echo.
pause