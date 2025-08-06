"""
File upload endpoint for Crystal Reports (.rpt) files.
Handles drag-and-drop upload, validation, and initial processing.
"""

import os
import time
from pathlib import Path
from typing import Optional
from uuid import uuid4

import aiofiles
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, BackgroundTasks
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.logging import get_logger, log_file_processing
from app.models.report import UploadResponse, ReportStatus
from app.services.report_parser import ReportParserService
from app.services.storage import StorageService

router = APIRouter()
logger = get_logger(__name__)
settings = get_settings()


def get_report_parser() -> ReportParserService:
    """Dependency to get report parser service."""
    return ReportParserService()


def get_storage_service() -> StorageService:
    """Dependency to get storage service."""
    return StorageService()


async def process_report_background(
    file_path: Path,
    report_id: str,
    filename: str,
    parser: ReportParserService,
    storage: StorageService
):
    """Background task to process uploaded report."""
    start_time = time.time()
    
    try:
        logger.info("Starting report processing", report_id=report_id, filename=filename)
        
        # Parse the Crystal Report file
        metadata = await parser.parse_report(file_path, report_id, filename)
        
        # Store metadata
        await storage.store_metadata(report_id, metadata)
        
        # Update status to ready
        await storage.update_report_status(report_id, ReportStatus.READY)
        
        duration_ms = (time.time() - start_time) * 1000
        log_file_processing(
            filename=filename,
            file_size=file_path.stat().st_size,
            operation="parse_report",
            duration_ms=duration_ms,
            success=True,
            report_id=report_id
        )
        
        logger.info("Report processing completed", report_id=report_id, duration_ms=duration_ms)
        
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        error_msg = str(e)
        
        # Update status to error
        await storage.update_report_status(report_id, ReportStatus.ERROR, error_msg)
        
        log_file_processing(
            filename=filename,
            file_size=file_path.stat().st_size if file_path.exists() else 0,
            operation="parse_report",
            duration_ms=duration_ms,
            success=False,
            error=error_msg,
            report_id=report_id
        )
        
        logger.error("Report processing failed", report_id=report_id, error=error_msg)


@router.post("/", response_model=UploadResponse)
async def upload_report(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    parser: ReportParserService = Depends(get_report_parser),
    storage: StorageService = Depends(get_storage_service)
):
    """
    Upload a Crystal Reports (.rpt) file for processing.
    
    - **file**: Crystal Reports file (.rpt format)
    
    Returns upload confirmation and report ID for tracking.
    """
    start_time = time.time()
    
    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size
    file_size = 0
    content = await file.read()
    file_size = len(content)
    
    if file_size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE / (1024*1024):.1f}MB"
        )
    
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded")
    
    # Generate unique report ID and file path
    report_id = str(uuid4())
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(exist_ok=True)
    
    file_path = upload_dir / f"{report_id}_{file.filename}"
    
    try:
        # Save uploaded file
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)
        
        # Create initial metadata record
        await storage.create_report_record(
            report_id=report_id,
            filename=file.filename,
            file_size=file_size,
            file_path=str(file_path)
        )
        
        # Start background processing
        background_tasks.add_task(
            process_report_background,
            file_path,
            report_id,
            file.filename,
            parser,
            storage
        )
        
        duration_ms = (time.time() - start_time) * 1000
        log_file_processing(
            filename=file.filename,
            file_size=file_size,
            operation="upload",
            duration_ms=duration_ms,
            success=True,
            report_id=report_id
        )
        
        logger.info(
            "File uploaded successfully",
            report_id=report_id,
            filename=file.filename,
            file_size=file_size,
            duration_ms=duration_ms
        )
        
        return UploadResponse(
            report_id=report_id,
            filename=file.filename,
            file_size=file_size,
            status=ReportStatus.PARSING,
            message="File uploaded successfully. Processing in background."
        )
        
    except Exception as e:
        # Clean up file if something went wrong
        if file_path.exists():
            file_path.unlink()
        
        duration_ms = (time.time() - start_time) * 1000
        error_msg = str(e)
        
        log_file_processing(
            filename=file.filename,
            file_size=file_size,
            operation="upload",
            duration_ms=duration_ms,
            success=False,
            error=error_msg
        )
        
        logger.error("File upload failed", filename=file.filename, error=error_msg)
        raise HTTPException(status_code=500, detail=f"Upload failed: {error_msg}")


@router.get("/status/{report_id}")
async def get_upload_status(
    report_id: str,
    storage: StorageService = Depends(get_storage_service)
):
    """
    Get the processing status of an uploaded report.
    
    - **report_id**: The UUID of the uploaded report
    """
    try:
        status_info = await storage.get_report_status(report_id)
        
        if not status_info:
            raise HTTPException(status_code=404, detail="Report not found")
        
        return status_info
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get upload status", report_id=report_id, error=str(e))
        raise HTTPException(status_code=500, detail="Failed to get status")


@router.delete("/{report_id}")
async def delete_report(
    report_id: str,
    storage: StorageService = Depends(get_storage_service)
):
    """
    Delete an uploaded report and all associated data.
    
    - **report_id**: The UUID of the report to delete
    """
    try:
        success = await storage.delete_report(report_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Report not found")
        
        logger.info("Report deleted", report_id=report_id)
        return {"message": "Report deleted successfully", "report_id": report_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete report", report_id=report_id, error=str(e))
        raise HTTPException(status_code=500, detail="Failed to delete report")