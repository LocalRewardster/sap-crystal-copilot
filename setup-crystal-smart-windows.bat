@echo off
setlocal enabledelayedexpansion

echo 🚀 Smart Crystal Reports Integration Setup
echo.

REM Step 1: Find Crystal Reports Installation
echo ===== STEP 1: Auto-detecting Crystal Reports =====
echo.

set CRYSTAL_FOUND=false
set CRYSTAL_PATH=""
set CRYSTAL_ARCH=""

REM Check common installation paths
set PATHS[0]="C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common\SAP BusinessObjects Enterprise XI 4.0\win32_x86"
set PATHS[1]="C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common\SAP BusinessObjects Enterprise XI 4.0\win64_x64"
set PATHS[2]="C:\Program Files\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common\SAP BusinessObjects Enterprise XI 4.0\win32_x86"
set PATHS[3]="C:\Program Files\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common\SAP BusinessObjects Enterprise XI 4.0\win64_x64"

for /L %%i in (0,1,3) do (
    call set "checkPath=%%PATHS[%%i]%%"
    call :findCrystal "!checkPath!" %%i
)

if "%CRYSTAL_FOUND%"=="false" (
    echo ❌ Crystal Reports SDK not found!
    echo.
    echo Please install Crystal Reports for Visual Studio from:
    echo https://www.sap.com/products/technology-platform/crystal-reports.html
    echo.
    pause
    exit /b 1
)

echo ✅ Crystal Reports found at: %CRYSTAL_PATH%
echo ✅ Architecture: %CRYSTAL_ARCH%
echo.

REM Step 2: Generate custom project file
echo ===== STEP 2: Generating Custom Project File =====
echo.

(
echo ^<Project Sdk="Microsoft.NET.Sdk.Web"^>
echo.
echo   ^<PropertyGroup^>
echo     ^<TargetFramework^>net6.0^</TargetFramework^>
echo     ^<Nullable^>enable^</Nullable^>
echo     ^<ImplicitUsings^>enable^</ImplicitUsings^>
if "%CRYSTAL_ARCH%"=="x86" (
    echo     ^<Platform^>x86^</Platform^>
    echo     ^<PlatformTarget^>x86^</PlatformTarget^>
) else (
    echo     ^<Platform^>x64^</Platform^>
    echo     ^<PlatformTarget^>x64^</PlatformTarget^>
)
echo   ^</PropertyGroup^>
echo.
echo   ^<ItemGroup^>
echo     ^<PackageReference Include="Swashbuckle.AspNetCore" Version="6.5.0" /^>
echo     ^<PackageReference Include="Microsoft.AspNetCore.Cors" Version="2.2.0" /^>
echo     ^<PackageReference Include="Newtonsoft.Json" Version="13.0.3" /^>
echo   ^</ItemGroup^>
echo.
echo   ^<ItemGroup^>
echo     ^<Reference Include="CrystalDecisions.CrystalReports.Engine"^>
echo       ^<HintPath^>%CRYSTAL_PATH%\CrystalDecisions.CrystalReports.Engine.dll^</HintPath^>
echo     ^</Reference^>
echo     ^<Reference Include="CrystalDecisions.Shared"^>
echo       ^<HintPath^>%CRYSTAL_PATH%\CrystalDecisions.Shared.dll^</HintPath^>
echo     ^</Reference^>
echo     ^<Reference Include="CrystalDecisions.ReportSource"^>
echo       ^<HintPath^>%CRYSTAL_PATH%\CrystalDecisions.ReportSource.dll^</HintPath^>
echo     ^</Reference^>
echo     ^<Reference Include="CrystalDecisions.Web"^>
echo       ^<HintPath^>%CRYSTAL_PATH%\CrystalDecisions.Web.dll^</HintPath^>
echo     ^</Reference^>
echo   ^</ItemGroup^>
echo.
echo ^</Project^>
) > crystal-service\CrystalReportsService-Auto.csproj

echo ✅ Generated: crystal-service\CrystalReportsService-Auto.csproj
echo.

REM Step 3: Build with auto-detected settings
echo ===== STEP 3: Building Crystal Service =====
echo.

cd crystal-service
dotnet build CrystalReportsService-Auto.csproj --configuration Release

