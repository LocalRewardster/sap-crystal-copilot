#!/bin/bash

# SAP Crystal Copilot - Initial Setup Script

set -e

echo "🔧 SAP Crystal Copilot - Initial Setup"
echo "====================================="

# Check system requirements
echo "📋 Checking system requirements..."

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3.11+ is required but not installed"
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "✅ Python $PYTHON_VERSION found"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 18+ is required but not installed"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js $NODE_VERSION found"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required but not installed"
    exit 1
fi

DOCKER_VERSION=$(docker --version)
echo "✅ $DOCKER_VERSION found"

# Setup backend
echo ""
echo "🐍 Setting up backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create environment file
if [ ! -f ".env" ]; then
    echo "📝 Creating backend environment file..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your API keys"
fi

# Create necessary directories
mkdir -p uploads data logs

echo "✅ Backend setup complete"

cd ..

# Setup frontend
echo ""
echo "🎨 Setting up frontend..."
cd frontend

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Create environment file
if [ ! -f ".env.local" ]; then
    echo "📝 Creating frontend environment file..."
    cp .env.example .env.local
fi

echo "✅ Frontend setup complete"

cd ..

# Setup Docker
echo ""
echo "🐳 Setting up Docker environment..."

# Create Docker environment file
if [ ! -f ".env" ]; then
    echo "📝 Creating Docker environment file..."
    cat > .env << EOF
# Docker Environment Variables
OPENROUTER_API_KEY=your-openrouter-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here
EOF
    echo "⚠️  Please edit .env with your API keys for Docker deployment"
fi

# Build Docker images
echo "🔨 Building Docker images..."
docker-compose build

echo "✅ Docker setup complete"

# Final instructions
echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your API keys (OpenRouter, OpenAI, Anthropic)"
echo "2. Edit .env with your API keys for Docker deployment"
echo "3. Run './scripts/start-dev.sh' to start development environment"
echo "4. Or run 'docker-compose up' to start with Docker"
echo ""
echo "Documentation:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000/docs"
echo "- README.md for detailed instructions"
echo ""