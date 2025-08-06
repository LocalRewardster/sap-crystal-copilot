#!/bin/bash

# SAP Crystal Copilot - Development Startup Script

set -e

echo "🚀 Starting SAP Crystal Copilot Development Environment"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Check if required environment variables are set
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend environment file from example..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with your API keys before continuing"
fi

if [ ! -f frontend/.env.local ]; then
    echo "📝 Creating frontend environment file from example..."
    cp frontend/.env.example frontend/.env.local
fi

# Start services
echo "🐳 Starting Docker services..."
docker-compose up -d redis

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
sleep 5

# Start backend
echo "🔧 Starting backend API server..."
cd backend
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

# Start backend in background
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

cd ..

# Start frontend
echo "🎨 Starting frontend development server..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Start frontend in background
npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo "✅ Development environment started successfully!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "📊 Metrics: http://localhost:8000/metrics"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    docker-compose down
    echo "✅ All services stopped"
}

# Trap exit signals
trap cleanup EXIT INT TERM

# Wait for user to stop
wait