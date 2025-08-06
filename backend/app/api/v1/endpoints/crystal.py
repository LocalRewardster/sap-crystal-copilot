"""
Crystal Reports specific endpoints using the Crystal Reports SDK.
Provides high-quality previews, exports, and field operations.
"""

import time
from pathlib import Path
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import Response
from pydantic import BaseModel

from app.core.logging import get_logger, log_api_request
from app.services.storage import StorageService
from app.services.crystal_bridge import get_crystal_bridge_service, CrystalBridgeService

router = APIRouter()
logger = get_logger(__name__)


class CrystalPreviewRequest(BaseModel):
    format: str = "PDF"  # PDF, HTML, Excel, Word
    parameters: Optional[Dict[str, Any]] = None


class CrystalFieldOperationRequest(BaseModel):
    field_name: str
    operation: str  # hide, show, rename, move
    parameters: Optional[Dict[str, Any]] = None


class CrystalExportRequest(BaseModel):
    format: str = "PDF"  # PDF, HTML, Excel, Word, CSV
    parameters: Optional[Dict[str, Any]] = None


def get_storage_service() -> StorageService:
    """Dependency to get storage service."""
    return StorageService()


@router.post("/{report_id}/preview")
async def generate_crystal_preview(
    report_id: str,
    request: CrystalPreviewRequest,
    storage: StorageService = Depends(get_storage_service),
    crystal_service: CrystalBridgeService = Depends(get_crystal_bridge_service)
):
    """
    Generate high-quality Crystal Reports preview using Crystal Reports SDK.
    
    - **report_id**: The UUID of the report
    - **format**: Output format (PDF, HTML, Excel, Word)
    - **parameters**: Optional report parameters
    """
    start_time = time.time()
    
    try:
        logger.info("Generating Crystal Reports preview", report_id=report_id, format=request.format)
        
        # Get report file path
        report_info = await storage.get_report_status(report_id)
        if not report_info:
            raise HTTPException(status_code=404, detail="Report not found")
        
        file_path = Path(report_info['file_path'])
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Report file not found")
        
        # Check if Crystal service is available
        if not await crystal_service.health_check():
            raise HTTPException(
                status_code=503, 
                detail="Crystal Reports service is not available. Please ensure the C# service is running."
            )
        
        # Generate preview using Crystal Reports SDK
        preview_bytes = await crystal_service.generate_preview(
            file_path, 
            request.format, 
            request.parameters
        )
        
        duration_ms = (time.time() - start_time) * 1000
        
        log_api_request(
            method="POST",
            path=f"/crystal/{report_id}/preview",
            status_code=200,
            duration_ms=duration_ms,
            format=request.format,
            size_bytes=len(preview_bytes)
        )
        
        logger.info(
            "Crystal Reports preview generated successfully",
            report_id=report_id,
            format=request.format,
            size_bytes=len(preview_bytes),
            duration_ms=duration_ms
        )
        
        # Return appropriate content type
        content_type = _get_content_type(request.format)
        filename = f"{report_info['filename'].replace('.rpt', '')}.{request.format.lower()}"
        
        return Response(
            content=preview_bytes,
            media_type=content_type,
            headers={"Content-Disposition": f"inline; filename={filename}"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        
        log_api_request(
            method="POST",
            path=f"/crystal/{report_id}/preview",
            status_code=500,
            duration_ms=duration_ms,
            error=str(e)
        )
        
        logger.error("Failed to generate Crystal Reports preview", 
                    report_id=report_id, 
                    error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to generate preview: {str(e)}")


@router.post("/{report_id}/export")
async def export_crystal_report(
    report_id: str,
    request: CrystalExportRequest,
    storage: StorageService = Depends(get_storage_service),
    crystal_service: CrystalBridgeService = Depends(get_crystal_bridge_service)
):
    """
    Export Crystal Report to various formats using Crystal Reports SDK.
    
    - **report_id**: The UUID of the report
    - **format**: Export format (PDF, HTML, Excel, Word, CSV)
    - **parameters**: Optional report parameters
    """
    start_time = time.time()
    
    try:
        logger.info("Exporting Crystal Report", report_id=report_id, format=request.format)
        
        # Get report file path
        report_info = await storage.get_report_status(report_id)
        if not report_info:
            raise HTTPException(status_code=404, detail="Report not found")
        
        file_path = Path(report_info['file_path'])
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Report file not found")
        
        # Check if Crystal service is available
        if not await crystal_service.health_check():
            raise HTTPException(
                status_code=503, 
                detail="Crystal Reports service is not available. Please ensure the C# service is running."
            )
        
        # Export using Crystal Reports SDK
        export_bytes = await crystal_service.export_report(
            file_path, 
            request.format, 
            request.parameters
        )
        
        duration_ms = (time.time() - start_time) * 1000
        
        log_api_request(
            method="POST",
            path=f"/crystal/{report_id}/export",
            status_code=200,
            duration_ms=duration_ms,
            format=request.format,
            size_bytes=len(export_bytes)
        )
        
        logger.info(
            "Crystal Report exported successfully",
            report_id=report_id,
            format=request.format,
            size_bytes=len(export_bytes),
            duration_ms=duration_ms
        )
        
        # Return as downloadable file
        content_type = _get_content_type(request.format)
        filename = f"{report_info['filename'].replace('.rpt', '')}_export.{request.format.lower()}"
        
        return Response(
            content=export_bytes,
            media_type=content_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        
        log_api_request(
            method="POST",
            path=f"/crystal/{report_id}/export",
            status_code=500,
            duration_ms=duration_ms,
            error=str(e)
        )
        
        logger.error("Failed to export Crystal Report", 
                    report_id=report_id, 
                    error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to export report: {str(e)}")


@router.post("/{report_id}/field-operation")
async def perform_crystal_field_operation(
    report_id: str,
    request: CrystalFieldOperationRequest,
    storage: StorageService = Depends(get_storage_service),
    crystal_service: CrystalBridgeService = Depends(get_crystal_bridge_service)
):
    """
    Perform field operations (hide, show, rename, move) using Crystal Reports SDK.
    
    - **report_id**: The UUID of the report
    - **field_name**: Name of the field to modify
    - **operation**: Operation to perform (hide, show, rename, move)
    - **parameters**: Operation-specific parameters
    """
    start_time = time.time()
    
    try:
        logger.info("Performing Crystal Reports field operation", 
                   report_id=report_id, 
                   field_name=request.field_name, 
                   operation=request.operation)
        
        # Get report file path
        report_info = await storage.get_report_status(report_id)
        if not report_info:
            raise HTTPException(status_code=404, detail="Report not found")
        
        file_path = Path(report_info['file_path'])
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Report file not found")
        
        # Check if Crystal service is available
        if not await crystal_service.health_check():
            raise HTTPException(
                status_code=503, 
                detail="Crystal Reports service is not available. Please ensure the C# service is running."
            )
        
        # Perform field operation using Crystal Reports SDK
        success = await crystal_service.modify_field(
            file_path,
            request.field_name,
            request.operation,
            request.parameters
        )
        
        duration_ms = (time.time() - start_time) * 1000
        
        log_api_request(
            method="POST",
            path=f"/crystal/{report_id}/field-operation",
            status_code=200 if success else 400,
            duration_ms=duration_ms,
            field_name=request.field_name,
            operation=request.operation,
            success=success
        )
        
        if success:
            logger.info(
                "Crystal Reports field operation completed successfully",
                report_id=report_id,
                field_name=request.field_name,
                operation=request.operation,
                duration_ms=duration_ms
            )
            
            return {
                "success": True,
                "message": f"Field operation '{request.operation}' completed successfully on field '{request.field_name}'",
                "field_name": request.field_name,
                "operation": request.operation
            }
        else:
            logger.warning(
                "Crystal Reports field operation failed",
                report_id=report_id,
                field_name=request.field_name,
                operation=request.operation,
                duration_ms=duration_ms
            )
            
            return {
                "success": False,
                "message": f"Field operation '{request.operation}' failed on field '{request.field_name}'",
                "field_name": request.field_name,
                "operation": request.operation
            }
        
    except HTTPException:
        raise
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        
        log_api_request(
            method="POST",
            path=f"/crystal/{report_id}/field-operation",
            status_code=500,
            duration_ms=duration_ms,
            error=str(e)
        )
        
        logger.error("Failed to perform Crystal Reports field operation", 
                    report_id=report_id, 
                    field_name=request.field_name,
                    operation=request.operation,
                    error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to perform field operation: {str(e)}")


@router.get("/{report_id}/thumbnail")
async def generate_crystal_thumbnail(
    report_id: str,
    storage: StorageService = Depends(get_storage_service),
    crystal_service: CrystalBridgeService = Depends(get_crystal_bridge_service)
):
    """
    Generate thumbnail for Crystal Report using Crystal Reports SDK.
    
    - **report_id**: The UUID of the report
    """
    start_time = time.time()
    
    try:
        logger.info("Generating Crystal Reports thumbnail", report_id=report_id)
        
        # Get report file path
        report_info = await storage.get_report_status(report_id)
        if not report_info:
            raise HTTPException(status_code=404, detail="Report not found")
        
        file_path = Path(report_info['file_path'])
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Report file not found")
        
        # Check if Crystal service is available
        if not await crystal_service.health_check():
            raise HTTPException(
                status_code=503, 
                detail="Crystal Reports service is not available. Please ensure the C# service is running."
            )
        
        # Generate thumbnail using Crystal Reports SDK
        thumbnail_bytes = await crystal_service.generate_preview(file_path, "PDF")
        
        duration_ms = (time.time() - start_time) * 1000
        
        log_api_request(
            method="GET",
            path=f"/crystal/{report_id}/thumbnail",
            status_code=200,
            duration_ms=duration_ms,
            size_bytes=len(thumbnail_bytes)
        )
        
        logger.info(
            "Crystal Reports thumbnail generated successfully",
            report_id=report_id,
            size_bytes=len(thumbnail_bytes),
            duration_ms=duration_ms
        )
        
        return Response(
            content=thumbnail_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"inline; filename=thumbnail_{report_id}.pdf"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        
        log_api_request(
            method="GET",
            path=f"/crystal/{report_id}/thumbnail",
            status_code=500,
            duration_ms=duration_ms,
            error=str(e)
        )
        
        logger.error("Failed to generate Crystal Reports thumbnail", 
                    report_id=report_id, 
                    error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to generate thumbnail: {str(e)}")


@router.get("/health")
async def crystal_service_health(
    crystal_service: CrystalBridgeService = Depends(get_crystal_bridge_service)
):
    """
    Check Crystal Reports service health.
    """
    try:
        is_healthy = await crystal_service.health_check()
        
        return {
            "service": "Crystal Reports SDK Service",
            "status": "healthy" if is_healthy else "unhealthy",
            "available": is_healthy,
            "message": "Crystal Reports C# service is running" if is_healthy else "Crystal Reports C# service is not available"
        }
        
    except Exception as e:
        logger.error("Crystal Reports health check failed", error=str(e))
        return {
            "service": "Crystal Reports SDK Service",
            "status": "error",
            "available": False,
            "message": f"Health check failed: {str(e)}"
        }


def _get_content_type(format: str) -> str:
    """Get appropriate content type for format."""
    return {
        "PDF": "application/pdf",
        "HTML": "text/html",
        "EXCEL": "application/vnd.ms-excel",
        "WORD": "application/msword",
        "RTF": "application/rtf",
        "CSV": "text/csv"
    }.get(format.upper(), "application/octet-stream")