"""
SAP Crystal Copilot AI Report Editor - Minimal FastAPI Application

This is a simplified version that works with minimal dependencies on Windows.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="SAP Crystal Copilot AI Report Editor (Minimal)",
    description="AI-powered Crystal Reports analysis and editing platform",
    version="1.0.0-minimal",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Basic API routes
from fastapi import File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import json
import uuid
from datetime import datetime
from pathlib import Path

# Simple in-memory storage for testing
reports_storage = {}
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)

@app.get("/")
async def root():
    """Root endpoint for health check."""
    return {
        "service": "SAP Crystal Copilot AI Report Editor (Minimal)",
        "version": "1.0.0-minimal",
        "status": "healthy",
        "docs": "/docs",
        "note": "This is a minimal version for Windows compatibility"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "crystal-copilot-api-minimal"}

@app.post("/api/v1/upload/")
async def upload_report(file: UploadFile = File(...)):
    """Upload a Crystal Reports file."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    if not file.filename.endswith('.rpt'):
        raise HTTPException(status_code=400, detail="Only .rpt files are allowed")
    
    # Generate unique report ID
    report_id = str(uuid.uuid4())
    file_path = uploads_dir / f"{report_id}_{file.filename}"
    
    # Save file
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Store metadata
    reports_storage[report_id] = {
        "report_id": report_id,
        "filename": file.filename,
        "file_path": str(file_path),
        "file_size": len(content),
        "status": "ready",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    logger.info(f"File uploaded: {file.filename} (ID: {report_id})")
    
    return {
        "report_id": report_id,
        "filename": file.filename,
        "file_size": len(content),
        "status": "ready",
        "message": "File uploaded successfully"
    }

@app.get("/api/v1/reports/")
async def list_reports():
    """List all uploaded reports."""
    reports = list(reports_storage.values())
    return {"reports": reports, "count": len(reports)}

@app.get("/api/v1/reports/{report_id}/status")
async def get_report_status(report_id: str):
    """Get report status."""
    if report_id not in reports_storage:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return reports_storage[report_id]

@app.get("/api/v1/reports/{report_id}/metadata")
async def get_report_metadata(report_id: str):
    """Get report metadata."""
    if report_id not in reports_storage:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Return mock metadata for now
    report = reports_storage[report_id]
    return {
        "id": report_id,
        "filename": report["filename"],
        "title": report["filename"].replace('.rpt', ''),
        "description": "Crystal Report processed via minimal backend",
        "author": "Unknown",
        "file_size": report["file_size"],
        "status": "ready",
        "parsed_at": report["created_at"],
        "sections": [
            {
                "section_type": "REPORT_HEADER",
                "name": "Report Header",
                "height": 100,
                "fields": [
                    {
                        "id": "title_field",
                        "name": "Report Title",
                        "field_type": "STRING",
                        "section": "REPORT_HEADER",
                        "x": 10,
                        "y": 10,
                        "width": 200,
                        "height": 20,
                        "visible": True
                    }
                ]
            },
            {
                "section_type": "DETAILS",
                "name": "Details",
                "height": 200,
                "fields": [
                    {
                        "id": "sample_field",
                        "name": "Sample Data Field",
                        "field_type": "STRING",
                        "section": "DETAILS",
                        "x": 10,
                        "y": 10,
                        "width": 150,
                        "height": 20,
                        "visible": True
                    }
                ]
            }
        ],
        "tables": ["SampleTable"],
        "database_connections": [],
        "parameters": []
    }

@app.post("/api/v1/chat")
async def chat_with_ai(request: dict):
    """Simple chat endpoint (mock response for testing)."""
    return {
        "answer": "This is a minimal version of Crystal Copilot. AI features will be available once you set up the full backend with Supabase and AI API keys.",
        "report_id": request.get("report_id"),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/v1/crystal/health")
async def crystal_service_health():
    """Crystal Reports service health check."""
    return {
        "service": "Crystal Reports SDK Service",
        "status": "not_configured",
        "available": False,
        "message": "Crystal Reports service not configured in minimal mode. Upload works, but advanced features require full setup."
    }

@app.post("/api/v1/crystal/{report_id}/preview")
async def generate_crystal_preview(report_id: str):
    """Mock Crystal Reports preview generation."""
    if report_id not in reports_storage:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return {
        "message": "Crystal Reports preview not available in minimal mode",
        "report_id": report_id,
        "status": "not_configured",
        "note": "To enable Crystal Reports previews, set up the full backend with Crystal Reports SDK"
    }

@app.post("/api/v1/reports/{report_id}/field-operations")
async def perform_field_operation(report_id: str, request: dict):
    """Mock field operations."""
    if report_id not in reports_storage:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return {
        "success": False,
        "message": "Field operations not available in minimal mode",
        "report_id": report_id,
        "operation": request.get("operation", "unknown"),
        "note": "To enable field operations, set up the full backend with Crystal Reports SDK"
    }

# Test Supabase connection
@app.get("/api/v1/test/supabase")
async def test_supabase():
    """Test Supabase connection."""
    try:
        from app.services.supabase_v1 import get_supabase_v1_service
        service = get_supabase_v1_service()
        if service.is_available():
            return {"status": "connected", "message": "Supabase is working!"}
        else:
            return {"status": "not_configured", "message": "Supabase not configured"}
    except Exception as e:
        return {"status": "error", "message": f"Supabase error: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    
    logger.info("Starting Crystal Copilot API server (minimal mode)")
    uvicorn.run(
        "main_minimal:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )