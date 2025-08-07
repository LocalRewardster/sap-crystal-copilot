@echo off
echo 🏗️ Building Crystal Reports Service with Classic .NET Framework
echo.

cd crystal-service

echo ===== CHECKING .NET FRAMEWORK BUILD TOOLS =====
echo.

REM Check for MSBuild
where msbuild >nul 2>nul
if errorlevel 1 (
    echo ❌ MSBuild not found in PATH
    echo.
    echo Trying Visual Studio locations...
    
    REM Try Visual Studio 2022
    if exist "C:\Program Files\Microsoft Visual Studio\2022\Professional\MSBuild\Current\Bin\MSBuild.exe" (
        set MSBUILD_PATH="C:\Program Files\Microsoft Visual Studio\2022\Professional\MSBuild\Current\Bin\MSBuild.exe"
        echo ✅ Found MSBuild at: !MSBUILD_PATH!
    ) else if exist "C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\MSBuild.exe" (
        set MSBUILD_PATH="C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\MSBuild.exe"
        echo ✅ Found MSBuild at: !MSBUILD_PATH!
    ) else if exist "C:\Program Files\Microsoft Visual Studio\2022\Enterprise\MSBuild\Current\Bin\MSBuild.exe" (
        set MSBUILD_PATH="C:\Program Files\Microsoft Visual Studio\2022\Enterprise\MSBuild\Current\Bin\MSBuild.exe"
        echo ✅ Found MSBuild at: !MSBUILD_PATH!
    ) else (
        REM Try Build Tools for Visual Studio
        if exist "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\MSBuild\Current\Bin\MSBuild.exe" (
            set MSBUILD_PATH="C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\MSBuild\Current\Bin\MSBuild.exe"
            echo ✅ Found MSBuild at: !MSBUILD_PATH!
        ) else (
            echo ❌ MSBuild not found!
            echo.
            echo Please install one of:
            echo 1. Visual Studio 2022 (any edition)
            echo 2. Build Tools for Visual Studio 2022
            echo.
            echo Download from: https://visualstudio.microsoft.com/downloads/
            pause
            exit /b 1
        )
    )
) else (
    set MSBUILD_PATH=msbuild
    echo ✅ MSBuild found in PATH
)

echo.
echo ===== BUILDING WITH CLASSIC .NET FRAMEWORK =====
echo.

echo Building CrystalReportsService-Framework.csproj...
%MSBUILD_PATH% CrystalReportsService-Framework.csproj /p:Configuration=Release /p:Platform=x86 /v:normal

if errorlevel 1 (
    echo ❌ Build failed!
    echo.
    echo This might be due to:
    echo 1. Missing Crystal Reports DLLs at the specified paths
    echo 2. Missing .NET Framework 4.8 targeting pack
    echo 3. Missing Visual Studio build tools
    echo.
    pause
    exit /b 1
) else (
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
    )
)

cd ..

echo.
echo 🎉 CLASSIC .NET FRAMEWORK BUILD COMPLETE!
echo.
echo This approach uses:
echo ✅ Classic .NET Framework 4.8 (fully compatible with Crystal Reports)
echo ✅ MSBuild (proper build system for .NET Framework)
echo ✅ Your exact Crystal Reports DLL paths
echo ✅ No modern .NET SDK compatibility issues
echo.
pause