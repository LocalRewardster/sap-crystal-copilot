@echo off
REM SAP Crystal Copilot - Windows Setup Script

echo 🔧 SAP Crystal Copilot - Windows Setup
echo =====================================

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python 3.11+ is required but not installed
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

echo ✅ Python found

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js 18+ is required but not installed
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js found

REM Check Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Desktop is required but not installed
    echo Please install Docker Desktop from https://docker.com
    pause
    exit /b 1
)

echo ✅ Docker found

REM Setup backend
echo.
echo 🐍 Setting up backend...
cd backend

REM Create virtual environment
if not exist "venv" (
    echo 📦 Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo 📦 Installing Python dependencies...
pip install --upgrade pip
pip install -r requirements.txt

REM Create directories
if not exist "uploads" mkdir uploads
if not exist "data" mkdir data
if not exist "logs" mkdir logs

echo ✅ Backend setup complete

cd ..

REM Setup frontend
echo.
echo 🎨 Setting up frontend...
cd frontend

REM Install dependencies
echo 📦 Installing Node.js dependencies...
npm install

echo ✅ Frontend setup complete

cd ..

REM Final instructions
echo.
echo 🎉 Setup completed successfully!
echo.
echo Next steps:
echo 1. Your API keys are already configured in backend\.env
echo 2. Run 'scripts\start-dev-windows.bat' to start development environment
echo 3. Or use Docker: 'docker-compose up'
echo.
echo Documentation:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:8000/docs
echo.

pause