@echo off
echo 🔍 TAILWIND CSS DIAGNOSTIC FOR WINDOWS
echo =====================================

echo.
echo 📁 Checking frontend directory...
cd frontend
if not exist "node_modules" (
    echo ❌ node_modules missing! Installing dependencies...
    npm install
) else (
    echo ✅ node_modules exists
)

echo.
echo 🎨 Checking Tailwind CSS installation...
npm list tailwindcss
if errorlevel 1 (
    echo ❌ Tailwind CSS not installed! Installing...
    npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
    npx tailwindcss init -p
) else (
    echo ✅ Tailwind CSS is installed
)

echo.
echo 📝 Checking tailwind.config.js...
if exist "tailwind.config.js" (
    echo ✅ tailwind.config.js exists
    type tailwind.config.js | findstr "content"
) else (
    echo ❌ tailwind.config.js missing!
)

echo.
echo 🎯 Checking globals.css...
if exist "src\app\globals.css" (
    echo ✅ globals.css exists
    findstr "@tailwind" "src\app\globals.css"
) else (
    echo ❌ globals.css missing!
)

echo.
echo 🚀 Building Tailwind CSS manually...
npx tailwindcss -i ./src/app/globals.css -o ./tailwind-output.css --watch

echo.
echo 📊 DIAGNOSIS COMPLETE!
pause