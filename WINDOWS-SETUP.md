# SAP Crystal Copilot - Windows Setup Guide

This guide will help you set up and run the SAP Crystal Copilot AI Report Editor on Windows.

## 🎯 Prerequisites

### Required Software
1. **Python 3.11+** - Download from [python.org](https://www.python.org/downloads/)
   - ✅ Make sure to check "Add Python to PATH" during installation
2. **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
3. **Docker Desktop** - Download from [docker.com](https://www.docker.com/products/docker-desktop/)
   - ✅ Enable Windows containers for Crystal Reports processing
4. **Git** - Download from [git-scm.com](https://git-scm.com/download/win)

### API Keys (Already Configured)
- ✅ OpenRouter API key: Configured
- ✅ OpenAI API key: Configured
- ⚠️ Anthropic API key: Optional (add if you have one)

## 🚀 Quick Start

### 1. Clone the Repository
```cmd
git clone https://github.com/yourusername/crystal-copilot.git
cd crystal-copilot
```

### 2. Run Windows Setup
```cmd
scripts\setup-windows.bat
```

This will:
- Check all prerequisites
- Set up Python virtual environment
- Install all dependencies
- Create necessary directories
- Configure environment files

### 3. Start Development Environment
```cmd
scripts\start-dev-windows.bat
```

This will start:
- Redis cache server (Docker)
- Backend API server (Python)
- Frontend development server (Node.js)

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Manual Setup (Alternative)

If the automated scripts don't work, follow these manual steps:

### Backend Setup
```cmd
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate.bat

# Install dependencies
pip install -r requirements.txt

# Create directories
mkdir uploads data logs
```

### Frontend Setup
```cmd
cd frontend

# Install dependencies
npm install
```

### Start Services Manually
```cmd
# Terminal 1: Start Redis
docker run -d --name crystal-redis -p 6379:6379 redis:7-alpine

# Terminal 2: Start Backend
cd backend
venv\Scripts\activate.bat
uvicorn main:app --reload --port 8000

# Terminal 3: Start Frontend
cd frontend
npm run dev
```

## 🐳 Docker Alternative

If you prefer using Docker for everything:

```cmd
# Start all services with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔍 Crystal Reports Processing

For full Crystal Reports processing on Windows:

### 1. Install Crystal Reports Runtime
- Download SAP Crystal Reports runtime from SAP website
- Install to default location: `C:\Program Files\SAP BusinessObjects\`

### 2. Configure RptToXml Path
Edit `backend\.env` and update:
```env
RPTTOXML_PATH=C:\Program Files\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common\SAP BusinessObjects Enterprise XI 4.0\win64_x64\RptToXml.exe
```

### 3. Windows Container (Optional)
For production Crystal Reports processing:
```cmd
# Switch Docker to Windows containers
# Right-click Docker Desktop > Switch to Windows containers

# Build Crystal processor
docker build -f docker\crystal\Dockerfile.windows -t crystal-processor .
```

## 🧪 Testing the Setup

### 1. Test Backend API
```cmd
curl http://localhost:8000/health
```
Should return: `{"status":"healthy","service":"crystal-copilot-api"}`

### 2. Test Frontend
Open http://localhost:3000 in your browser

### 3. Upload Test Report
1. Go to the upload page
2. Drag and drop a .rpt file (or use the browse button)
3. Wait for processing to complete
4. Try asking questions about the report

## 🛠️ Troubleshooting

### Common Issues

#### Python Not Found
```cmd
# Check Python installation
python --version

# If not found, add to PATH or reinstall Python
```

#### Port Already in Use
```cmd
# Check what's using the port
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /PID <process_id> /F
```

#### Docker Not Starting
- Make sure Docker Desktop is running
- Check Docker is in Windows containers mode for Crystal processing
- Restart Docker Desktop if needed

#### Virtual Environment Issues
```cmd
# Delete and recreate virtual environment
rmdir /s venv
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
```

#### Node.js Issues
```cmd
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rmdir /s node_modules
npm install
```

### Getting Help

1. **Check Logs**:
   - Backend: Check the terminal running uvicorn
   - Frontend: Check the terminal running npm dev
   - Docker: `docker-compose logs`

2. **API Status**:
   - Health: http://localhost:8000/health
   - Docs: http://localhost:8000/docs
   - Metrics: http://localhost:8000/metrics

3. **Environment Variables**:
   - Check `backend\.env` for correct API keys
   - Verify all paths are Windows-style (backslashes)

## 🚀 Production Deployment on Windows

### IIS Deployment
```cmd
# Build frontend
cd frontend
npm run build

# Configure IIS to serve static files from out/
# Set up reverse proxy to backend API
```

### Windows Service
```cmd
# Install backend as Windows service
pip install pywin32
python -m pip install python-windows-service

# Configure service to run uvicorn
```

### Scheduled Tasks
Use Windows Task Scheduler to:
- Start services on boot
- Monitor and restart failed services
- Run maintenance tasks

## 📊 Performance Tips for Windows

1. **Antivirus Exclusions**: Add project folder to antivirus exclusions
2. **Windows Defender**: Exclude Python.exe and Node.exe from real-time scanning
3. **File System**: Use NTFS compression for log files
4. **Memory**: Allocate at least 4GB RAM for development
5. **SSD**: Use SSD storage for better performance

## 🔐 Security Considerations

1. **Firewall**: Configure Windows Firewall for ports 3000, 8000, 6379
2. **User Permissions**: Run with standard user, not administrator
3. **API Keys**: Keep .env files secure and never commit to Git
4. **Updates**: Keep all dependencies updated regularly

---

**Need Help?** 
- Check the main [README.md](README.md) for general documentation
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Review API documentation at http://localhost:8000/docs