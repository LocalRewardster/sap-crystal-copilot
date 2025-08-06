@echo off
REM Fix Python 3.13 compatibility issues on Windows

echo 🔧 Fixing Python 3.13 compatibility issues...
echo ================================================

cd backend

REM Activate virtual environment
echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

echo 📍 Current Python version:
python --version

echo 🚀 Installing packages with pre-compiled wheels only...
echo ======================================================

REM Install core packages first (these should have wheels for 3.13)
echo 📦 Installing core FastAPI packages...
pip install --only-binary=all fastapi==0.104.1
pip install --only-binary=all uvicorn[standard]==0.24.0
pip install --only-binary=all pydantic==2.5.0
pip install --only-binary=all pydantic-settings==2.1.0

echo 📦 Installing file handling packages...
pip install --only-binary=all python-multipart==0.0.6
pip install --only-binary=all aiofiles==23.2.1

echo 📦 Installing HTTP and AI packages...
pip install --only-binary=all httpx==0.25.2
pip install --only-binary=all requests==2.31.0

echo 📦 Installing utilities...
pip install --only-binary=all python-dotenv==1.0.0
pip install --only-binary=all structlog==23.2.0
pip install --only-binary=all xmltodict==0.13.0

echo 📦 Installing monitoring (skip if fails)...
pip install --only-binary=all prometheus-client==0.19.0 || echo "⚠️ prometheus-client skipped"

echo 📦 Installing database packages (skip problematic ones)...
pip install --only-binary=all sqlalchemy==2.0.23 || echo "⚠️ sqlalchemy skipped"
pip install --only-binary=all redis==5.0.1 || echo "⚠️ redis skipped"

echo 🧪 Testing critical imports...
echo ===============================

python -c "import fastapi; print('✅ fastapi OK')" || echo "❌ fastapi FAILED"
python -c "import uvicorn; print('✅ uvicorn OK')" || echo "❌ uvicorn FAILED"
python -c "import aiofiles; print('✅ aiofiles OK')" || echo "❌ aiofiles FAILED"
python -c "import structlog; print('✅ structlog OK')" || echo "❌ structlog FAILED"
python -c "import httpx; print('✅ httpx OK')" || echo "❌ httpx FAILED"

echo 🧪 Testing main.py imports...
python -c "
try:
    from app.core.config import get_settings
    print('✅ app.core.config OK')
    from app.core.logging import setup_logging
    print('✅ app.core.logging OK')
    print('🎉 Core imports successful!')
except Exception as e:
    print(f'❌ Import failed: {e}')
"

echo 🧪 Testing full main.py import...
python -c "
try:
    import main
    print('✅ main.py imported successfully!')
    print('🎉 Backend is ready!')
except Exception as e:
    print(f'❌ main.py import failed: {e}')
    print('ℹ️ This might be due to optional dependencies')
"

echo.
echo 🎯 Summary:
echo ===========
echo If core imports (fastapi, uvicorn, aiofiles) work, you can start the server.
echo Some optional features might not work due to Python 3.13 compatibility.
echo.
echo To start server: uvicorn main:app --reload --port 8000
echo.

cd ..
pause