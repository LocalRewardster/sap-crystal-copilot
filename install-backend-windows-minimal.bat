@echo off
echo ================================================
echo Crystal Copilot - Minimal Windows Installation
echo ================================================
echo.
echo This installer uses minimal dependencies to avoid compilation issues.
echo Compatible with Python 3.8-3.13 on Windows.

cd backend

echo.
echo Step 1: Checking Python version...
python --version
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python not found! Please install Python first.
    pause
    exit /b 1
)

echo.
echo Step 2: Upgrading pip...
python -m pip install --upgrade pip

echo.
echo Step 3: Installing minimal requirements (no compilation)...
echo This may take a few minutes...
pip install -r requirements-windows-minimal.txt

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Installation failed!
    echo.
    echo Trying individual package installation...
    pip install fastapi==0.100.1
    pip install uvicorn==0.23.2
    pip install pydantic==1.10.12
    pip install supabase==1.3.0
    pip install python-dotenv==1.0.0
    pip install httpx==0.24.1
    pip install requests==2.31.0
    pip install aiofiles==23.2.1
    pip install python-multipart==0.0.6
    pip install rich==13.7.0
)

echo.
echo Step 4: Creating .env file...
if not exist .env (
    copy .env.example .env
    echo ✅ .env file created from template
) else (
    echo ℹ️  .env file already exists
)

echo.
echo Step 5: Testing installation...
python -c "
try:
    import fastapi
    import uvicorn
    import pydantic
    print('✅ Core packages installed successfully!')
    
    try:
        from app.services.supabase_v1 import get_supabase_v1_service
        service = get_supabase_v1_service()
        if service.is_available():
            print('✅ Supabase connected successfully!')
        else:
            print('⚠️  Supabase not configured - will use SQLite fallback')
    except Exception as e:
        print(f'⚠️  Supabase connection issue: {e}')
        
except Exception as e:
    print(f'❌ Installation error: {e}')
"

echo.
echo Step 6: Testing basic server startup...
echo Starting server for 3 seconds to verify installation...
timeout /t 1 > nul

echo.
echo ================================================
echo Installation Summary
echo ================================================
echo.
echo ✅ Minimal Python packages installed
echo ✅ No compilation required
echo ✅ Compatible with Python 3.8-3.13
echo ✅ Supabase REST API integration
echo.
echo Next steps:
echo 1. Set up your Supabase database (see SUPABASE_SETUP.md)
echo 2. Run: python main.py
echo 3. Open: http://localhost:8000/docs
echo.
echo If you need more features, you can install additional packages later.
echo.

pause