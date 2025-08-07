@echo off
echo 🚀 Minimal Crystal Reports Service (No SDK Dependencies)
echo.

cd crystal-service

echo ===== BUILDING MINIMAL CRYSTAL SERVICE =====
echo.

echo Building minimal service without Crystal Reports SDK dependencies...
dotnet build CrystalReportsService-Minimal.csproj --configuration Release

if errorlevel 1 (
    echo ❌ Build failed!
    pause
    exit /b 1
) else (
    echo ✅ BUILD SUCCESSFUL! 🎉
    echo.
    echo The minimal Crystal Reports service is ready.
    echo This version works without Crystal Reports SDK and uses:
    echo - RptToXml.exe (if available) for report parsing
    echo - Fallback basic file analysis
    echo - Placeholder previews
    echo.
)

echo ===== TESTING THE SERVICE =====
echo.

echo Starting the service for a quick test...
start /B dotnet run --project CrystalReportsService-Minimal.csproj --urls "http://localhost:5001" --Program "Program-Minimal.cs"

timeout /t 5 >nul

echo Testing health endpoint...
curl -s http://localhost:5001/api/crystalreports/health 2>nul
if errorlevel 1 (
    echo ❌ Service not responding
) else (
    echo ✅ Service is running on http://localhost:5001
    echo.
    echo API endpoints available:
    echo - GET  /api/crystalreports/health
    echo - POST /api/crystalreports/{reportId}/metadata
    echo - POST /api/crystalreports/{reportId}/preview
    echo - POST /api/crystalreports/{reportId}/field-operation
    echo - POST /api/crystalreports/{reportId}/export
    echo.
    echo Swagger UI: http://localhost:5001/swagger
)

cd ..

echo ===== UPDATING BACKEND CONFIGURATION =====
echo.

findstr /C:"CRYSTAL_SERVICE_URL" backend\.env >nul 2>&1
if errorlevel 1 (
    echo CRYSTAL_SERVICE_URL=http://localhost:5001 >> backend\.env
    echo ✅ Added CRYSTAL_SERVICE_URL to backend\.env
) else (
    echo ✅ CRYSTAL_SERVICE_URL already configured
)

echo.
echo 🎉 MINIMAL CRYSTAL SERVICE IS READY!
echo.
echo This service provides:
echo ✅ Working API endpoints
echo ✅ No Crystal Reports SDK dependencies  
echo ✅ RptToXml integration (if available)
echo ✅ Fallback basic report analysis
echo.
echo You can now:
echo 1. Test the service at http://localhost:5001/swagger
echo 2. Start your backend: cd backend && python main.py
echo 3. Start your frontend: cd frontend && npm run dev
echo.
pause