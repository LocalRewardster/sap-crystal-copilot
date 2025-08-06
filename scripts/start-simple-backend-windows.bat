@echo off
REM Start Crystal Copilot Backend - Python 3.13 Compatible Version

echo 🚀 Starting Crystal Copilot Backend (Python 3.13 Compatible)
echo ==============================================================

cd backend

REM Activate virtual environment
echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

echo 📍 Using Python:
where python
python --version

echo 🧪 Quick import test...
python -c "import fastapi, uvicorn, aiofiles; print('✅ Core dependencies OK')" || goto :error

echo 🚀 Starting server with simplified main...
echo Use Ctrl+C to stop the server
echo.
echo Server will be available at: http://127.0.0.1:8000
echo API Documentation: http://127.0.0.1:8000/docs
echo.

uvicorn main_simple:app --reload --port 8000

goto :end

:error
echo ❌ Core dependencies missing. Run scripts\fix-python313-issues-windows.bat first
pause
exit /b 1

:end
echo 🛑 Server stopped
cd ..
pause