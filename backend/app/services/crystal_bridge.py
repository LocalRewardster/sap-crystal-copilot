"""
Bridge service to communicate with the Crystal Reports C# service.
Handles all interactions with the Crystal Reports .NET SDK via HTTP.
"""

import asyncio
import httpx
import json
from pathlib import Path
from typing import Dict, List, Optional, Any, Union
from datetime import datetime

from app.core.config import get_settings
from app.core.logging import get_logger
from app.models.report import ReportMetadata, ReportField, ReportSection, DatabaseConnection, FieldType, SectionType

logger = get_logger(__name__)
settings = get_settings()


class CrystalBridgeService:
    """Service for communicating with Crystal Reports C# service."""
    
    def __init__(self):
        self.crystal_service_url = getattr(settings, 'CRYSTAL_SERVICE_URL', 'http://localhost:5001')
        self.timeout = 30.0  # 30 second timeout for Crystal operations
        
    async def generate_preview(self, report_path: Path, format: str = "PDF", parameters: Optional[Dict] = None) -> bytes:
        """Generate a preview of the Crystal Report using the C# service."""
        try:
            # Convert to absolute path and ensure it exists
            abs_path = report_path.resolve()
            if not abs_path.exists():
                raise FileNotFoundError(f"Report file not found: {abs_path}")
            
            # Convert to Windows-compatible path string
            path_str = str(abs_path).replace('/', '\\')
            
            logger.info("Generating Crystal Report preview", report_path=path_str, format=format)
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.crystal_service_url}/api/crystalreports/preview",
                    json={
                        "reportPath": path_str,
                        "format": format,
                        "parameters": parameters or {}
                    }
                )
                
                if response.status_code == 200:
                    logger.info("Crystal Report preview generated successfully", 
                              report_path=str(report_path), 
                              size_bytes=len(response.content))
                    return response.content
                else:
                    error_msg = f"Crystal service returned {response.status_code}: {response.text}"
                    logger.error("Failed to generate Crystal Report preview", 
                               report_path=str(report_path), 
                               error=error_msg)
                    raise RuntimeError(error_msg)
                    
        except httpx.TimeoutException:
            error_msg = f"Crystal service timeout after {self.timeout}s"
            logger.error("Crystal service timeout", report_path=str(report_path))
            raise RuntimeError(error_msg)
        except Exception as e:
            logger.error("Crystal bridge error", report_path=str(report_path), error=str(e))
            raise
    
    async def extract_metadata(self, report_path: Path) -> ReportMetadata:
        """Extract comprehensive metadata from Crystal Report using C# service."""
        try:
            # Convert to absolute path and ensure it exists
            abs_path = report_path.resolve()
            if not abs_path.exists():
                raise FileNotFoundError(f"Report file not found: {abs_path}")
            
            # Convert to Windows-compatible path string
            path_str = str(abs_path).replace('/', '\\')
            
            logger.info("Extracting Crystal Report metadata", report_path=path_str)
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.crystal_service_url}/api/crystalreports/metadata",
                    json={"reportPath": path_str}
                )
                
                if response.status_code == 200:
                    crystal_data = response.json()
                    
                    if not crystal_data.get('success'):
                        raise RuntimeError(f"Crystal service error: {crystal_data.get('error', 'Unknown error')}")
                    
                    # Transform Crystal Reports metadata to our format
                    metadata = await self._transform_crystal_metadata(crystal_data['data'], report_path)
                    
                    logger.info("Crystal Report metadata extracted successfully",
                              report_path=str(report_path),
                              sections_count=len(metadata.sections),
                              fields_count=sum(len(section.fields) for section in metadata.sections))
                    
                    return metadata
                else:
                    error_msg = f"Crystal service returned {response.status_code}: {response.text}"
                    logger.error("Failed to extract Crystal Report metadata", 
                               report_path=str(report_path), 
                               error=error_msg)
                    raise RuntimeError(error_msg)
                    
        except httpx.TimeoutException:
            error_msg = f"Crystal service timeout after {self.timeout}s"
            logger.error("Crystal service timeout", report_path=str(report_path))
            raise RuntimeError(error_msg)
        except Exception as e:
            logger.error("Crystal bridge metadata error", report_path=str(report_path), error=str(e))
            raise
    
    async def modify_field(self, report_path: Path, field_name: str, operation: str, parameters: Optional[Dict] = None) -> bool:
        """Perform field operations using Crystal Reports C# service."""
        try:
            # Convert to absolute path and ensure it exists
            abs_path = report_path.resolve()
            if not abs_path.exists():
                raise FileNotFoundError(f"Report file not found: {abs_path}")
            
            # Convert to Windows-compatible path string
            path_str = str(abs_path).replace('/', '\\')
            
            logger.info("Performing Crystal Report field operation", 
                       report_path=path_str, 
                       field_name=field_name, 
                       operation=operation)
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.crystal_service_url}/api/crystalreports/field-operation",
                    json={
                        "reportPath": path_str,
                        "fieldName": field_name,
                        "operation": operation,
                        "parameters": parameters or {}
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    success = result.get('success', False) and result.get('data', False)
                    
                    if success:
                        logger.info("Crystal Report field operation completed successfully",
                                  report_path=str(report_path),
                                  field_name=field_name,
                                  operation=operation)
                    else:
                        logger.warning("Crystal Report field operation failed",
                                     report_path=str(report_path),
                                     field_name=field_name,
                                     operation=operation,
                                     error=result.get('error', 'Unknown error'))
                    
                    return success
                else:
                    error_msg = f"Crystal service returned {response.status_code}: {response.text}"
                    logger.error("Failed to perform Crystal Report field operation", 
                               report_path=str(report_path), 
                               field_name=field_name,
                               operation=operation,
                               error=error_msg)
                    return False
                    
        except httpx.TimeoutException:
            logger.error("Crystal service timeout during field operation", 
                        report_path=str(report_path), 
                        field_name=field_name,
                        operation=operation)
            return False
        except Exception as e:
            logger.error("Crystal bridge field operation error", 
                        report_path=str(report_path), 
                        field_name=field_name,
                        operation=operation,
                        error=str(e))
            return False
    
    async def validate_report(self, report_path: Path) -> bool:
        """Validate if Crystal Report is accessible using C# service."""
        try:
            # Convert to absolute path and ensure it exists
            abs_path = report_path.resolve()
            if not abs_path.exists():
                return False
            
            # Convert to Windows-compatible path string
            path_str = str(abs_path).replace('/', '\\')
            
            logger.info("Validating Crystal Report", report_path=path_str)
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.crystal_service_url}/api/crystalreports/validate",
                    json={"reportPath": path_str}
                )
                
                if response.status_code == 200:
                    result = response.json()
                    is_valid = result.get('success', False) and result.get('data', False)
                    
                    logger.info("Crystal Report validation completed", 
                              report_path=str(report_path), 
                              is_valid=is_valid)
                    
                    return is_valid
                else:
                    logger.warning("Crystal service validation failed", 
                                 report_path=str(report_path), 
                                 status_code=response.status_code)
                    return False
                    
        except Exception as e:
            logger.warning("Crystal bridge validation error", 
                          report_path=str(report_path), 
                          error=str(e))
            return False
    
    async def export_report(self, report_path: Path, format: str, parameters: Optional[Dict] = None) -> bytes:
        """Export Crystal Report to various formats."""
        try:
            # Convert to absolute path and ensure it exists
            abs_path = report_path.resolve()
            if not abs_path.exists():
                raise FileNotFoundError(f"Report file not found: {abs_path}")
            
            # Convert to Windows-compatible path string
            path_str = str(abs_path).replace('/', '\\')
            
            logger.info("Exporting Crystal Report", report_path=path_str, format=format)
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.crystal_service_url}/api/crystalreports/export",
                    json={
                        "reportPath": path_str,
                        "format": format,
                        "parameters": parameters or {}
                    }
                )
                
                if response.status_code == 200:
                    logger.info("Crystal Report exported successfully", 
                              report_path=str(report_path), 
                              format=format,
                              size_bytes=len(response.content))
                    return response.content
                else:
                    error_msg = f"Crystal service returned {response.status_code}: {response.text}"
                    logger.error("Failed to export Crystal Report", 
                               report_path=str(report_path), 
                               format=format,
                               error=error_msg)
                    raise RuntimeError(error_msg)
                    
        except httpx.TimeoutException:
            error_msg = f"Crystal service timeout after {self.timeout}s"
            logger.error("Crystal service export timeout", report_path=str(report_path), format=format)
            raise RuntimeError(error_msg)
        except Exception as e:
            logger.error("Crystal bridge export error", 
                        report_path=str(report_path), 
                        format=format, 
                        error=str(e))
            raise
    
    async def health_check(self) -> bool:
        """Check if Crystal Reports C# service is healthy."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.crystal_service_url}/api/crystalreports/health")
                return response.status_code == 200
        except Exception:
            return False
    
    async def _transform_crystal_metadata(self, crystal_data: Dict, report_path: Path) -> ReportMetadata:
        """Transform Crystal Reports metadata to our internal format."""
        
        # Create the base metadata
        metadata = ReportMetadata(
            id=crystal_data.get('id', ''),
            filename=report_path.name,
            title=crystal_data.get('title', report_path.stem),
            description=f"Crystal Report processed via Crystal Reports SDK",
            author=crystal_data.get('author', 'Unknown'),
            file_size=crystal_data.get('fileSize', 0),
            status='ready',
            parsed_at=datetime.utcnow()
        )
        
        # Parse creation and modification dates
        if 'createdDate' in crystal_data:
            try:
                metadata.created_date = datetime.fromisoformat(crystal_data['createdDate'].replace('Z', '+00:00'))
            except:
                pass
        
        if 'modifiedDate' in crystal_data:
            try:
                metadata.modified_date = datetime.fromisoformat(crystal_data['modifiedDate'].replace('Z', '+00:00'))
            except:
                pass
        
        # Transform sections
        metadata.sections = []
        for section_data in crystal_data.get('sections', []):
            section = ReportSection(
                section_type=self._map_section_type(section_data.get('sectionType', '')),
                name=section_data.get('name', ''),
                height=section_data.get('height', 0),
                fields=[]
            )
            
            # Transform fields
            for field_data in section_data.get('fields', []):
                field = ReportField(
                    id=field_data.get('id', ''),
                    name=field_data.get('name', ''),
                    field_type=self._map_field_type(field_data.get('fieldType', '')),
                    section=section.section_type,
                    x=field_data.get('x', 0),
                    y=field_data.get('y', 0),
                    width=field_data.get('width', 0),
                    height=field_data.get('height', 0),
                    visible=field_data.get('visible', True)
                )
                
                # Add additional field properties
                if field_data.get('formula'):
                    field.formula = field_data['formula']
                
                if field_data.get('tableName') and field_data.get('columnName'):
                    field.database_field = {
                        'table_name': field_data['tableName'],
                        'field_name': field_data['columnName'],
                        'data_type': field_data.get('dataType', '')
                    }
                
                section.fields.append(field)
            
            metadata.sections.append(section)
        
        # Transform tables
        metadata.tables = crystal_data.get('tables', [])
        
        # Transform database connections
        metadata.database_connections = []
        for conn_data in crystal_data.get('databaseConnections', []):
            connection = DatabaseConnection(
                driver=conn_data.get('driver', ''),
                server=conn_data.get('server', ''),
                database=conn_data.get('database', ''),
                username=conn_data.get('username', '')
            )
            metadata.database_connections.append(connection)
        
        # Transform parameters
        metadata.parameters = []
        for param_data in crystal_data.get('parameters', []):
            parameter = ReportField(
                id=f"param_{param_data.get('name', '')}",
                name=param_data.get('name', ''),
                field_type=FieldType.PARAMETER,
                section=SectionType.DETAILS  # Parameters don't belong to sections
            )
            
            if param_data.get('defaultValue'):
                parameter.default_value = param_data['defaultValue']
            
            metadata.parameters.append(parameter)
        
        return metadata
    
    def _map_section_type(self, section_type_str: str) -> SectionType:
        """Map Crystal Reports section type to our enum."""
        mapping = {
            'ReportHeader': SectionType.REPORT_HEADER,
            'PageHeader': SectionType.PAGE_HEADER,
            'GroupHeader': SectionType.GROUP_HEADER,
            'Details': SectionType.DETAILS,
            'GroupFooter': SectionType.GROUP_FOOTER,
            'ReportFooter': SectionType.REPORT_FOOTER,
            'PageFooter': SectionType.PAGE_FOOTER
        }
        return mapping.get(section_type_str, SectionType.DETAILS)
    
    def _map_field_type(self, field_type_str: str) -> FieldType:
        """Map Crystal Reports field type to our enum."""
        mapping = {
            'DatabaseField': FieldType.STRING,
            'TextObject': FieldType.STRING,
            'Formula': FieldType.FORMULA,
            'Parameter': FieldType.PARAMETER
        }
        return mapping.get(field_type_str, FieldType.STRING)


# Singleton instance
_crystal_bridge_service = None

def get_crystal_bridge_service() -> CrystalBridgeService:
    """Get the Crystal Bridge service singleton."""
    global _crystal_bridge_service
    if _crystal_bridge_service is None:
        _crystal_bridge_service = CrystalBridgeService()
    return _crystal_bridge_service