@echo off
echo 🎯 Targeted Crystal Reports Build (Using Your Exact DLL Paths)
echo.

cd crystal-service

echo ===== BUILDING CRYSTAL REPORTS SERVICE =====
echo.

echo Using targeted project file with your exact Crystal Reports paths...
echo.

dotnet build CrystalReportsService-Targeted.csproj --configuration Release --verbosity normal

if errorlevel 1 (
    echo.
    echo ❌ Build failed! 
    echo.
    echo Let's try a few troubleshooting steps:
    echo.
    echo 1. Checking if .NET Framework 4.8 targeting pack is installed...
    dotnet --list-sdks
    echo.
    echo 2. If you see .NET 6.0+ but build fails, you may need .NET Framework 4.8 targeting pack
    echo    Download from: https://dotnet.microsoft.com/download/dotnet-framework/net48
    echo.
    pause
    exit /b 1
) else (
    echo.
    echo ✅ BUILD SUCCESSFUL! 🎉
    echo.
    echo Crystal Reports Service built successfully with your exact DLL paths.
    echo.
    echo The service is ready to run on port 5001.
    echo You can start it with: dotnet run --project CrystalReportsService-Targeted.csproj
    echo.
)

cd ..

echo ===== UPDATING BACKEND CONFIGURATION =====
echo.

REM Check if CRYSTAL_SERVICE_URL already exists in .env
findstr /C:"CRYSTAL_SERVICE_URL" backend\.env >nul 2>&1
if errorlevel 1 (
    echo CRYSTAL_SERVICE_URL=http://localhost:5001 >> backend\.env
    echo ✅ Added CRYSTAL_SERVICE_URL to backend\.env
) else (
    echo ✅ CRYSTAL_SERVICE_URL already configured in backend\.env
)

echo.
echo 🚀 READY TO LAUNCH!
echo.
echo Start all services with these commands:
echo.
echo 1. Crystal Service: cd crystal-service ^&^& dotnet run --project CrystalReportsService-Targeted.csproj
echo 2. Backend API:     cd backend ^&^& python main.py
echo 3. Frontend:        cd frontend ^&^& npm run dev
echo.
echo Or use the start script: start-crystal-system-windows.bat
echo.
pause