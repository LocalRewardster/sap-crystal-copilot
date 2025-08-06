@echo off
echo 🔍 Crystal Reports Installation Diagnostic Tool
echo.

echo ===== CHECKING CRYSTAL REPORTS INSTALLATIONS =====
echo.

REM Check for Crystal Reports installations
echo 1. Checking Program Files (x86)...
if exist "C:\Program Files (x86)\SAP BusinessObjects\" (
    echo ✅ Found SAP BusinessObjects in Program Files (x86)
    dir "C:\Program Files (x86)\SAP BusinessObjects\" /AD
    echo.
) else (
    echo ❌ No SAP BusinessObjects in Program Files (x86)
)

echo 2. Checking Program Files...
if exist "C:\Program Files\SAP BusinessObjects\" (
    echo ✅ Found SAP BusinessObjects in Program Files
    dir "C:\Program Files\SAP BusinessObjects\" /AD
    echo.
) else (
    echo ❌ No SAP BusinessObjects in Program Files
)

echo ===== CHECKING CRYSTAL REPORTS DLL FILES =====
echo.

REM Common Crystal Reports DLL locations
set PATHS[0]="C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common\SAP BusinessObjects Enterprise XI 4.0\win32_x86"
set PATHS[1]="C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common\SAP BusinessObjects Enterprise XI 4.0\win64_x64"
set PATHS[2]="C:\Program Files\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common\SAP BusinessObjects Enterprise XI 4.0\win32_x86"
set PATHS[3]="C:\Program Files\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common\SAP BusinessObjects Enterprise XI 4.0\win64_x64"
set PATHS[4]="C:\Windows\assembly\GAC_MSIL\CrystalDecisions.CrystalReports.Engine"
set PATHS[5]="C:\Windows\Microsoft.NET\assembly\GAC_MSIL\CrystalDecisions.CrystalReports.Engine"

echo 3. Checking for Crystal Reports DLLs...
for /L %%i in (0,1,5) do (
    call set "path=%%PATHS[%%i]%%"
    call :checkPath "!path!"
)

echo.
echo ===== CHECKING GLOBAL ASSEMBLY CACHE =====
echo.

echo 4. Checking GAC for Crystal Reports assemblies...
gacutil /l | findstr /i crystal 2>nul
if errorlevel 1 (
    echo ❌ No Crystal Reports assemblies found in GAC
) else (
    echo ✅ Found Crystal Reports assemblies in GAC
)

echo.
echo ===== CHECKING REGISTRY =====
echo.

echo 5. Checking registry for Crystal Reports...
reg query "HKLM\SOFTWARE\SAP BusinessObjects" 2>nul
if errorlevel 1 (
    echo ❌ No Crystal Reports registry entries found
) else (
    echo ✅ Found Crystal Reports registry entries
)

echo.
echo ===== RECOMMENDATIONS =====
echo.

echo If no Crystal Reports installation found, install one of:
echo.
echo 1. Crystal Reports for Visual Studio (FREE):
echo    https://www.sap.com/products/technology-platform/crystal-reports.html
echo.
echo 2. Crystal Reports Runtime:
echo    https://help.sap.com/docs/SAP_CRYSTAL_REPORTS
echo.
echo 3. SAP Crystal Reports Developer Edition
echo.
pause
goto :eof

:checkPath
set checkPath=%~1
if exist %checkPath% (
    echo ✅ Found directory: %checkPath%
    if exist "%checkPath%\CrystalDecisions.CrystalReports.Engine.dll" (
        echo   ✅ CrystalDecisions.CrystalReports.Engine.dll found
    ) else (
        echo   ❌ CrystalDecisions.CrystalReports.Engine.dll NOT found
    )
    if exist "%checkPath%\CrystalDecisions.Shared.dll" (
        echo   ✅ CrystalDecisions.Shared.dll found
    ) else (
        echo   ❌ CrystalDecisions.Shared.dll NOT found
    )
) else (
    echo ❌ Directory not found: %checkPath%
)
goto :eof