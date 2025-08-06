@echo off
REM Diagnose Backend Issues on Windows

echo 🔍 SAP Crystal Copilot - Backend Diagnosis
echo ============================================

cd backend

REM Activate virtual environment
echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

echo 📍 Python version and location:
python --version
where python

echo.
echo 🧪 Testing individual imports...
echo ================================

echo Testing structlog...
python -c "import structlog; print('✅ structlog OK')" || echo "❌ structlog FAILED"

echo Testing fastapi...
python -c "import fastapi; print('✅ fastapi OK')" || echo "❌ fastapi FAILED"

echo Testing uvicorn...
python -c "import uvicorn; print('✅ uvicorn OK')" || echo "❌ uvicorn FAILED"

echo Testing pydantic...
python -c "import pydantic; print('✅ pydantic OK')" || echo "❌ pydantic FAILED"

echo Testing app.core.config...
python -c "from app.core.config import get_settings; print('✅ config OK')" || echo "❌ config FAILED"

echo Testing app.core.logging...
python -c "from app.core.logging import setup_logging; print('✅ logging OK')" || echo "❌ logging FAILED"

echo Testing prometheus_client...
python -c "from prometheus_client import make_asgi_app; print('✅ prometheus OK')" || echo "❌ prometheus FAILED"

echo.
echo 🔍 Testing main.py imports step by step...
echo ==========================================

echo Testing main.py line by line...
python -c "
try:
    print('Testing contextlib...')
    from contextlib import asynccontextmanager
    print('✅ contextlib OK')
    
    print('Testing fastapi...')
    from fastapi import FastAPI, HTTPException
    print('✅ fastapi imports OK')
    
    print('Testing fastapi middleware...')
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.middleware.trustedhost import TrustedHostMiddleware
    print('✅ fastapi middleware OK')
    
    print('Testing structlog...')
    import structlog
    print('✅ structlog OK')
    
    print('Testing prometheus...')
    from prometheus_client import make_asgi_app
    print('✅ prometheus OK')
    
    print('Testing app.core.config...')
    from app.core.config import get_settings
    print('✅ app.core.config OK')
    
    print('Testing app.core.logging...')
    from app.core.logging import setup_logging
    print('✅ app.core.logging OK')
    
    print('Testing app.api.v1.router...')
    from app.api.v1.router import api_router
    print('✅ app.api.v1.router OK')
    
    print('🎉 All imports successful!')
    
except Exception as e:
    print(f'❌ Import failed: {e}')
    import traceback
    traceback.print_exc()
"

echo.
echo 📦 Checking installed packages...
echo =================================
pip list | findstr -i "fastapi uvicorn pydantic structlog prometheus"

echo.
echo 🔧 Checking if main.py can be imported...
echo =========================================
python -c "
try:
    import main
    print('✅ main.py imported successfully')
except Exception as e:
    print(f'❌ main.py import failed: {e}')
    import traceback
    traceback.print_exc()
"

cd ..
pause