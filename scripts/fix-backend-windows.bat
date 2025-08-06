@echo off
REM Fix Backend Dependencies on Windows

echo 🔧 Fixing backend Python dependencies...

cd backend

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating new virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

REM Verify activation
echo 📍 Python location: 
where python

REM Upgrade pip
echo ⬆️ Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies one by one to catch errors
echo 📦 Installing core dependencies...
pip install fastapi==0.104.1
pip install uvicorn[standard]==0.24.0
pip install pydantic==2.5.0
pip install pydantic-settings==2.1.0
pip install structlog==23.2.0
pip install python-dotenv==1.0.0

echo 📦 Installing remaining dependencies...
pip install -r requirements.txt

echo ✅ Backend dependencies installed successfully!

echo 🧪 Testing imports...
python -c "import structlog; print('✅ structlog imported successfully')"
python -c "import fastapi; print('✅ fastapi imported successfully')"
python -c "import uvicorn; print('✅ uvicorn imported successfully')"

echo 🎉 Backend is ready!
echo Run: uvicorn main:app --reload --port 8000

cd ..
pause