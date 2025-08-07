@echo off
echo 🔍 Crystal Reports DLL Path Verification
echo.

echo ===== CHECKING EXACT PATHS =====
echo.

set "BASE_PATH=C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0"

echo Base path: %BASE_PATH%
if exist "%BASE_PATH%" (
    echo ✅ Base directory exists
) else (
    echo ❌ Base directory does not exist
)

echo.
echo ===== LISTING CONTENTS =====
if exist "%BASE_PATH%" (
    echo Contents of Crystal Reports directory:
    dir "%BASE_PATH%" /B
    echo.
    
    echo Looking for Crystal*.dll files:
    dir "%BASE_PATH%\Crystal*.dll" 2>nul
    echo.
    
    echo Looking for all .dll files:
    dir "%BASE_PATH%\*.dll" 2>nul
    echo.
) else (
    echo Cannot list contents - directory not found
)

echo ===== TESTING INDIVIDUAL FILES =====
echo.

set "ENGINE_DLL=%BASE_PATH%\CrystalDecisions.CrystalReports.Engine.dll"
set "SHARED_DLL=%BASE_PATH%\CrystalDecisions.Shared.dll"

echo Testing Engine DLL: %ENGINE_DLL%
if exist "%ENGINE_DLL%" (
    echo ✅ CrystalDecisions.CrystalReports.Engine.dll EXISTS
    dir "%ENGINE_DLL%"
) else (
    echo ❌ CrystalDecisions.CrystalReports.Engine.dll NOT FOUND
)

echo.
echo Testing Shared DLL: %SHARED_DLL%
if exist "%SHARED_DLL%" (
    echo ✅ CrystalDecisions.Shared.dll EXISTS
    dir "%SHARED_DLL%"
) else (
    echo ❌ CrystalDecisions.Shared.dll NOT FOUND
)

echo.
echo ===== ALTERNATIVE LOCATIONS =====
echo.

echo Checking Common directory:
if exist "%BASE_PATH%\Common\CrystalDecisions.CrystalReports.Engine.dll" (
    echo ✅ Found in Common directory
    set "ALT_ENGINE=%BASE_PATH%\Common\CrystalDecisions.CrystalReports.Engine.dll"
    set "ALT_SHARED=%BASE_PATH%\Common\CrystalDecisions.Shared.dll"
    echo Engine: !ALT_ENGINE!
    echo Shared: !ALT_SHARED!
) else (
    echo ❌ Not found in Common directory
)

echo.
echo Checking managed\dotnet4 directory:
if exist "%BASE_PATH%\Common\SAP BusinessObjects Enterprise XI 4.0\managed\dotnet4\CrystalDecisions.CrystalReports.Engine.dll" (
    echo ✅ Found in managed\dotnet4 directory
    set "MANAGED_ENGINE=%BASE_PATH%\Common\SAP BusinessObjects Enterprise XI 4.0\managed\dotnet4\CrystalDecisions.CrystalReports.Engine.dll"
    set "MANAGED_SHARED=%BASE_PATH%\Common\SAP BusinessObjects Enterprise XI 4.0\managed\dotnet4\CrystalDecisions.Shared.dll"
    echo Engine: !MANAGED_ENGINE!
    echo Shared: !MANAGED_SHARED!
) else (
    echo ❌ Not found in managed\dotnet4 directory
)

echo.
echo ===== SUMMARY =====
echo.
echo This will show us the exact paths to use for the project file.
echo.
pause