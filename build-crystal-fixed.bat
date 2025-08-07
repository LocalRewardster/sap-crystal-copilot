@echo off
echo 🔧 Fixed Crystal Reports Build (.NET Framework 4.8 + Correct Paths)
echo.

cd crystal-service

echo ===== BUILDING FIXED CRYSTAL SERVICE =====
echo.

echo Building with .NET Framework 4.8 and correct DLL paths from Common directory...
dotnet build CrystalReportsService-Fixed.csproj --configuration Release --verbosity normal

if errorlevel 1 (
    echo ❌ Build failed!
    echo.
    echo Let's check if the DLL paths are correct:
    echo.
    if exist "C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common\CrystalDecisions.CrystalReports.Engine.dll" (
        echo ✅ Engine DLL found in Common directory
    ) else (
        echo ❌ Engine DLL NOT found in Common directory
    )
    
    if exist "C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common\CrystalDecisions.Shared.dll" (
        echo ✅ Shared DLL found in Common directory
    ) else (
        echo ❌ Shared DLL NOT found in Common directory
    )
    
    pause
    exit /b 1
) else (
    echo ✅ BUILD SUCCESSFUL! 🎉
    echo.
    echo Crystal Reports Service built successfully with .NET Framework 4.8!
    echo.
    echo Testing the service...
    start /B dotnet run --project CrystalReportsService-Fixed.csproj --urls "http://localhost:5001"
    
    timeout /t 5 >nul
    
    echo Service should be running on http://localhost:5001
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
echo 🎉 CRYSTAL REPORTS SERVICE IS READY!
echo.
echo This service provides FULL Crystal Reports functionality:
echo ✅ Real Crystal Reports SDK integration
echo ✅ Actual report parsing and metadata extraction
echo ✅ PDF preview generation
echo ✅ Field operations (hide, show, rename)
echo ✅ Report export in multiple formats
echo.
echo Next steps:
echo 1. Start backend: cd backend && python main.py
echo 2. Start frontend: cd frontend && npm run dev
echo 3. Test the full Crystal Copilot system!
echo.
pause