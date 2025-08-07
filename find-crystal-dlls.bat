@echo off
setlocal enabledelayedexpansion

echo 🔍 Crystal Reports DLL Hunter
echo.

set "BASE_PATH=C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0"

echo ===== SEARCHING FOR CRYSTAL REPORTS DLLs =====
echo.

echo Searching for CrystalDecisions.CrystalReports.Engine.dll...
set ENGINE_FOUND=false
set ENGINE_PATH=""

for /r "%BASE_PATH%" %%f in (CrystalDecisions.CrystalReports.Engine.dll) do (
    echo ✅ FOUND ENGINE: %%f
    set ENGINE_FOUND=true
    set ENGINE_PATH=%%f
    goto :found_engine
)

:found_engine
echo.
echo Searching for CrystalDecisions.Shared.dll...
set SHARED_FOUND=false
set SHARED_PATH=""

for /r "%BASE_PATH%" %%f in (CrystalDecisions.Shared.dll) do (
    echo ✅ FOUND SHARED: %%f
    set SHARED_FOUND=true
    set SHARED_PATH=%%f
    goto :found_shared
)

:found_shared
echo.
echo ===== BEST PATHS FOR PROJECT FILE =====
echo.

if "%ENGINE_FOUND%"=="true" if "%SHARED_FOUND%"=="true" (
    echo Engine DLL: !ENGINE_PATH!
    echo Shared DLL: !SHARED_PATH!
    echo.
    echo ===== GENERATING PROJECT FILE SNIPPET =====
    echo.
    echo ^<ItemGroup^>
    echo   ^<Reference Include="CrystalDecisions.CrystalReports.Engine"^>
    echo     ^<HintPath^>!ENGINE_PATH!^</HintPath^>
    echo     ^<Private^>true^</Private^>
    echo     ^<SpecificVersion^>false^</SpecificVersion^>
    echo   ^</Reference^>
    echo   ^<Reference Include="CrystalDecisions.Shared"^>
    echo     ^<HintPath^>!SHARED_PATH!^</HintPath^>
    echo     ^<Private^>true^</Private^>
    echo     ^<SpecificVersion^>false^</SpecificVersion^>
    echo   ^</Reference^>
    echo ^</ItemGroup^>
    echo.
    echo ===== CREATING WORKING PROJECT FILE =====
    echo.
    
    REM Create a working project file with the found paths
    (
    echo ^<Project Sdk="Microsoft.NET.Sdk.Web"^>
    echo.
    echo   ^<PropertyGroup^>
    echo     ^<TargetFramework^>net6.0^</TargetFramework^>
    echo     ^<Nullable^>enable^</Nullable^>
    echo     ^<ImplicitUsings^>enable^</ImplicitUsings^>
    echo     ^<Platform^>x86^</Platform^>
    echo     ^<PlatformTarget^>x86^</PlatformTarget^>
    echo     ^<LangVersion^>10.0^</LangVersion^>
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
    echo       ^<HintPath^>!ENGINE_PATH!^</HintPath^>
    echo       ^<Private^>true^</Private^>
    echo       ^<SpecificVersion^>false^</SpecificVersion^>
    echo     ^</Reference^>
    echo     ^<Reference Include="CrystalDecisions.Shared"^>
    echo       ^<HintPath^>!SHARED_PATH!^</HintPath^>
    echo       ^<Private^>true^</Private^>
    echo       ^<SpecificVersion^>false^</SpecificVersion^>
    echo     ^</Reference^>
    echo   ^</ItemGroup^>
    echo.
    echo ^</Project^>
    ) > crystal-service\CrystalReportsService-Working.csproj
    
    echo ✅ Created: crystal-service\CrystalReportsService-Working.csproj
    echo.
    echo 🚀 Now try: cd crystal-service ^&^& dotnet build CrystalReportsService-Working.csproj
    
) else (
    echo ❌ Could not find both required DLLs
    echo Engine found: %ENGINE_FOUND%
    echo Shared found: %SHARED_FOUND%
)

echo.
pause