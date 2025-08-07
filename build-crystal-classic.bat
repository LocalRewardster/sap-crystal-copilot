@echo off
echo 🏗️ Building Crystal Reports Service - Pure Classic .NET Framework (No NuGet)
echo.

cd crystal-service

echo ===== BUILDING CLASSIC .NET FRAMEWORK (NO NUGET) =====
echo.

echo Building CrystalReportsService-Classic.csproj...
echo Using MSBuild: "C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\MSBuild.exe"
echo.

"C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\MSBuild.exe" CrystalReportsService-Classic.csproj /p:Configuration=Release /p:Platform=x86 /v:minimal /nologo /p:RestorePackages=false

if errorlevel 1 (
    echo.
    echo ❌ Build failed! Let's try with verbose output...
    echo.
    "C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\MSBuild.exe" CrystalReportsService-Classic.csproj /p:Configuration=Release /p:Platform=x86 /v:normal /p:RestorePackages=false
    pause
    exit /b 1
) else (
    echo.
    echo ✅ BUILD SUCCESSFUL! 🎉
    echo.
    echo Crystal Reports Service built successfully!
    echo.
    echo Executable: bin\Release\CrystalReportsService.exe
    echo.
    echo Testing the service...
    if exist "bin\Release\CrystalReportsService.exe" (
        echo.
        echo Running health check...
        bin\Release\CrystalReportsService.exe
    ) else (
        echo ❌ Executable not found
        echo Looking for build output...
        dir bin\Release\ 2>nul
    )
)

cd ..
pause