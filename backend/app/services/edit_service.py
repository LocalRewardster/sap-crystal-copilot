"""
Edit service for applying patches to Crystal Reports.
Handles field modifications, visual rendering, and change tracking.
"""

import json
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
from uuid import UUID, uuid4

from app.core.config import get_settings
from app.core.logging import get_logger
from app.models.report import (
    ReportMetadata, EditPatch, EditPatchList, ChangeLogEntry,
    EditPreviewResponse, ApplyEditsResponse, EditPatchOperation
)

logger = get_logger(__name__)
settings = get_settings()


class EditService:
    """Service for editing Crystal Reports and managing changes."""
    
    def __init__(self):
        pass
    
    async def preview_edits(
        self, 
        metadata: ReportMetadata,
        patches: List[EditPatch]
    ) -> EditPreviewResponse:
        """
        Preview the effects of edit patches without applying them.
        
        Args:
            metadata: Current report metadata
            patches: List of edit patches to preview
            
        Returns:
            EditPreviewResponse with preview information
        """
        start_time = time.time()
        
        try:
            logger.info("Generating edit preview", report_id=str(metadata.id), patch_count=len(patches))
            
            # Validate patches
            validation_errors = await self._validate_patches(metadata, patches)
            if validation_errors:
                raise ValueError(f"Patch validation failed: {'; '.join(validation_errors)}")
            
            # Apply patches to a copy of metadata
            preview_metadata = await self._apply_patches_to_metadata(metadata, patches, dry_run=True)
            
            # Generate HTML diff
            html_diff = await self._generate_html_diff(metadata, preview_metadata, patches)
            
            # Collect affected fields
            affected_fields = []
            for patch in patches:
                field = await self._find_field_by_id(metadata, patch.target_field_id)
                if field:
                    affected_fields.append(field)
            
            # Generate warnings
            warnings = await self._generate_warnings(metadata, patches)
            
            # Estimate impact
            impact = await self._estimate_impact(patches)
            
            duration_ms = (time.time() - start_time) * 1000
            
            logger.info("Edit preview generated", duration_ms=duration_ms, warnings_count=len(warnings))
            
            return EditPreviewResponse(
                patches=patches,
                affected_fields=affected_fields,
                html_diff=html_diff,
                warnings=warnings,
                estimated_impact=impact
            )
            
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            logger.error("Failed to generate edit preview", error=str(e), duration_ms=duration_ms)
            raise
    
    async def apply_edits(
        self,
        metadata: ReportMetadata,
        patches: List[EditPatch],
        file_path: Path,
        user_id: Optional[str] = None,
        dry_run: bool = False,
        create_backup: bool = True
    ) -> ApplyEditsResponse:
        """
        Apply edit patches to a Crystal Report.
        
        Args:
            metadata: Current report metadata
            patches: List of edit patches to apply
            file_path: Path to the .rpt file
            user_id: ID of the user making changes
            dry_run: If True, validate but don't actually apply changes
            create_backup: If True, create backup before applying changes
            
        Returns:
            ApplyEditsResponse with results
        """
        start_time = time.time()
        backup_path = None
        applied_patches = []
        failed_patches = []
        change_log_entries = []
        
        try:
            logger.info(
                "Applying edits",
                report_id=str(metadata.id),
                patch_count=len(patches),
                dry_run=dry_run
            )
            
            # Validate patches
            validation_errors = await self._validate_patches(metadata, patches)
            if validation_errors:
                raise ValueError(f"Patch validation failed: {'; '.join(validation_errors)}")
            
            # Create backup if requested and not dry run
            if create_backup and not dry_run and file_path.exists():
                backup_path = await self._create_backup(file_path)
            
            # Apply each patch
            for patch in patches:
                try:
                    if not dry_run:
                        # Apply the patch (in real implementation, this would use Crystal SDK)
                        await self._apply_single_patch(metadata, patch, file_path)
                    
                    # Create change log entry
                    change_entry = await self._create_change_log_entry(
                        metadata, patch, user_id, success=True
                    )
                    change_log_entries.append(change_entry)
                    applied_patches.append(patch.id)
                    
                    logger.info("Patch applied successfully", patch_id=patch.id, operation=patch.operation.value)
                    
                except Exception as patch_error:
                    # Log failed patch
                    error_msg = str(patch_error)
                    failed_patches.append({
                        "patch_id": patch.id,
                        "error": error_msg
                    })
                    
                    # Create change log entry for failure
                    change_entry = await self._create_change_log_entry(
                        metadata, patch, user_id, success=False, error_message=error_msg
                    )
                    change_log_entries.append(change_entry)
                    
                    logger.error("Patch failed", patch_id=patch.id, error=error_msg)
            
            success = len(failed_patches) == 0
            duration_ms = (time.time() - start_time) * 1000
            
            logger.info(
                "Edit application completed",
                success=success,
                applied_count=len(applied_patches),
                failed_count=len(failed_patches),
                duration_ms=duration_ms
            )
            
            return ApplyEditsResponse(
                success=success,
                applied_patches=applied_patches,
                failed_patches=failed_patches,
                backup_path=str(backup_path) if backup_path else None,
                change_log_entries=change_log_entries
            )
            
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            logger.error("Failed to apply edits", error=str(e), duration_ms=duration_ms)
            
            return ApplyEditsResponse(
                success=False,
                applied_patches=applied_patches,
                failed_patches=[{"patch_id": "all", "error": str(e)}],
                backup_path=str(backup_path) if backup_path else None,
                change_log_entries=change_log_entries
            )
    
    async def _validate_patches(self, metadata: ReportMetadata, patches: List[EditPatch]) -> List[str]:
        """Validate edit patches against report metadata."""
        errors = []
        
        for patch in patches:
            # Check if target field exists
            field = await self._find_field_by_id(metadata, patch.target_field_id)
            if not field:
                errors.append(f"Field {patch.target_field_id} not found")
                continue
            
            # Validate operation-specific requirements
            if patch.operation == EditPatchOperation.RENAME:
                if not patch.new_name:
                    errors.append(f"Patch {patch.id}: new_name required for rename operation")
            
            elif patch.operation == EditPatchOperation.MOVE:
                if not patch.new_position:
                    errors.append(f"Patch {patch.id}: new_position required for move operation")
            
            elif patch.operation == EditPatchOperation.RESIZE:
                if not patch.new_position:
                    errors.append(f"Patch {patch.id}: new_position required for resize operation")
            
            elif patch.operation == EditPatchOperation.FORMAT:
                if not patch.new_format:
                    errors.append(f"Patch {patch.id}: new_format required for format operation")
        
        return errors
    
    async def _apply_patches_to_metadata(
        self, 
        metadata: ReportMetadata, 
        patches: List[EditPatch],
        dry_run: bool = False
    ) -> ReportMetadata:
        """Apply patches to metadata (for preview or actual changes)."""
        
        # Create a deep copy of metadata
        metadata_dict = metadata.model_dump()
        preview_metadata = ReportMetadata(**metadata_dict)
        
        for patch in patches:
            # Find and modify the field
            for section in preview_metadata.sections:
                for field in section.fields:
                    if field.id == patch.target_field_id:
                        await self._apply_patch_to_field(field, patch)
                        break
            
            # Check parameters and formulas
            for param in preview_metadata.parameters:
                if param.id == patch.target_field_id:
                    await self._apply_patch_to_field(param, patch)
                    break
            
            for formula in preview_metadata.formulas:
                if formula.id == patch.target_field_id:
                    await self._apply_patch_to_field(formula, patch)
                    break
        
        return preview_metadata
    
    async def _apply_patch_to_field(self, field, patch: EditPatch):
        """Apply a single patch to a field."""
        
        if patch.operation == EditPatchOperation.HIDE:
            field.visible = False
        
        elif patch.operation == EditPatchOperation.SHOW:
            field.visible = True
        
        elif patch.operation == EditPatchOperation.RENAME:
            if patch.new_name:
                field.display_name = patch.new_name
        
        elif patch.operation == EditPatchOperation.MOVE or patch.operation == EditPatchOperation.RESIZE:
            if patch.new_position:
                field.x = patch.new_position.get('x', field.x)
                field.y = patch.new_position.get('y', field.y)
                field.width = patch.new_position.get('width', field.width)
                field.height = patch.new_position.get('height', field.height)
        
        elif patch.operation == EditPatchOperation.FORMAT:
            if patch.new_format:
                field.format = patch.new_format
    
    async def _generate_html_diff(
        self, 
        original: ReportMetadata, 
        modified: ReportMetadata,
        patches: List[EditPatch]
    ) -> str:
        """Generate HTML diff showing changes."""
        
        html_parts = [
            '<div class="crystal-report-diff">',
            '<style>',
            '.diff-field { border: 1px solid #ccc; margin: 5px; padding: 10px; }',
            '.diff-added { background-color: #d4edda; border-color: #c3e6cb; }',
            '.diff-removed { background-color: #f8d7da; border-color: #f5c6cb; }',
            '.diff-modified { background-color: #fff3cd; border-color: #ffeaa7; }',
            '.diff-section { font-weight: bold; margin-top: 20px; }',
            '</style>'
        ]
        
        # Group changes by section
        changes_by_section = {}
        
        for patch in patches:
            # Find the field in original metadata
            field = await self._find_field_by_id(original, patch.target_field_id)
            if field:
                section_name = await self._find_section_for_field(original, patch.target_field_id)
                if section_name not in changes_by_section:
                    changes_by_section[section_name] = []
                
                changes_by_section[section_name].append({
                    'patch': patch,
                    'field': field
                })
        
        # Generate HTML for each section
        for section_name, changes in changes_by_section.items():
            html_parts.append(f'<div class="diff-section">Section: {section_name}</div>')
            
            for change in changes:
                patch = change['patch']
                field = change['field']
                
                css_class = 'diff-modified'
                if patch.operation == EditPatchOperation.HIDE:
                    css_class = 'diff-removed'
                elif patch.operation == EditPatchOperation.SHOW:
                    css_class = 'diff-added'
                
                html_parts.append(f'<div class="diff-field {css_class}">')
                html_parts.append(f'<strong>{field.name}</strong> ({field.field_type.value})<br>')
                html_parts.append(f'Operation: {patch.operation.value}<br>')
                
                if patch.operation == EditPatchOperation.RENAME and patch.new_name:
                    html_parts.append(f'New name: {patch.new_name}<br>')
                
                if patch.new_position:
                    html_parts.append(f'New position: x={patch.new_position["x"]}, y={patch.new_position["y"]}<br>')
                
                if patch.description:
                    html_parts.append(f'Description: {patch.description}<br>')
                
                html_parts.append('</div>')
        
        html_parts.append('</div>')
        
        return '\n'.join(html_parts)
    
    async def _generate_warnings(self, metadata: ReportMetadata, patches: List[EditPatch]) -> List[str]:
        """Generate warnings about potential issues with the patches."""
        warnings = []
        
        # Check for hiding critical fields
        for patch in patches:
            if patch.operation == EditPatchOperation.HIDE:
                field = await self._find_field_by_id(metadata, patch.target_field_id)
                if field and field.field_type.value in ['currency', 'formula']:
                    warnings.append(f"Hiding {field.field_type.value} field '{field.name}' may affect report calculations")
        
        # Check for renaming fields that might be referenced elsewhere
        rename_patches = [p for p in patches if p.operation == EditPatchOperation.RENAME]
        if len(rename_patches) > 5:
            warnings.append(f"Renaming {len(rename_patches)} fields at once may cause confusion")
        
        # Check for moving fields outside visible area
        for patch in patches:
            if patch.operation in [EditPatchOperation.MOVE, EditPatchOperation.RESIZE] and patch.new_position:
                if patch.new_position.get('x', 0) < 0 or patch.new_position.get('y', 0) < 0:
                    warnings.append("Moving field to negative coordinates may make it invisible")
        
        return warnings
    
    async def _estimate_impact(self, patches: List[EditPatch]) -> str:
        """Estimate the impact of the patches."""
        
        operation_counts = {}
        for patch in patches:
            op = patch.operation.value
            operation_counts[op] = operation_counts.get(op, 0) + 1
        
        total_patches = len(patches)
        
        if total_patches == 1:
            return "Low impact - single field change"
        elif total_patches <= 5:
            return f"Medium impact - {total_patches} field changes"
        else:
            return f"High impact - {total_patches} field changes across multiple operations"
    
    async def _apply_single_patch(self, metadata: ReportMetadata, patch: EditPatch, file_path: Path):
        """Apply a single patch to the actual Crystal Report file."""
        
        # In a real implementation, this would use the SAP Crystal .NET SDK
        # to modify the actual .rpt file. For now, we'll simulate the operation.
        
        logger.info(
            "Applying patch to Crystal Report file",
            patch_id=patch.id,
            operation=patch.operation.value,
            target_field=patch.target_field_id
        )
        
        # Simulate processing time
        import asyncio
        await asyncio.sleep(0.1)
        
        # In production, this would:
        # 1. Load the .rpt file using Crystal SDK
        # 2. Find the target field/object
        # 3. Apply the specific operation
        # 4. Save the modified report
        
        # For now, we'll just log what would happen
        if patch.operation == EditPatchOperation.HIDE:
            logger.info("Would set field visibility to false")
        elif patch.operation == EditPatchOperation.RENAME:
            logger.info(f"Would rename field to '{patch.new_name}'")
        elif patch.operation == EditPatchOperation.MOVE:
            logger.info(f"Would move field to position {patch.new_position}")
        # ... etc for other operations
    
    async def _create_backup(self, file_path: Path) -> Path:
        """Create a backup of the Crystal Report file."""
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = f"{file_path.stem}_backup_{timestamp}{file_path.suffix}"
        backup_path = file_path.parent / backup_name
        
        # Copy the file
        import shutil
        shutil.copy2(file_path, backup_path)
        
        logger.info("Backup created", original=str(file_path), backup=str(backup_path))
        
        return backup_path
    
    async def _create_change_log_entry(
        self,
        metadata: ReportMetadata,
        patch: EditPatch,
        user_id: Optional[str],
        success: bool = True,
        error_message: Optional[str] = None
    ) -> ChangeLogEntry:
        """Create a change log entry for a patch application."""
        
        # Find the field to get its current state
        field = await self._find_field_by_id(metadata, patch.target_field_id)
        field_name = field.name if field else "Unknown"
        
        # Determine before/after values based on operation
        before_value = None
        after_value = None
        
        if field:
            if patch.operation == EditPatchOperation.HIDE:
                before_value = {"visible": field.visible}
                after_value = {"visible": False}
            elif patch.operation == EditPatchOperation.SHOW:
                before_value = {"visible": field.visible}
                after_value = {"visible": True}
            elif patch.operation == EditPatchOperation.RENAME:
                before_value = {"display_name": field.display_name}
                after_value = {"display_name": patch.new_name}
            elif patch.operation in [EditPatchOperation.MOVE, EditPatchOperation.RESIZE]:
                before_value = {"x": field.x, "y": field.y, "width": field.width, "height": field.height}
                after_value = patch.new_position
            elif patch.operation == EditPatchOperation.FORMAT:
                before_value = field.format
                after_value = patch.new_format
        
        return ChangeLogEntry(
            report_id=metadata.id,
            patch_id=patch.id,
            operation=patch.operation,
            field_name=field_name,
            field_id=patch.target_field_id,
            before_value=before_value,
            after_value=after_value,
            user_id=user_id,
            description=patch.description,
            success=success,
            error_message=error_message
        )
    
    async def _find_field_by_id(self, metadata: ReportMetadata, field_id: str):
        """Find a field by its ID in the metadata."""
        
        # Search in sections
        for section in metadata.sections:
            for field in section.fields:
                if field.id == field_id:
                    return field
        
        # Search in parameters
        for param in metadata.parameters:
            if param.id == field_id:
                return param
        
        # Search in formulas
        for formula in metadata.formulas:
            if formula.id == field_id:
                return formula
        
        return None
    
    async def _find_section_for_field(self, metadata: ReportMetadata, field_id: str) -> str:
        """Find which section contains a field."""
        
        for section in metadata.sections:
            for field in section.fields:
                if field.id == field_id:
                    return section.name
        
        return "Other"