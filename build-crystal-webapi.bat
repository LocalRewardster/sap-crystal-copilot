@echo off
echo 🌐 Building Crystal Reports Web API Service
echo.

cd crystal-service

echo ===== STEP 1: Download Newtonsoft.Json =====
echo.

if not exist "lib" mkdir lib

if not exist "lib\Newtonsoft.Json.dll" (
    echo Downloading Newtonsoft.Json.dll...
    
    REM Try to download from NuGet
    powershell -Command "& {
        $url = 'https://www.nuget.org/api/v2/package/Newtonsoft.Json/13.0.3'
        $output = 'newtonsoft.zip'
        try {
            Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
            Expand-Archive -Path $output -DestinationPath 'temp' -Force
            Copy-Item 'temp\lib\net45\Newtonsoft.Json.dll' 'lib\Newtonsoft.Json.dll'
            Remove-Item $output -Force
            Remove-Item 'temp' -Recurse -Force
            Write-Host '✅ Downloaded Newtonsoft.Json.dll'
        } catch {
            Write-Host '❌ Failed to download Newtonsoft.Json.dll'
            Write-Host $_.Exception.Message
        }
    }"
) else (
    echo ✅ Newtonsoft.Json.dll already exists
)

echo.
echo ===== STEP 2: Build Web API Service =====
echo.

echo Building CrystalReportsService-WebAPI.csproj...
"C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\MSBuild.exe" CrystalReportsService-WebAPI.csproj /p:Configuration=Release /p:Platform=x86 /v:minimal /nologo /p:RestorePackages=false

if errorlevel 1 (
    echo ❌ Build failed!
    pause
    exit /b 1
) else (
    echo ✅ BUILD SUCCESSFUL! 🎉
    echo.
    echo Crystal Reports Web API Service is ready!
    echo.
    echo Executable: bin\Release\CrystalReportsWebAPI.exe
    echo.
    echo Starting the Web API service...
    if exist "bin\Release\CrystalReportsWebAPI.exe" (
        echo.
        echo 🚀 Starting Crystal Reports Web API on http://localhost:5001
        echo.
        start "Crystal Reports API" bin\Release\CrystalReportsWebAPI.exe
        
        echo Waiting for service to start...
        timeout /t 3 >nul
        
        echo Testing health endpoint...
        powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:5001/api/crystalreports/health' -Method Get; Write-Host '✅ API is responding:'; Write-Host ($response | ConvertTo-Json) } catch { Write-Host '❌ API not responding yet - check the console window' }"
    ) else (
        echo ❌ Executable not found
    )
)

cd ..

echo.
echo 🎉 Crystal Reports Web API is running!
echo.
echo The service provides these endpoints:
echo   GET  http://localhost:5001/api/crystalreports/health
echo   POST http://localhost:5001/api/crystalreports/metadata
echo   POST http://localhost:5001/api/crystalreports/preview  
echo   POST http://localhost:5001/api/crystalreports/field-operation
echo.
echo Your backend should now be able to connect to the Crystal Reports service!
echo.
pause