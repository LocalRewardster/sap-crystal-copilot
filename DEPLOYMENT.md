# SAP Crystal Copilot - Deployment Guide

This guide covers deployment options for the SAP Crystal Copilot AI Report Editor.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React UI      │───▶│   FastAPI API    │───▶│ OpenRouter LLM  │
│   (Frontend)    │    │   (Backend)      │    │   (AI Service)  │
│                 │    │                  │    │                 │
│ • Upload        │    │ • File parsing   │    │ • GPT-4o        │
│ • Chat          │    │ • Metadata       │    │ • Claude-Haiku  │
│ • Preview       │    │ • Edit patches   │    │ • Mistral Large │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │ Crystal Reports  │
                       │ Processing       │
                       │ (Windows)        │
                       │                  │
                       │ • RptToXml       │
                       │ • .NET SDK       │
                       │ • Change Log     │
                       └──────────────────┘
```

## 🚀 Quick Start (Development)

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker Desktop
- OpenRouter API key

### Setup
```bash
# 1. Clone and setup
git clone <repository>
cd crystal-copilot
chmod +x scripts/*.sh

# 2. Run setup script
./scripts/setup.sh

# 3. Configure API keys
# Edit backend/.env with your OpenRouter/OpenAI/Anthropic keys

# 4. Start development environment
./scripts/start-dev.sh
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Metrics**: http://localhost:8000/metrics

## 🐳 Docker Deployment

### Development with Docker
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy with production configuration
docker-compose -f docker-compose.prod.yml up -d
```

## ☁️ Cloud Deployment

### Azure Container Instances
```bash
# Create resource group
az group create --name crystal-copilot-rg --location eastus

# Deploy container group
az container create \
  --resource-group crystal-copilot-rg \
  --name crystal-copilot \
  --file docker-compose.yml \
  --dns-name-label crystal-copilot-demo
```

### AWS ECS
```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name crystal-copilot

# Register task definition
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json

# Create service
aws ecs create-service \
  --cluster crystal-copilot \
  --service-name crystal-copilot-service \
  --task-definition crystal-copilot:1 \
  --desired-count 2
```

### Google Cloud Run
```bash
# Build and push images
docker build -t gcr.io/PROJECT_ID/crystal-copilot-backend backend/
docker build -t gcr.io/PROJECT_ID/crystal-copilot-frontend frontend/
docker push gcr.io/PROJECT_ID/crystal-copilot-backend
docker push gcr.io/PROJECT_ID/crystal-copilot-frontend

# Deploy services
gcloud run deploy crystal-copilot-backend \
  --image gcr.io/PROJECT_ID/crystal-copilot-backend \
  --platform managed \
  --region us-central1

gcloud run deploy crystal-copilot-frontend \
  --image gcr.io/PROJECT_ID/crystal-copilot-frontend \
  --platform managed \
  --region us-central1
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Application
DEBUG=false
SECRET_KEY=your-production-secret-key-32-chars-minimum
LOG_LEVEL=INFO

# API Keys
OPENROUTER_API_KEY=your-openrouter-key
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Database
DATABASE_URL=postgresql://user:pass@host:5432/crystal_copilot

# Redis
REDIS_URL=redis://redis-host:6379/0

# Crystal Reports
RPTTOXML_PATH=/opt/crystal/RptToXml.exe
CRYSTAL_SDK_PATH=/opt/crystal/sdk/
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://api.crystal-copilot.com
NODE_ENV=production
```

### Security Configuration

#### HTTPS Setup
```nginx
server {
    listen 443 ssl;
    server_name crystal-copilot.yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Firewall Rules
```bash
# Allow HTTP/HTTPS
ufw allow 80
ufw allow 443

# Allow API access (if separate)
ufw allow 8000

# Block direct database access
ufw deny 5432
ufw deny 6379
```

## 📊 Monitoring

### Health Checks
- **Frontend**: `GET /api/health`
- **Backend**: `GET /health`
- **Database**: Connection test in startup

### Metrics Collection
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'crystal-copilot'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'
```

### Logging
```bash
# View application logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Export logs for analysis
docker-compose logs --since 1h > crystal-copilot.log
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy Crystal Copilot

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Tests
        run: |
          cd backend && python -m pytest
          cd frontend && npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: |
          docker-compose -f docker-compose.prod.yml up -d
```

## 🛡️ Security Considerations

### Data Protection
- Crystal Report files are processed locally
- No report data is sent to LLM services (metadata only)
- All file uploads are scanned and validated
- Audit logging for all changes

### Access Control
- API key authentication for LLM services
- Rate limiting on API endpoints
- File upload size and type restrictions
- CORS configuration for frontend access

### Compliance
- GDPR compliance for EU users
- SOC 2 Type II controls
- SAP Secure Development Lifecycle
- Regular security scans and updates

## 📈 Scaling

### Horizontal Scaling
```yaml
# docker-compose.scale.yml
services:
  backend:
    deploy:
      replicas: 3
  
  frontend:
    deploy:
      replicas: 2
```

### Load Balancing
```nginx
upstream backend {
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
}

upstream frontend {
    server frontend1:3000;
    server frontend2:3000;
}
```

### Database Optimization
- Connection pooling
- Read replicas for queries
- Caching with Redis
- Regular maintenance and backups

## 🆘 Troubleshooting

### Common Issues

#### Backend Not Starting
```bash
# Check logs
docker-compose logs backend

# Common causes:
# - Missing environment variables
# - Database connection issues
# - Port conflicts
```

#### Frontend Build Errors
```bash
# Clear cache and rebuild
cd frontend
rm -rf .next node_modules
npm install
npm run build
```

#### LLM API Errors
```bash
# Verify API keys
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  https://openrouter.ai/api/v1/models

# Check rate limits and quotas
```

### Performance Tuning
- Increase worker processes for high load
- Enable caching for static assets
- Optimize database queries
- Use CDN for frontend assets

## 📞 Support

For deployment support:
- **Documentation**: `/docs` endpoint
- **API Reference**: `/api/docs`
- **Health Status**: `/health`
- **Metrics**: `/metrics`

---

*This deployment guide is maintained by the SAP Crystal Copilot team.*