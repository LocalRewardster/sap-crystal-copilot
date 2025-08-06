@echo off
REM Fix Prometheus Client Missing Module Error

echo 🔧 Fixing prometheus_client missing module...

cd backend

REM Activate virtual environment
echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

echo 📍 Current Python:
where python
python --version

echo 📦 Installing missing prometheus_client...
pip install prometheus-client==0.19.0

echo 🧪 Testing prometheus import...
python -c "from prometheus_client import make_asgi_app; print('✅ prometheus_client imported successfully')" || goto :error

echo 📦 Installing any other missing dependencies...
pip install -r requirements.txt

echo 🧪 Testing main.py import...
python -c "import main; print('✅ main.py imported successfully')" || goto :error

echo ✅ Backend is now fixed!
echo 🚀 You can now start the server with: uvicorn main:app --reload --port 8000

cd ..
pause
exit /b 0

:error
echo ❌ Fix failed. Check the error messages above.
cd ..
pause
exit /b 1