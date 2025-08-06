#!/bin/bash
echo "🚀 Starting Crystal Copilot Frontend..."
echo "📁 Changing to frontend directory..."
cd frontend

echo "🔍 Checking if dependencies are installed..."
if [ ! -d "node_modules" ]; then
    echo "⚠️ Installing dependencies..."
    npm install
fi

echo "🎨 Starting development server..."
npm run dev