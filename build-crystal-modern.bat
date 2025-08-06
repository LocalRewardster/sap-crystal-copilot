@echo off
echo 🚀 Modern Crystal Reports Build (.NET 6.0)
echo.

cd crystal-service

echo ===== STEP 1: Verify Crystal Reports DLLs =====
echo.

if exist "C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\CrystalDecisions.CrystalReports.Engine.dll" (
    echo ✅ CrystalDecisions.CrystalReports.Engine.dll found
) else (
    echo ❌ CrystalDecisions.CrystalReports.Engine.dll NOT found
    pause
    exit /b 1
)

if exist "C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\CrystalDecisions.Shared.dll" (
    echo ✅ CrystalDecisions.Shared.dll found
) else (
    echo ❌ CrystalDecisions.Shared.dll NOT found
    pause
    exit /b 1
)

echo.
echo ===== STEP 2: Build Modern Crystal Service =====
echo.

echo Building with .NET 6.0 and modern project structure...
dotnet build CrystalReportsService-Modern.csproj --configuration Release --verbosity normal

if errorlevel 1 (
    echo.
    echo ❌ Build failed! 
    echo.
    echo This might be due to Crystal Reports compatibility with .NET 6.0.
    echo Let's try a different approach...
    echo.
    pause
    exit /b 1
) else (
    echo.
    echo ✅ BUILD SUCCESSFUL! 🎉
    echo.
    echo Modern Crystal Reports Service built successfully.
    echo.
)

cd ..

echo ===== STEP 3: Update Backend Configuration =====
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
echo 🚀 READY TO TEST!
echo.
echo Start the Crystal service: cd crystal-service ^&^& dotnet run --project CrystalReportsService-Modern.csproj
echo.
pause