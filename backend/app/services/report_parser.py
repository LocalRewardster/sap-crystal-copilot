"""
Crystal Reports parsing service using RptToXml and metadata normalization.
"""

import asyncio
import json
import subprocess
import tempfile
import time
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
import xmltodict
import aiofiles

from app.core.config import get_settings
from app.core.logging import get_logger
from app.models.report import (
    ReportMetadata, ReportField, ReportSection, DatabaseField, DatabaseConnection,
    FieldType, SectionType, ReportStatus
)
from app.services.crystal_bridge import get_crystal_bridge_service

logger = get_logger(__name__)
settings = get_settings()


class ReportParserService:
    """Service for parsing Crystal Reports files."""
    
    def __init__(self):
        self.rpttoxml_path = Path(settings.RPTTOXML_PATH)
        self.crystal_bridge = get_crystal_bridge_service()
        
    async def parse_report(self, file_path: Path, report_id: str, filename: str) -> ReportMetadata:
        """
        Parse a Crystal Reports file and extract metadata.
        
        Args:
            file_path: Path to the .rpt file
            report_id: Unique identifier for the report
            filename: Original filename
            
        Returns:
            ReportMetadata object with parsed information
        """
        start_time = time.time()
        
        try:
            logger.info("Starting report parsing", report_id=report_id, filename=filename)
            
            # Try Crystal Bridge first (if C# service is available)
            if await self.crystal_bridge.health_check():
                logger.info("Using Crystal Reports SDK via C# service", report_id=report_id)
                try:
                    metadata = await self.crystal_bridge.extract_metadata(file_path)
                    # Update metadata with our IDs
                    metadata.id = report_id
                    metadata.filename = filename
                    return metadata
                except Exception as e:
                    logger.warning("Crystal Bridge failed, falling back to RptToXml", 
                                 report_id=report_id, error=str(e))
            
            # Fallback to RptToXml method
            logger.info("Using RptToXml fallback method", report_id=report_id)
            
            # Step 1: Convert .rpt to XML using RptToXml
            xml_content = await self._convert_rpt_to_xml(file_path)
            
            # Step 2: Parse XML and normalize to JSON structure
            raw_data = await self._parse_xml_to_dict(xml_content)
            
            # Step 3: Extract and normalize metadata
            metadata = await self._normalize_metadata(raw_data, report_id, filename, file_path)
            
            duration_ms = (time.time() - start_time) * 1000
            logger.info(
                "Report parsing completed",
                report_id=report_id,
                duration_ms=duration_ms,
                sections_count=len(metadata.sections),
                fields_count=sum(len(section.fields) for section in metadata.sections)
            )
            
            return metadata
            
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            logger.error(
                "Report parsing failed",
                report_id=report_id,
                error=str(e),
                duration_ms=duration_ms
            )
            raise
    
    async def _convert_rpt_to_xml(self, file_path: Path) -> str:
        """Convert .rpt file to XML using RptToXml utility."""
        
        # For now, we'll simulate the XML conversion since RptToXml requires Windows
        # In production, this would run in a Windows container
        if not self.rpttoxml_path.exists():
            logger.warning("RptToXml not found, using mock XML data")
            return await self._generate_mock_xml(file_path)
        
        with tempfile.NamedTemporaryFile(suffix='.xml', delete=False) as temp_xml:
            temp_xml_path = Path(temp_xml.name)
        
        try:
            # Execute RptToXml command
            cmd = [
                str(self.rpttoxml_path),
                str(file_path),
                str(temp_xml_path)
            ]
            
            result = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await result.communicate()
            
            if result.returncode != 0:
                error_msg = stderr.decode() if stderr else "RptToXml conversion failed"
                raise RuntimeError(f"RptToXml failed: {error_msg}")
            
            # Read the generated XML
            async with aiofiles.open(temp_xml_path, 'r', encoding='utf-8') as f:
                xml_content = await f.read()
            
            return xml_content
            
        finally:
            # Clean up temporary file
            if temp_xml_path.exists():
                temp_xml_path.unlink()
    
    async def _generate_mock_xml(self, file_path: Path) -> str:
        """Generate mock XML data for development/testing."""
        
        # This simulates what RptToXml would produce
        mock_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Report xmlns="urn:crystal-reports:schemas:report-detail">
    <ReportTitle>{file_path.stem}</ReportTitle>
    <Author>Crystal Reports</Author>
    <CreationDate>{datetime.now().isoformat()}</CreationDate>
    <ModifiedDate>{datetime.now().isoformat()}</ModifiedDate>
    
    <DatabaseConnections>
        <Connection>
            <Driver>SQL Server Native Client</Driver>
            <Server>localhost</Server>
            <Database>SampleDB</Database>
        </Connection>
    </DatabaseConnections>
    
    <Tables>
        <Table name="Customers" />
        <Table name="Orders" />
        <Table name="Products" />
    </Tables>
    
    <Sections>
        <Section type="ReportHeader" name="Report Header" height="720">
            <Fields>
                <Field id="field_1" name="CompanyName" type="string" x="0" y="0" width="2880" height="360">
                    <DatabaseField table="Customers" field="CompanyName" />
                </Field>
                <Field id="field_2" name="ReportTitle" type="string" x="0" y="360" width="5760" height="360">
                    <Text>Sales Report</Text>
                </Field>
            </Fields>
        </Section>
        
        <Section type="PageHeader" name="Page Header" height="360">
            <Fields>
                <Field id="field_3" name="OrderDate" type="string" x="0" y="0" width="1440" height="360">
                    <Text>Order Date</Text>
                </Field>
                <Field id="field_4" name="CustomerName" type="string" x="1440" y="0" width="2880" height="360">
                    <Text>Customer</Text>
                </Field>
                <Field id="field_5" name="Amount" type="string" x="4320" y="0" width="1440" height="360">
                    <Text>Amount</Text>
                </Field>
            </Fields>
        </Section>
        
        <Section type="Details" name="Details" height="360">
            <Fields>
                <Field id="field_6" name="OrderDate" type="date" x="0" y="0" width="1440" height="360">
                    <DatabaseField table="Orders" field="OrderDate" />
                </Field>
                <Field id="field_7" name="CompanyName" type="string" x="1440" y="0" width="2880" height="360">
                    <DatabaseField table="Customers" field="CompanyName" />
                </Field>
                <Field id="field_8" name="OrderTotal" type="currency" x="4320" y="0" width="1440" height="360">
                    <Formula>Sum({{Orders.Quantity}} * {{Products.UnitPrice}})</Formula>
                </Field>
            </Fields>
        </Section>
        
        <Section type="ReportFooter" name="Report Footer" height="360">
            <Fields>
                <Field id="field_9" name="GrandTotal" type="currency" x="4320" y="0" width="1440" height="360">
                    <Formula>Sum({{@OrderTotal}})</Formula>
                </Field>
            </Fields>
        </Section>
    </Sections>
    
    <Parameters>
        <Parameter id="param_1" name="StartDate" type="date" />
        <Parameter id="param_2" name="EndDate" type="date" />
    </Parameters>
    
    <Formulas>
        <Formula id="formula_1" name="@OrderTotal">
            <Text>{{Orders.Quantity}} * {{Products.UnitPrice}}</Text>
        </Formula>
        <Formula id="formula_2" name="@GrandTotal">
            <Text>Sum({{@OrderTotal}})</Text>
        </Formula>
    </Formulas>