if errorlevel 1 (
    echo ❌ Build failed!
    echo.
    echo Trying alternative approach...
    
    REM Try with different target framework
    (
    echo ^<Project Sdk="Microsoft.NET.Sdk.Web"^>
    echo.
    echo   ^<PropertyGroup^>
    echo     ^<TargetFramework^>net48^</TargetFramework^>
    echo     ^<UseWindowsForms^>true^</UseWindowsForms^>
    if "%CRYSTAL_ARCH%"=="x86" (
        echo     ^<Platform^>x86^</Platform^>
        echo     ^<PlatformTarget^>x86^</PlatformTarget^>
    ) else (
        echo     ^<Platform^>x64^</Platform^>
        echo     ^<PlatformTarget^>x64^</PlatformTarget^>
    )
    echo   ^</PropertyGroup^>
    echo.
    echo   ^<ItemGroup^>
    echo     ^<PackageReference Include="Microsoft.AspNetCore" Version="2.2.0" /^>
    echo     ^<PackageReference Include="Microsoft.AspNetCore.Mvc" Version="2.2.0" /^>
    echo     ^<PackageReference Include="Newtonsoft.Json" Version="13.0.3" /^>
    echo   ^</ItemGroup^>
    echo.
    echo   ^<ItemGroup^>
    echo     ^<Reference Include="CrystalDecisions.CrystalReports.Engine"^>
    echo       ^<HintPath^>%CRYSTAL_PATH%\CrystalDecisions.CrystalReports.Engine.dll^</HintPath^>
    echo     ^</Reference^>
    echo     ^<Reference Include="CrystalDecisions.Shared"^>
    echo       ^<HintPath^>%CRYSTAL_PATH%\CrystalDecisions.Shared.dll^</HintPath^>
    echo     ^</Reference^>
    echo     ^<Reference Include="CrystalDecisions.ReportSource"^>
    echo       ^<HintPath^>%CRYSTAL_PATH%\CrystalDecisions.ReportSource.dll^</HintPath^>
    echo     ^</Reference^>
    echo     ^<Reference Include="CrystalDecisions.Web"^>
    echo       ^<HintPath^>%CRYSTAL_PATH%\CrystalDecisions.Web.dll^</HintPath^>
    echo     ^</Reference^>
    echo   ^</ItemGroup^>
    echo.
    echo ^</Project^>
    ) > CrystalReportsService-Net48.csproj
    
    echo Trying .NET Framework 4.8 build...
    dotnet build CrystalReportsService-Net48.csproj --configuration Release
    
    if errorlevel 1 (
        echo ❌ Both builds failed!
        pause
        exit /b 1
    ) else (
        echo ✅ .NET Framework 4.8 build succeeded!
        set PROJECT_FILE=CrystalReportsService-Net48.csproj
    )
) else (
    echo ✅ .NET 6.0 build succeeded!
    set PROJECT_FILE=CrystalReportsService-Auto.csproj
)

cd ..

REM Step 4: Update backend configuration
echo ===== STEP 4: Updating Backend Configuration =====
echo.

REM Add Crystal service URL to backend .env
echo CRYSTAL_SERVICE_URL=http://localhost:5001 >> backend\.env
echo ✅ Updated backend\.env with Crystal service URL

echo.
echo 🎉 Crystal Reports Integration Setup Complete!
echo.
echo Next steps:
echo 1. Start Crystal service: cd crystal-service ^&^& dotnet run --project %PROJECT_FILE%
echo 2. Start backend: cd backend ^&^& python main.py
echo 3. Start frontend: cd frontend ^&^& npm run dev
echo.
pause
goto :eof

:findCrystal
set checkPath=%~1
set pathIndex=%~2
if exist %checkPath% (
    if exist "%checkPath%\CrystalDecisions.CrystalReports.Engine.dll" (
        if exist "%checkPath%\CrystalDecisions.Shared.dll" (
            set CRYSTAL_FOUND=true
            set CRYSTAL_PATH=%checkPath%
            if "%pathIndex%"=="0" set CRYSTAL_ARCH=x86
            if "%pathIndex%"=="1" set CRYSTAL_ARCH=x64
            if "%pathIndex%"=="2" set CRYSTAL_ARCH=x86
            if "%pathIndex%"=="3" set CRYSTAL_ARCH=x64
            echo ✅ Found Crystal Reports at: %checkPath%
        )
    )
)
goto :eof