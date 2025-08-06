"""
Reports management endpoints.
Provides access to report metadata, status, and basic operations.
"""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import Response

from app.core.logging import get_logger
from app.models.report import ReportMetadata, ReportStatus
from app.services.storage import StorageService

router = APIRouter()
logger = get_logger(__name__)


def get_storage_service() -> StorageService:
    """Dependency to get storage service."""
    return StorageService()


@router.get("/", response_model=List[dict])
async def list_reports(
    status: Optional[ReportStatus] = Query(None, description="Filter by status"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    storage: StorageService = Depends(get_storage_service)
):
    """
    List all reports with optional filtering.
    
    - **status**: Filter by report status (optional)
    - **limit**: Maximum number of results (1-1000)
    - **offset**: Number of results to skip for pagination
    """
    try:
        reports = await storage.list_reports(status=status, limit=limit, offset=offset)
        return reports
        
    except Exception as e:
        logger.error("Failed to list reports", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to retrieve reports")


@router.get("/{report_id}", response_model=dict)
async def get_report_info(
    report_id: str,
    storage: StorageService = Depends(get_storage_service)
):
    """
    Get basic report information and status.
    
    - **report_id**: The UUID of the report
    """
    try:
        report_info = await storage.get_report_status(report_id)
        
        if not report_info:
            raise HTTPException(status_code=404, detail="Report not found")
        
        return report_info
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get report info", report_id=report_id, error=str(e))
        raise HTTPException(status_code=500, detail="Failed to retrieve report information")


@router.get("/{report_id}/metadata", response_model=ReportMetadata)
async def get_report_metadata(
    report_id: str,
    storage: StorageService = Depends(get_storage_service)
):
    """
    Get complete report metadata including sections, fields, and structure.
    
    - **report_id**: The UUID of the report
    """
    try:
        metadata = await storage.get_metadata(report_id)
        
        if not metadata:
            # Check if report exists but hasn't been parsed yet
            report_info = await storage.get_report_status(report_id)
            if not report_info:
                raise HTTPException(status_code=404, detail="Report not found")
            
            if report_info['status'] == ReportStatus.PARSING.value:
                raise HTTPException(
                    status_code=202, 
                    detail="Report is still being processed. Please try again later."
                )
            elif report_info['status'] == ReportStatus.ERROR.value:
                raise HTTPException(
                    status_code=422,
                    detail=f"Report processing failed: {report_info.get('error_message', 'Unknown error')}"
                )
            else:
                raise HTTPException(status_code=404, detail="Report metadata not available")
        
        return metadata
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get report metadata", report_id=report_id, error=str(e))
        raise HTTPException(status_code=500, detail="Failed to retrieve report metadata")


@router.get("/{report_id}/sections")
async def get_report_sections(
    report_id: str,
    storage: StorageService = Depends(get_storage_service)
):
    """
    Get report sections with their fields.
    
    - **report_id**: The UUID of the report
    """
    try:
        metadata = await storage.get_metadata(report_id)
        
        if not metadata:
            raise HTTPException(status_code=404, detail="Report not found or not processed")
        
        return {
            "report_id": report_id,
            "sections": metadata.sections
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get report sections", report_id=report_id, error=str(e))
        raise HTTPException(status_code=500, detail="Failed to retrieve report sections")


@router.get("/{report_id}/fields")
async def get_report_fields(
    report_id: str,
    section_type: Optional[str] = Query(None, description="Filter by section type"),
    field_type: Optional[str] = Query(None, description="Filter by field type"),
    storage: StorageService = Depends(get_storage_service)
):
    """
    Get all fields in a report with optional filtering.
    
    - **report_id**: The UUID of the report
    - **section_type**: Filter by section type (optional)
    - **field_type**: Filter by field type (optional)
    """
    try:
        metadata = await storage.get_metadata(report_id)
        
        if not metadata:
            raise HTTPException(status_code=404, detail="Report not found or not processed")
        
        # Collect all fields from sections
        all_fields = []
        for section in metadata.sections:
            for field in section.fields:
                field_data = field.model_dump()
                field_data['section_name'] = section.name
                field_data['section_type'] = section.section_type.value
                all_fields.append(field_data)
        
        # Add parameters and formulas
        for param in metadata.parameters:
            param_data = param.model_dump()
            param_data['section_name'] = 'Parameters'
            param_data['section_type'] = 'parameter'
            all_fields.append(param_data)
        
        for formula in metadata.formulas:
            formula_data = formula.model_dump()
            formula_data['section_name'] = 'Formulas'
            formula_data['section_type'] = 'formula'
            all_fields.append(formula_data)
        
        # Apply filters
        if section_type:
            all_fields = [f for f in all_fields if f['section_type'] == section_type]
        
        if field_type:
            all_fields = [f for f in all_fields if f['field_type'] == field_type]
        
        return {
            "report_id": report_id,
            "total_fields": len(all_fields),
            "fields": all_fields
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get report fields", report_id=report_id, error=str(e))
        raise HTTPException(status_code=500, detail="Failed to retrieve report fields")


@router.get("/{report_id}/database-info")
async def get_database_info(
    report_id: str,
    storage: StorageService = Depends(get_storage_service)
):
    """
    Get database connection and table information for a report.
    
    - **report_id**: The UUID of the report
    """
    try:
        metadata = await storage.get_metadata(report_id)
        
        if not metadata:
            raise HTTPException(status_code=404, detail="Report not found or not processed")
        
        return {
            "report_id": report_id,
            "database_connections": metadata.database_connections,
            "tables": metadata.tables
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get database info", report_id=report_id, error=str(e))
        raise HTTPException(status_code=500, detail="Failed to retrieve database information")


@router.get("/{report_id}/changelog.csv")
async def download_changelog(
    report_id: str,
    storage: StorageService = Depends(get_storage_service)
):
    """
    Download change log as CSV file.
    
    - **report_id**: The UUID of the report
    """
    try:
        # Check if report exists
        report_info = await storage.get_report_status(report_id)
        if not report_info:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Generate CSV
        csv_content = await storage.get_change_log_csv(report_id)
        
        # Return as downloadable file
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=changelog_{report_id}.csv"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to download changelog", report_id=report_id, error=str(e))
        raise HTTPException(status_code=500, detail="Failed to generate changelog")


@router.delete("/{report_id}")
async def delete_report(
    report_id: str,
    storage: StorageService = Depends(get_storage_service)
):
    """
    Delete a report and all associated data.
    
    - **report_id**: The UUID of the report to delete
    """
    try:
        success = await storage.delete_report(report_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Report not found")
        
        logger.info("Report deleted via API", report_id=report_id)
        return {"message": "Report deleted successfully", "report_id": report_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete report via API", report_id=report_id, error=str(e))
        raise HTTPException(status_code=500, detail="Failed to delete report")