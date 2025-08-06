@echo off
echo 🚀 Setting up Complete Crystal Reports Integration...

echo.
echo ===== STEP 1: Crystal Reports SDK Setup =====
echo.

REM Check if Crystal Reports is installed
echo Checking for Crystal Reports installations...

set CRYSTAL_FOUND=0
set CRYSTAL_PATH=""

REM Common Crystal Reports installation paths
if exist "C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common\SAP BusinessObjects Enterprise XI 4.0\win32_x86\CrystalDecisions.CrystalReports.Engine.dll" (
    set CRYSTAL_FOUND=1
    set CRYSTAL_PATH="C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common\SAP BusinessObjects Enterprise XI 4.0\win32_x86"
    echo ✅ Found Crystal Reports SDK (32-bit)
    goto :crystal_found
)

if exist "C:\Program Files\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common\SAP BusinessObjects Enterprise XI 4.0\win64_x64\CrystalDecisions.CrystalReports.Engine.dll" (
    set CRYSTAL_FOUND=1
    set CRYSTAL_PATH="C:\Program Files\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common\SAP BusinessObjects Enterprise XI 4.0\win64_x64"
    echo ✅ Found Crystal Reports SDK (64-bit)
    goto :crystal_found
)

echo ❌ Crystal Reports SDK not found!
echo.
echo Please install Crystal Reports for .NET Framework from:
echo https://www.sap.com/products/technology-platform/crystal-reports.html
echo.
echo Required: Crystal Reports for Visual Studio or Crystal Reports Runtime
pause
exit /b 1

:crystal_found
echo Crystal Reports SDK found at: %CRYSTAL_PATH%

echo.
echo ===== STEP 2: Build C# Crystal Service =====
echo.

cd crystal-service

echo Checking .NET SDK...
dotnet --version >nul 2>&1
if errorlevel 1 (
    echo ❌ .NET SDK not found!
    echo Please install .NET 6.0 SDK from: https://dotnet.microsoft.com/download
    pause
    exit /b 1
)

echo ✅ .NET SDK found
echo.

echo Building Crystal Reports C# Service...
dotnet build --configuration Release
if errorlevel 1 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo ✅ C# service built successfully
echo.

echo ===== STEP 3: Backend Configuration =====
echo.

cd ..\backend

echo Updating backend configuration...
if not exist .env (
    copy .env.example .env
)

REM Update .env with Crystal service URL
powershell -Command "(Get-Content '.env') -replace 'CRYSTAL_SERVICE_URL=.*', 'CRYSTAL_SERVICE_URL=http://localhost:5001' | Set-Content '.env'"

echo ✅ Backend configured for Crystal Reports integration
echo.

echo ===== STEP 4: Frontend Dependencies =====
echo.

cd ..\frontend

echo Installing frontend dependencies...
npm install
if errorlevel 1 (
    echo ❌ Frontend dependencies installation failed!
    pause
    exit /b 1
)

echo ✅ Frontend dependencies installed
echo.

echo ===== SETUP COMPLETE! =====
echo.
echo 🎉 Crystal Reports Integration is ready!
echo.
echo To start the complete system:
echo.
echo 1. Start Crystal Reports Service:
echo    cd crystal-service
echo    dotnet run
echo.
echo 2. Start Backend (new terminal):
echo    cd backend
echo    python main.py
echo.
echo 3. Start Frontend (new terminal):
echo    cd frontend
echo    npm run dev
echo.
echo 4. Open browser: http://localhost:3000
echo.
echo The system will provide:
echo ✅ Real Crystal Reports parsing via SDK
echo ✅ High-quality PDF/HTML previews  
echo ✅ Field operations (hide/show/rename/move)
echo ✅ Export to multiple formats
echo ✅ Professional visual rendering
echo.
pause