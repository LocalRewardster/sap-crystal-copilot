"""
SAP Crystal Copilot AI Report Editor - Main FastAPI Application

This is the main entry point for the Crystal Copilot API server.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import structlog
from prometheus_client import make_asgi_app

from app.core.config import get_settings
from app.core.logging import setup_logging
from app.api.v1.router import api_router


# Setup structured logging
setup_logging()
logger = structlog.get_logger()

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("Starting Crystal Copilot API server", version=settings.VERSION)
    yield
    logger.info("Shutting down Crystal Copilot API server")


# Create FastAPI application
app = FastAPI(
    title="SAP Crystal Copilot AI Report Editor",
    description="AI-powered Crystal Reports analysis and editing platform",
    version=settings.VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware for security
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS,
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# Add Prometheus metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)


@app.get("/")
async def root():
    """Root endpoint for health check."""
    return {
        "service": "SAP Crystal Copilot AI Report Editor",
        "version": settings.VERSION,
        "status": "healthy",
        "docs": "/docs" if settings.DEBUG else "disabled in production"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for load balancers."""
    return {"status": "healthy", "service": "crystal-copilot-api"}


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_config=None,  # Use our custom logging
    )