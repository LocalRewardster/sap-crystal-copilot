@echo off
echo 🔨 Manual Crystal Reports Service Build
echo.

cd crystal-service

echo ===== STEP 1: Check .NET Framework 4.8 =====
echo.

dotnet --list-sdks | findstr "6.0" >nul
if errorlevel 1 (
    echo ❌ .NET 6.0 SDK not found
    echo Please install .NET 6.0 SDK from: https://dotnet.microsoft.com/download
    pause
    exit /b 1
) else (
    echo ✅ .NET 6.0 SDK found
)

echo.
echo ===== STEP 2: Build Crystal Service (.NET Framework 4.8) =====
echo.

echo Building with manual project file...
dotnet build CrystalReportsService-Manual.csproj --configuration Release --verbosity normal

if errorlevel 1 (
    echo.
    echo ❌ Build failed! Let's check what DLLs are actually available...
    echo.
    
    echo Searching for Crystal Reports DLLs...
    echo.
    echo === Assemblies folder ===
    if exist "C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Assemblies" (
        dir "C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Assemblies\Crystal*.dll"
    ) else (
        echo Assemblies folder not found
    )
    
    echo.
    echo === RedistDotNet40 folder ===
    if exist "C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\RedistDotNet40" (
        dir "C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\RedistDotNet40\Crystal*.dll"
    ) else (
        echo RedistDotNet40 folder not found
    )
    
    echo.
    echo Please share this output so we can create the correct project file.
    pause
    exit /b 1
) else (
    echo.
    echo ✅ BUILD SUCCESSFUL!
    echo.
    echo Crystal Reports Service built successfully.
    echo You can now run: dotnet run --project CrystalReportsService-Manual.csproj
    echo.
)

cd ..

echo.
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
echo 🎉 Manual setup complete!
echo.
echo Next steps:
echo 1. Start Crystal service: cd crystal-service && dotnet run --project CrystalReportsService-Manual.csproj
echo 2. Start backend: cd backend && python main.py  
echo 3. Start frontend: cd frontend && npm run dev
echo.
pause