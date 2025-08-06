"""
Main API router for Crystal Copilot v1 endpoints.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import upload, reports, query, edit, chat, crystal

# Create main API router
api_router = APIRouter()

# Include endpoint routers
api_router.include_router(
    upload.router,
    prefix="/upload",
    tags=["upload"]
)

api_router.include_router(
    reports.router,
    prefix="/reports",
    tags=["reports"]
)

api_router.include_router(
    query.router,
    prefix="/query",
    tags=["query"]
)

api_router.include_router(
    edit.router,
    prefix="/edit",
    tags=["edit"]
)

api_router.include_router(
    chat.router,
    prefix="/chat",
    tags=["chat"]
)

api_router.include_router(
    crystal.router,
    prefix="/crystal",
    tags=["crystal"]
)