@echo off
echo 🔍 Crystal Reports Detailed Installation Check
echo.

echo ===== CRYSTAL REPORTS FOUND =====
echo ✅ Crystal Reports for .NET Framework 4.0 detected!
echo.

echo Checking Crystal Reports directory structure...
if exist "C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0" (
    echo ✅ Main Crystal Reports directory exists
    dir "C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0" /AD
    echo.
    
    echo Checking Common directory...
    if exist "C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common" (
        echo ✅ Common directory found
        dir "C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common" /AD
        echo.
        
        echo Checking SAP BusinessObjects Enterprise XI 4.0...
        if exist "C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common\SAP BusinessObjects Enterprise XI 4.0" (
            echo ✅ Enterprise XI 4.0 directory found
            dir "C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common\SAP BusinessObjects Enterprise XI 4.0" /AD
            echo.
            
            echo Checking architecture directories...
            if exist "C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common\SAP BusinessObjects Enterprise XI 4.0\win32_x86" (
                echo ✅ win32_x86 directory found
                echo Contents:
                dir "C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common\SAP BusinessObjects Enterprise XI 4.0\win32_x86\Crystal*.dll" 2>nul
                echo.
            ) else (
                echo ❌ win32_x86 directory not found
            )
            
            if exist "C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common\SAP BusinessObjects Enterprise XI 4.0\win64_x64" (
                echo ✅ win64_x64 directory found
                echo Contents:
                dir "C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common\SAP BusinessObjects Enterprise XI 4.0\win64_x64\Crystal*.dll" 2>nul
                echo.
            ) else (
                echo ❌ win64_x64 directory not found
            )
        ) else (
            echo ❌ Enterprise XI 4.0 directory not found
        )
    ) else (
        echo ❌ Common directory not found
    )
) else (
    echo ❌ Main Crystal Reports directory not found
)

echo ===== CHECKING ALTERNATIVE LOCATIONS =====
echo.

echo Checking Assemblies directory...
if exist "C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Assemblies" (
    echo ✅ Assemblies directory found
    dir "C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Assemblies\Crystal*.dll"
    echo.
) else (
    echo ❌ Assemblies directory not found
)

echo Checking RedistDotNet40 directory...
if exist "C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\RedistDotNet40" (
    echo ✅ RedistDotNet40 directory found
    dir "C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\RedistDotNet40\Crystal*.dll"
    echo.
) else (
    echo ❌ RedistDotNet40 directory not found
)

echo ===== SEARCHING FOR CRYSTAL DLLs =====
echo.

echo Searching for CrystalDecisions.CrystalReports.Engine.dll...
for /r "C:\Program Files (x86)\SAP BusinessObjects" %%f in (CrystalDecisions.CrystalReports.Engine.dll) do (
    echo ✅ Found: %%f
)

echo.
echo Searching for CrystalDecisions.Shared.dll...
for /r "C:\Program Files (x86)\SAP BusinessObjects" %%f in (CrystalDecisions.Shared.dll) do (
    echo ✅ Found: %%f
)

echo.
echo ===== SUMMARY =====
echo.
echo This will help us create the correct project file with the right DLL paths.
echo.
pause