</Report>"""
        
        return mock_xml
    
    async def _parse_xml_to_dict(self, xml_content: str) -> Dict[str, Any]:
        """Parse XML content to Python dictionary."""
        try:
            # Use xmltodict for easier parsing
            data = xmltodict.parse(xml_content)
            return data
        except Exception as e:
            logger.error("Failed to parse XML", error=str(e))
            raise ValueError(f"Invalid XML content: {str(e)}")
    
    async def _normalize_metadata(
        self, 
        raw_data: Dict[str, Any], 
        report_id: str, 
        filename: str, 
        file_path: Path
    ) -> ReportMetadata:
        """Normalize parsed XML data to ReportMetadata structure."""
        
        try:
            report_data = raw_data.get('Report', {})
            
            # Basic report information
            metadata = ReportMetadata(
                id=report_id,
                filename=filename,
                title=report_data.get('ReportTitle', filename),
                description=report_data.get('Description'),
                author=report_data.get('Author'),
                file_size=file_path.stat().st_size,
                status=ReportStatus.READY,
                parsed_at=datetime.utcnow()
            )
            
            # Parse dates
            if 'CreationDate' in report_data:
                try:
                    metadata.created_date = datetime.fromisoformat(
                        report_data['CreationDate'].replace('Z', '+00:00')
                    )
                except:
                    pass
            
            if 'ModifiedDate' in report_data:
                try:
                    metadata.modified_date = datetime.fromisoformat(
                        report_data['ModifiedDate'].replace('Z', '+00:00')
                    )
                except:
                    pass
            
            # Parse database connections
            metadata.database_connections = await self._parse_database_connections(
                report_data.get('DatabaseConnections', {})
            )
            
            # Parse tables
            tables_data = report_data.get('Tables', {})
            if isinstance(tables_data.get('Table'), list):
                metadata.tables = [table.get('@name', '') for table in tables_data['Table']]
            elif isinstance(tables_data.get('Table'), dict):
                metadata.tables = [tables_data['Table'].get('@name', '')]
            
            # Parse sections and fields
            metadata.sections = await self._parse_sections(
                report_data.get('Sections', {})
            )
            
            # Parse parameters
            metadata.parameters = await self._parse_parameters(
                report_data.get('Parameters', {})
            )
            
            # Parse formulas
            metadata.formulas = await self._parse_formulas(
                report_data.get('Formulas', {})
            )
            
            return metadata
            
        except Exception as e:
            logger.error("Failed to normalize metadata", error=str(e))
            raise ValueError(f"Failed to normalize report metadata: {str(e)}")
    
    async def _parse_database_connections(self, connections_data: Dict) -> List[DatabaseConnection]:
        """Parse database connection information."""
        connections = []
        
        connection_list = connections_data.get('Connection', [])
        if isinstance(connection_list, dict):
            connection_list = [connection_list]
        
        for conn_data in connection_list:
            connection = DatabaseConnection(
                driver=conn_data.get('Driver', ''),
                server=conn_data.get('Server'),
                database=conn_data.get('Database'),
                username=conn_data.get('Username')
            )
            connections.append(connection)
        
        return connections
    
    async def _parse_sections(self, sections_data: Dict) -> List[ReportSection]:
        """Parse report sections and their fields."""
        sections = []
        
        section_list = sections_data.get('Section', [])
        if isinstance(section_list, dict):
            section_list = [section_list]
        
        for section_data in section_list:
            section_type = self._map_section_type(section_data.get('@type', ''))
            
            section = ReportSection(
                section_type=section_type,
                name=section_data.get('@name', ''),
                height=int(section_data.get('@height', 0))
            )
            
            # Parse fields in this section
            fields_data = section_data.get('Fields', {})
            section.fields = await self._parse_fields(fields_data)
            
            sections.append(section)
        
        return sections
    
    async def _parse_fields(self, fields_data: Dict) -> List[ReportField]:
        """Parse fields within a section."""
        fields = []
        
        field_list = fields_data.get('Field', [])
        if isinstance(field_list, dict):
            field_list = [field_list]
        
        for field_data in field_list:
            field_type = self._map_field_type(field_data.get('@type', ''))
            
            field = ReportField(
                id=field_data.get('@id', ''),
                name=field_data.get('@name', ''),
                field_type=field_type,
                section=SectionType.DETAILS,  # Will be set by parent section
                x=int(field_data.get('@x', 0)),
                y=int(field_data.get('@y', 0)),
                width=int(field_data.get('@width', 0)),
                height=int(field_data.get('@height', 0))
            )
            
            # Parse database field reference
            db_field_data = field_data.get('DatabaseField')
            if db_field_data:
                field.database_field = DatabaseField(
                    table_name=db_field_data.get('@table', ''),
                    field_name=db_field_data.get('@field', ''),
                    data_type=field_data.get('@type', '')
                )
            
            # Parse formula
            if 'Formula' in field_data:
                field.formula = field_data['Formula']
            
            fields.append(field)
        
        return fields
    
    async def _parse_parameters(self, params_data: Dict) -> List[ReportField]:
        """Parse report parameters."""
        parameters = []
        
        param_list = params_data.get('Parameter', [])
        if isinstance(param_list, dict):
            param_list = [param_list]
        
        for param_data in param_list:
            field_type = self._map_field_type(param_data.get('@type', ''))
            
            parameter = ReportField(
                id=param_data.get('@id', ''),
                name=param_data.get('@name', ''),
                field_type=FieldType.PARAMETER,
                section=SectionType.DETAILS  # Parameters don't belong to sections
            )
            
            parameters.append(parameter)
        
        return parameters
    
    async def _parse_formulas(self, formulas_data: Dict) -> List[ReportField]:
        """Parse report formulas."""
        formulas = []
        
        formula_list = formulas_data.get('Formula', [])
        if isinstance(formula_list, dict):
            formula_list = [formula_list]
        
        for formula_data in formula_list:
            formula = ReportField(
                id=formula_data.get('@id', ''),
                name=formula_data.get('@name', ''),
                field_type=FieldType.FORMULA,
                section=SectionType.DETAILS,  # Formulas don't belong to sections
                formula=formula_data.get('Text', '')
            )
            
            formulas.append(formula)
        
        return formulas
    
    def _map_section_type(self, section_type_str: str) -> SectionType:
        """Map string section type to enum."""
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
        """Map string field type to enum."""
        mapping = {
            'string': FieldType.STRING,
            'number': FieldType.NUMBER,
            'date': FieldType.DATE,
            'datetime': FieldType.DATETIME,
            'boolean': FieldType.BOOLEAN,
            'currency': FieldType.CURRENCY,
            'formula': FieldType.FORMULA,
            'parameter': FieldType.PARAMETER
        }
        return mapping.get(field_type_str.lower(), FieldType.STRING)