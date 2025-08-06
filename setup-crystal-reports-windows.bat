@echo off
echo Setting up Crystal Reports parsing on Windows...

REM Check if Crystal Reports is installed
echo.
echo Checking for Crystal Reports installations...

REM Common Crystal Reports installation paths
set CR_PATHS[0]="C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common\Crystal Reports 2020"
set CR_PATHS[1]="C:\Program Files\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common"
set CR_PATHS[2]="C:\Program Files (x86)\Common Files\Crystal Decisions\2.5\bin"
set CR_PATHS[3]="C:\Program Files\Common Files\Crystal Decisions\2.5\bin"

echo Searching for RptToXml.exe...
for %%i in (0 1 2 3) do (
    if exist !CR_PATHS[%%i]!\RptToXml.exe (
        echo Found RptToXml.exe at: !CR_PATHS[%%i]!
        set RPTTOXML_PATH=!CR_PATHS[%%i]!\RptToXml.exe
        goto :found
    )
)

echo.
echo ❌ RptToXml.exe not found in common locations.
echo.
echo Please install one of the following:
echo 1. SAP Crystal Reports for Visual Studio (Free)
echo 2. Crystal Reports Runtime
echo 3. SAP Crystal Reports Developer Edition
echo.
echo Download from: https://www.sap.com/products/technology-platform/crystal-reports.html
echo.
pause
exit /b 1

:found
echo.
echo ✅ Found Crystal Reports installation!
echo.
echo Updating backend configuration...

REM Update the .env file
cd backend
if not exist .env (
    copy .env.example .env
)

REM Create a temporary PowerShell script to update .env
echo $content = Get-Content '.env' > update_env.ps1
echo $content = $content -replace 'RPTTOXML_PATH=.*', 'RPTTOXML_PATH=%RPTTOXML_PATH:\=/%' >> update_env.ps1
echo $content ^| Set-Content '.env' >> update_env.ps1

powershell -ExecutionPolicy Bypass -File update_env.ps1
del update_env.ps1

echo.
echo ✅ Backend configured with Crystal Reports path!
echo.
echo Configuration:
echo RPTTOXML_PATH=%RPTTOXML_PATH%
echo.
echo Now restart your backend server to use real Crystal Reports parsing!
echo.
pause