@echo off
echo 🚀 NUCLEAR TAILWIND CSS FIX FOR WINDOWS
echo =====================================

cd frontend

echo.
echo 🧹 Step 1: Complete cleanup...
if exist "node_modules" rmdir /s /q node_modules
if exist ".next" rmdir /s /q .next
if exist "package-lock.json" del package-lock.json
if exist "tailwind.config.js" del tailwind.config.js
if exist "postcss.config.js" del postcss.config.js

echo.
echo 📦 Step 2: Fresh npm install...
npm cache clean --force
npm install

echo.
echo 🎨 Step 3: Install Tailwind CSS specifically...
npm install -D tailwindcss@3.4.0 postcss@8.4.32 autoprefixer@10.4.16

echo.
echo ⚙️ Step 4: Create Tailwind config manually...
echo /** @type {import('tailwindcss').Config} */ > tailwind.config.js
echo module.exports = { >> tailwind.config.js
echo   content: [ >> tailwind.config.js
echo     "./src/pages/**/*.{js,ts,jsx,tsx,mdx}", >> tailwind.config.js
echo     "./src/components/**/*.{js,ts,jsx,tsx,mdx}", >> tailwind.config.js
echo     "./src/app/**/*.{js,ts,jsx,tsx,mdx}", >> tailwind.config.js
echo   ], >> tailwind.config.js
echo   theme: { >> tailwind.config.js
echo     extend: {}, >> tailwind.config.js
echo   }, >> tailwind.config.js
echo   plugins: [], >> tailwind.config.js
echo } >> tailwind.config.js

echo.
echo 📝 Step 5: Create PostCSS config...
echo module.exports = { > postcss.config.js
echo   plugins: { >> postcss.config.js
echo     tailwindcss: {}, >> postcss.config.js
echo     autoprefixer: {}, >> postcss.config.js
echo   }, >> postcss.config.js
echo } >> postcss.config.js

echo.
echo 🔧 Step 6: Build Tailwind CSS manually...
node_modules\.bin\tailwindcss -i ./src/app/globals.css -o ./tailwind-output.css

echo.
echo 🚀 Step 7: Starting dev server...
npm run dev

pause