@echo off
REM SAP Crystal Copilot - Windows Error Fix Script

echo 🔧 Fixing Windows-specific errors...

REM Backend fixes
echo 📦 Reinstalling backend dependencies...
cd backend

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Upgrade pip and reinstall dependencies
python -m pip install --upgrade pip
pip install --force-reinstall -r requirements.txt

echo ✅ Backend dependencies fixed

cd ..

REM Frontend fixes
echo 🎨 Fixing frontend issues...
cd frontend

REM Clear cache and reinstall
if exist ".next" rmdir /s /q .next
if exist "node_modules" rmdir /s /q node_modules
if exist "package-lock.json" del package-lock.json

REM Reinstall dependencies
npm install

echo ✅ Frontend dependencies fixed

cd ..

echo 🎉 All errors fixed! Try starting the development environment again.
echo Run: scripts\start-dev-windows.bat

pause