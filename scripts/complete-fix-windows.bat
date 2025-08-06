@echo off
REM Complete fix for all Windows issues

echo 🚀 SAP Crystal Copilot - Complete Windows Fix
echo ==============================================

echo 📍 Current directory: %CD%

REM Stop any running processes
echo 🛑 Stopping any running processes...
taskkill /f /im "uvicorn.exe" 2>nul
taskkill /f /im "node.exe" 2>nul
timeout /t 2 >nul

REM Backend Fix
echo.
echo 🐍 FIXING BACKEND...
echo ====================

cd backend

REM Remove old virtual environment if corrupted
if exist "venv" (
    echo 🗑️ Removing old virtual environment...
    rmdir /s /q venv
)

REM Create fresh virtual environment
echo 📦 Creating fresh virtual environment...
python -m venv venv

REM Activate virtual environment
echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

REM Verify Python location
echo 📍 Using Python from: 
where python

REM Upgrade pip
echo ⬆️ Upgrading pip...
python -m pip install --upgrade pip

REM Install critical dependencies first
echo 📦 Installing critical dependencies...
pip install structlog==23.2.0
pip install fastapi==0.104.1
pip install uvicorn[standard]==0.24.0
pip install pydantic==2.5.0
pip install pydantic-settings==2.1.0
pip install python-dotenv==1.0.0

REM Install all dependencies
echo 📦 Installing all dependencies...
pip install -r requirements.txt

REM Test imports
echo 🧪 Testing critical imports...
python -c "import structlog; print('✅ structlog OK')" || goto :backend_error
python -c "import fastapi; print('✅ fastapi OK')" || goto :backend_error
python -c "import uvicorn; print('✅ uvicorn OK')" || goto :backend_error

echo ✅ Backend fixed successfully!

cd ..

REM Frontend Fix
echo.
echo 🎨 FIXING FRONTEND...
echo ====================

cd frontend

REM Clear all caches and modules
echo 🧹 Clearing caches...
if exist ".next" rmdir /s /q .next
if exist "node_modules" rmdir /s /q node_modules
if exist "package-lock.json" del package-lock.json

REM Install dependencies
echo 📦 Installing frontend dependencies...
npm install

echo ✅ Frontend fixed successfully!

cd ..

REM Final verification
echo.
echo 🧪 FINAL VERIFICATION...
echo ========================

echo 🔍 Checking backend...
cd backend
call venv\Scripts\activate.bat
python -c "from main import app; print('✅ Main app can be imported')" || goto :final_error
cd ..

echo 🔍 Checking frontend...
cd frontend
if exist "node_modules" (
    echo ✅ Frontend dependencies installed
) else (
    echo ❌ Frontend dependencies missing
    goto :final_error
)
cd ..

echo.
echo 🎉 ALL FIXES COMPLETED SUCCESSFULLY!
echo ====================================
echo.
echo Next steps:
echo 1. Start Redis: docker run -d --name crystal-redis -p 6379:6379 redis:7-alpine
echo 2. Start backend: cd backend && call venv\Scripts\activate.bat && uvicorn main:app --reload --port 8000
echo 3. Start frontend: cd frontend && npm run dev
echo.
echo Or use: scripts\start-dev-windows.bat
echo.

pause
exit /b 0

:backend_error
echo ❌ Backend fix failed! Check Python installation and try again.
cd ..
pause
exit /b 1

:final_error
echo ❌ Final verification failed! Check the error messages above.
pause
exit /b 1