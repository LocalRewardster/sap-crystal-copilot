"""
Edit endpoints for Crystal Reports modifications.
Handles field editing, preview, and patch application.
"""

import time
from pathlib import Path
from typing import List

from fastapi import APIRouter, HTTPException, Depends

from app.core.logging import get_logger, log_api_request
from app.models.report import (
    EditPatch, EditPreviewResponse, ApplyEditsRequest, ApplyEditsResponse
)
from app.services.storage import StorageService
from app.services.edit_service import EditService

router = APIRouter()
logger = get_logger(__name__)


def get_storage_service() -> StorageService:
    """Dependency to get storage service."""
    return StorageService()


def get_edit_service() -> EditService:
    """Dependency to get edit service."""
    return EditService()


@router.post("/{report_id}/preview", response_model=EditPreviewResponse)
async def preview_edits(
    report_id: str,
    patches: List[EditPatch],
    storage: StorageService = Depends(get_storage_service),
    edit_service: EditService = Depends(get_edit_service)
):
    """
    Preview the effects of edit patches without applying them.
    
    Shows a visual diff of what changes would be made and identifies
    any potential issues or warnings.
    
    - **report_id**: The UUID of the report to edit
    - **patches**: List of edit patches to preview
    """
    start_time = time.time()
    
    try:
        logger.info("Generating edit preview", report_id=report_id, patch_count=len(patches))
        
        # Get report metadata
        metadata = await storage.get_metadata(report_id)
        if not metadata:
            raise HTTPException(status_code=404, detail="Report not found or not processed")
        
        # Generate preview
        preview = await edit_service.preview_edits(metadata, patches)
        
        duration_ms = (time.time() - start_time) * 1000
        
        log_api_request(
            method="POST",
            path=f"/edit/{report_id}/preview",
            status_code=200,
            duration_ms=duration_ms,
            patch_count=len(patches),
            warnings_count=len(preview.warnings)
        )
        
        logger.info(
            "Edit preview generated",
            report_id=report_id,
            patch_count=len(patches),
            warnings_count=len(preview.warnings),
            duration_ms=duration_ms
        )
        
        return preview
        
    except HTTPException:
        raise
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        
        log_api_request(
            method="POST",
            path=f"/edit/{report_id}/preview",
            status_code=500,
            duration_ms=duration_ms,
            error=str(e)
        )
        
        logger.error("Failed to generate edit preview", report_id=report_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to generate preview: {str(e)}")


@router.post("/{report_id}/apply", response_model=ApplyEditsResponse)
async def apply_edits(
    report_id: str,
    request: ApplyEditsRequest,
    storage: StorageService = Depends(get_storage_service),
    edit_service: EditService = Depends(get_edit_service)
):
    """
    Apply edit patches to a Crystal Report.
    
    This will modify the actual .rpt file and create change log entries
    for audit purposes.
    
    - **report_id**: The UUID of the report to edit
    - **patches**: List of edit patches to apply
    - **dry_run**: If true, validate but don't actually apply changes
    - **create_backup**: If true, create backup before applying changes
    """
    start_time = time.time()
    
    try:
        logger.info(
            "Applying edits",
            report_id=report_id,
            patch_count=len(request.patches),
            dry_run=request.dry_run
        )
        
        # Get report metadata and file path
        metadata = await storage.get_metadata(report_id)
        if not metadata:
            raise HTTPException(status_code=404, detail="Report not found or not processed")
        
        # Get report info to find file path
        report_info = await storage.get_report_status(report_id)
        if not report_info:
            raise HTTPException(status_code=404, detail="Report file information not found")
        
        file_path = Path(report_info['file_path'])
        
        # Apply edits
        result = await edit_service.apply_edits(
            metadata=metadata,
            patches=request.patches,
            file_path=file_path,
            user_id=None,  # TODO: Get from authentication context
            dry_run=request.dry_run,
            create_backup=request.create_backup
        )
        
        # Store change log entries
        for entry in result.change_log_entries:
            await storage.add_change_log_entry(entry)
        
        duration_ms = (time.time() - start_time) * 1000
        
        status_code = 200 if result.success else 422
        
        log_api_request(
            method="POST",
            path=f"/edit/{report_id}/apply",
            status_code=status_code,
            duration_ms=duration_ms,
            patch_count=len(request.patches),
            applied_count=len(result.applied_patches),
            failed_count=len(result.failed_patches),
            dry_run=request.dry_run
        )
        
        logger.info(
            "Edit application completed",
            report_id=report_id,
            success=result.success,
            applied_count=len(result.applied_patches),
            failed_count=len(result.failed_patches),
            duration_ms=duration_ms
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        
        log_api_request(
            method="POST",
            path=f"/edit/{report_id}/apply",
            status_code=500,
            duration_ms=duration_ms,
            error=str(e)
        )
        
        logger.error("Failed to apply edits", report_id=report_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to apply edits: {str(e)}")


@router.post("/{report_id}/hide-field")
async def hide_field(
    report_id: str,
    field_id: str,
    description: str = None,
    storage: StorageService = Depends(get_storage_service),
    edit_service: EditService = Depends(get_edit_service)
):
    """
    Quick action to hide a specific field.
    
    - **report_id**: The UUID of the report
    - **field_id**: The ID of the field to hide
    - **description**: Optional description of why the field is being hidden
    """
    try:
        # Create hide patch
        patch = EditPatch(
            operation="hide",
            target_field_id=field_id,
            description=description or f"Hide field {field_id}"
        )
        
        # Apply the patch
        request = ApplyEditsRequest(
            patches=[patch],
            dry_run=False,
            create_backup=True
        )
        
        result = await apply_edits(report_id, request, storage, edit_service)
        
        return {
            "message": f"Field {field_id} hidden successfully",
            "patch_id": patch.id,
            "success": result.success
        }
        
    except Exception as e:
        logger.error("Failed to hide field", report_id=report_id, field_id=field_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to hide field: {str(e)}")


@router.post("/{report_id}/rename-field")
async def rename_field(
    report_id: str,
    field_id: str,
    new_name: str,
    description: str = None,
    storage: StorageService = Depends(get_storage_service),
    edit_service: EditService = Depends(get_edit_service)
):
    """
    Quick action to rename a specific field.
    
    - **report_id**: The UUID of the report
    - **field_id**: The ID of the field to rename
    - **new_name**: The new display name for the field
    - **description**: Optional description of the change
    """
    try:
        # Create rename patch
        patch = EditPatch(
            operation="rename",
            target_field_id=field_id,
            new_name=new_name,
            description=description or f"Rename field {field_id} to {new_name}"
        )
        
        # Apply the patch
        request = ApplyEditsRequest(
            patches=[patch],
            dry_run=False,
            create_backup=True
        )
        
        result = await apply_edits(report_id, request, storage, edit_service)
        
        return {
            "message": f"Field {field_id} renamed to '{new_name}' successfully",
            "patch_id": patch.id,
            "success": result.success
        }
        
    except Exception as e:
        logger.error("Failed to rename field", report_id=report_id, field_id=field_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to rename field: {str(e)}")


@router.post("/{report_id}/move-field")
async def move_field(
    report_id: str,
    field_id: str,
    x: int,
    y: int,
    width: int = None,
    height: int = None,
    description: str = None,
    storage: StorageService = Depends(get_storage_service),
    edit_service: EditService = Depends(get_edit_service)
):
    """
    Quick action to move (and optionally resize) a specific field.
    
    - **report_id**: The UUID of the report
    - **field_id**: The ID of the field to move
    - **x**: New X coordinate
    - **y**: New Y coordinate
    - **width**: New width (optional, keeps current if not specified)
    - **height**: New height (optional, keeps current if not specified)
    - **description**: Optional description of the change
    """
    try:
        # Get current field to preserve width/height if not specified
        metadata = await storage.get_metadata(report_id)
        if not metadata:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Find the field to get current dimensions
        current_field = None
        for section in metadata.sections:
            for field in section.fields:
                if field.id == field_id:
                    current_field = field
                    break
            if current_field:
                break
        
        if not current_field:
            raise HTTPException(status_code=404, detail="Field not found")
        
        # Create position with current or new values
        new_position = {
            "x": x,
            "y": y,
            "width": width if width is not None else current_field.width,
            "height": height if height is not None else current_field.height
        }
        
        # Create move patch
        patch = EditPatch(
            operation="move",
            target_field_id=field_id,
            new_position=new_position,
            description=description or f"Move field {field_id} to ({x}, {y})"
        )
        
        # Apply the patch
        request = ApplyEditsRequest(
            patches=[patch],
            dry_run=False,
            create_backup=True
        )
        
        result = await apply_edits(report_id, request, storage, edit_service)
        
        return {
            "message": f"Field {field_id} moved to ({x}, {y}) successfully",
            "patch_id": patch.id,
            "success": result.success
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to move field", report_id=report_id, field_id=field_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to move field: {str(e)}")


@router.get("/{report_id}/changelog")
async def get_change_log(
    report_id: str,
    limit: int = 100,
    offset: int = 0,
    storage: StorageService = Depends(get_storage_service)
):
    """
    Get the change log for a report.
    
    - **report_id**: The UUID of the report
    - **limit**: Maximum number of entries to return
    - **offset**: Number of entries to skip
    """
    try:
        entries = await storage.get_change_log(report_id, limit=limit, offset=offset)
        
        return {
            "report_id": report_id,
            "total_entries": len(entries),
            "entries": [entry.model_dump() for entry in entries]
        }
        
    except Exception as e:
        logger.error("Failed to get change log", report_id=report_id, error=str(e))
        raise HTTPException(status_code=500, detail="Failed to retrieve change log")