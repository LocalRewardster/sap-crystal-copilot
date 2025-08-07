@echo off
setlocal enabledelayedexpansion

echo 🏗️ Building Crystal Reports Service with Classic .NET Framework
echo.

cd crystal-service

echo ===== CHECKING .NET FRAMEWORK BUILD TOOLS =====
echo.

set MSBUILD_PATH=""

REM Check for MSBuild in PATH first
where msbuild >nul 2>nul
if not errorlevel 1 (
    set MSBUILD_PATH=msbuild
    echo ✅ MSBuild found in PATH
    goto :build
)

echo ❌ MSBuild not found in PATH
echo.
echo Trying Visual Studio locations...

REM Try Visual Studio 2022 Professional
if exist "C:\Program Files\Microsoft Visual Studio\2022\Professional\MSBuild\Current\Bin\MSBuild.exe" (
    set "MSBUILD_PATH=C:\Program Files\Microsoft Visual Studio\2022\Professional\MSBuild\Current\Bin\MSBuild.exe"
    echo ✅ Found MSBuild at: !MSBUILD_PATH!
    goto :build
)

REM Try Visual Studio 2022 Community
if exist "C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\MSBuild.exe" (
    set "MSBUILD_PATH=C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\MSBuild.exe"
    echo ✅ Found MSBuild at: !MSBUILD_PATH!
    goto :build
)

REM Try Visual Studio 2022 Enterprise
if exist "C:\Program Files\Microsoft Visual Studio\2022\Enterprise\MSBuild\Current\Bin\MSBuild.exe" (
    set "MSBUILD_PATH=C:\Program Files\Microsoft Visual Studio\2022\Enterprise\MSBuild\Current\Bin\MSBuild.exe"
    echo ✅ Found MSBuild at: !MSBUILD_PATH!
    goto :build
)

REM Try Build Tools for Visual Studio 2022
if exist "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\MSBuild\Current\Bin\MSBuild.exe" (
    set "MSBUILD_PATH=C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\MSBuild\Current\Bin\MSBuild.exe"
    echo ✅ Found MSBuild at: !MSBUILD_PATH!
    goto :build
)

REM Try older Visual Studio 2019 locations
if exist "C:\Program Files (x86)\Microsoft Visual Studio\2019\Professional\MSBuild\Current\Bin\MSBuild.exe" (
    set "MSBUILD_PATH=C:\Program Files (x86)\Microsoft Visual Studio\2019\Professional\MSBuild\Current\Bin\MSBuild.exe"
    echo ✅ Found MSBuild at: !MSBUILD_PATH!
    goto :build
)

if exist "C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\MSBuild\Current\Bin\MSBuild.exe" (
    set "MSBUILD_PATH=C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\MSBuild\Current\Bin\MSBuild.exe"
    echo ✅ Found MSBuild at: !MSBUILD_PATH!
    goto :build
)

REM Try MSBuild standalone installation
if exist "C:\Program Files (x86)\Microsoft Visual Studio\2019\BuildTools\MSBuild\Current\Bin\MSBuild.exe" (
    set "MSBUILD_PATH=C:\Program Files (x86)\Microsoft Visual Studio\2019\BuildTools\MSBuild\Current\Bin\MSBuild.exe"
    echo ✅ Found MSBuild at: !MSBUILD_PATH!
    goto :build
)

REM Try even older locations
if exist "C:\Program Files (x86)\MSBuild\14.0\Bin\MSBuild.exe" (
    set "MSBUILD_PATH=C:\Program Files (x86)\MSBuild\14.0\Bin\MSBuild.exe"
    echo ✅ Found MSBuild at: !MSBUILD_PATH!
    goto :build
)

echo ❌ MSBuild not found in any standard location!
echo.
echo Please install one of:
echo 1. Visual Studio 2022 (any edition)
echo 2. Build Tools for Visual Studio 2022
echo 3. .NET Framework 4.8 Developer Pack
echo.
echo Downloads:
echo - Visual Studio: https://visualstudio.microsoft.com/downloads/
echo - Build Tools: https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools
echo - .NET Framework: https://dotnet.microsoft.com/download/dotnet-framework/net48
echo.
pause
exit /b 1

:build
echo.
echo ===== BUILDING WITH CLASSIC .NET FRAMEWORK =====
echo.

echo Building CrystalReportsService-Framework.csproj...
echo Using MSBuild: !MSBUILD_PATH!
echo.

"!MSBUILD_PATH!" CrystalReportsService-Framework.csproj /p:Configuration=Release /p:Platform=x86 /v:minimal /nologo

if errorlevel 1 (
    echo.
    echo ❌ Build failed!
    echo.
    echo Let's check what went wrong:
    echo.
    echo 1. Checking Crystal Reports DLL paths...
    if exist "C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\CrystalDecisions.CrystalReports.Engine.dll" (
        echo ✅ Engine DLL found
    ) else (
        echo ❌ Engine DLL NOT found
    )
    
    if exist "C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\CrystalDecisions.Shared.dll" (
        echo ✅ Shared DLL found
    ) else (
        echo ❌ Shared DLL NOT found
    )
    
    echo.
    echo 2. Try running with verbose output:
    echo "!MSBUILD_PATH!" CrystalReportsService-Framework.csproj /p:Configuration=Release /p:Platform=x86 /v:detailed
    echo.
    pause
    exit /b 1
) else (
    echo.
    echo ✅ BUILD SUCCESSFUL! 🎉
    echo.
    echo Crystal Reports Service built with classic .NET Framework!
    echo.
    echo Executable: bin\Release\CrystalReportsService.exe
    echo.
    echo Testing the service...
    if exist "bin\Release\CrystalReportsService.exe" (
        echo.
        echo Running health check...
        bin\Release\CrystalReportsService.exe
    ) else (
        echo ❌ Executable not found at expected location
        echo Looking for output files...
        dir bin\Release\ 2>nul
    )
)

cd ..

echo.
echo 🎉 CLASSIC .NET FRAMEWORK BUILD COMPLETE!
echo.
pause