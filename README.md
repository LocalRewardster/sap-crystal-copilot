# SAP Crystal Copilot AI Report Editor

A modern AI-powered tool for Crystal Reports analysis and editing, built with React, FastAPI, and SAP Joule-compatible generative AI.

## 🎯 Vision

Enable every SAP BusinessObjects / Crystal Reports user to locate, understand and modify any report element in < 60 seconds using natural language, modern previews and SAP Joule‑compatible generative AI.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React UI      │───▶│   FastAPI API    │───▶│ OpenRouter LLM  │
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
                       │                  │
                       │ • RptToXml       │
                       │ • .NET SDK       │
                       │ • Change Log     │
                       └──────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker Desktop
- SAP Crystal Reports runtime

### Development Setup

1. **Backend Setup**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

2. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

3. **Docker Setup**
```bash
docker-compose up -d
```

## 📁 Project Structure

```
crystal-copilot/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core business logic
│   │   ├── models/         # Pydantic models
│   │   ├── services/       # Business services
│   │   └── utils/          # Utilities
│   ├── tests/              # Backend tests
│   └── requirements.txt
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Next.js pages
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   └── package.json
├── docker/                 # Docker configurations
├── prompts/               # Cursor prompt libraries
├── docs/                  # Documentation
└── scripts/              # Build and deployment scripts
```

## 🎯 Features

### Phase 1 (MVP)
- [x] Crystal Reports (.rpt) file upload
- [x] AI-powered lineage analysis
- [x] Natural language field queries
- [x] Visual diff preview
- [x] Field rename/hide/move operations
- [x] Audit logging and change tracking

### Future Phases
- [ ] SAP Analytics Cloud integration
- [ ] Advanced SQL modifications
- [ ] Sub-report creation
- [ ] Enterprise repository support

## 🔧 API Endpoints

### Core Endpoints
- `POST /upload` - Upload Crystal Reports file
- `GET /report/{id}/metadata` - Get report metadata
- `POST /report/{id}/query` - Natural language queries
- `POST /report/{id}/edit` - Apply edit patches
- `GET /report/{id}/changelog.csv` - Download audit log

## 🧪 Testing

```bash
# Backend tests
cd backend && pytest

# Frontend tests
cd frontend && npm test

# Integration tests
docker-compose -f docker-compose.test.yml up
```

## 📊 Success Metrics

| Metric | Target |
|--------|--------|
| Median time to locate field lineage | < 15s |
| Median time to apply single field edit | < 60s |
| Monthly active power users | ≥ 150 by Q4‑2025 |
| Net Promoter Score | ≥ +40 |

## 🔒 Security

- Follows SAP Secure Development Lifecycle
- No report data rows sent to LLM (metadata only)
- OpenTelemetry traces and Prometheus metrics
- Comprehensive audit logging

## 📝 License

Proprietary - SAP SE