@echo off
REM SAP Crystal Copilot - Windows Development Startup Script

echo 🚀 Starting SAP Crystal Copilot Development Environment

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

REM Start Redis
echo 🐳 Starting Redis...
docker run -d --name crystal-redis -p 6379:6379 redis:7-alpine

REM Wait for Redis
echo ⏳ Waiting for Redis to be ready...
timeout /t 5 >nul

REM Start backend
echo 🔧 Starting backend API server...
cd backend
start "Crystal Copilot Backend" cmd /k "venv\Scripts\activate.bat && uvicorn main:app --reload --port 8000"
cd ..

REM Wait for backend to start
timeout /t 3 >nul

REM Start frontend
echo 🎨 Starting frontend development server...
cd frontend
start "Crystal Copilot Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ✅ Development environment started successfully!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo 📊 Metrics: http://localhost:8000/metrics
echo.
echo Press any key to stop all services...

pause

REM Cleanup
echo 🛑 Stopping services...
docker stop crystal-redis >nul 2>&1
docker rm crystal-redis >nul 2>&1
taskkill /f /im "uvicorn.exe" >nul 2>&1
taskkill /f /im "node.exe" >nul 2>&1
echo ✅ All services stopped