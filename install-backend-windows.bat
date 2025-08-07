@echo off
echo Installing Crystal Copilot Backend Dependencies on Windows...

cd backend

echo.
echo Step 1: Upgrading pip...
python -m pip install --upgrade pip

echo.
echo Step 2: Installing Windows-compatible requirements...
echo Trying simple installation first (no compilation needed)...
pip install -r requirements-windows-simple.txt

echo.
echo Step 3: Testing Supabase connection...
python -c "
try:
    from app.services.supabase_service import get_supabase_service
    service = get_supabase_service()
    if service.is_available():
        print('✅ Supabase connected successfully!')
    else:
        print('⚠️  Supabase not configured - will use SQLite fallback')
except Exception as e:
    print(f'❌ Error: {e}')
    print('💡 Make sure your .env file is configured with Supabase credentials')
"

echo.
echo Step 4: Testing backend startup...
echo Starting backend server for 5 seconds to test...
timeout /t 2 > nul
start /b python main.py
timeout /t 5 > nul
taskkill /f /im python.exe > nul 2>&1

echo.
echo ✅ Installation complete!
echo.
echo Next steps:
echo 1. Make sure your .env file has Supabase credentials
echo 2. Run: python main.py
echo 3. Test at: http://localhost:8000/docs

pause