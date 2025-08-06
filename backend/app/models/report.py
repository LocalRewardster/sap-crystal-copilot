"""
Pydantic models for Crystal Reports data structures.
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, validator


class ReportStatus(str, Enum):
    """Status of report processing."""
    UPLOADING = "uploading"
    PARSING = "parsing"
    READY = "ready"
    ERROR = "error"


class FieldType(str, Enum):
    """Crystal Reports field types."""
    STRING = "string"
    NUMBER = "number"
    DATE = "date"
    DATETIME = "datetime"
    BOOLEAN = "boolean"
    CURRENCY = "currency"
    FORMULA = "formula"
    PARAMETER = "parameter"
    RUNNING_TOTAL = "running_total"
    GROUP = "group"
    SUMMARY = "summary"


class SectionType(str, Enum):
    """Crystal Reports section types."""
    REPORT_HEADER = "report_header"
    PAGE_HEADER = "page_header"
    GROUP_HEADER = "group_header"
    DETAILS = "details"
    GROUP_FOOTER = "group_footer"
    REPORT_FOOTER = "report_footer"
    PAGE_FOOTER = "page_footer"


class DatabaseField(BaseModel):
    """Database field information."""
    table_name: str
    field_name: str
    data_type: str
    is_key: bool = False
    description: Optional[str] = None


class ReportField(BaseModel):
    """Crystal Reports field definition."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    name: str
    display_name: Optional[str] = None
    field_type: FieldType
    section: SectionType
    x: int = 0  # Position coordinates
    y: int = 0
    width: int = 0
    height: int = 0
    visible: bool = True
    formula: Optional[str] = None
    format: Optional[Dict[str, Any]] = None
    database_field: Optional[DatabaseField] = None
    
    @validator('display_name', always=True)
    def set_display_name(cls, v, values):
        return v or values.get('name')


class ReportSection(BaseModel):
    """Crystal Reports section definition."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    section_type: SectionType
    name: str
    height: int = 0
    visible: bool = True
    fields: List[ReportField] = []


class DatabaseConnection(BaseModel):
    """Database connection information."""
    driver: str
    server: Optional[str] = None
    database: Optional[str] = None
    username: Optional[str] = None
    # Note: We don't store passwords for security
    connection_string: Optional[str] = None


class ReportMetadata(BaseModel):
    """Complete Crystal Reports metadata."""
    id: UUID = Field(default_factory=uuid4)
    filename: str
    title: Optional[str] = None
    description: Optional[str] = None
    author: Optional[str] = None
    created_date: Optional[datetime] = None
    modified_date: Optional[datetime] = None
    
    # Structure
    sections: List[ReportSection] = []
    parameters: List[ReportField] = []
    formulas: List[ReportField] = []
    
    # Data sources
    database_connections: List[DatabaseConnection] = []
    tables: List[str] = []
    
    # Processing info
    status: ReportStatus = ReportStatus.UPLOADING
    file_size: int = 0
    parsed_at: Optional[datetime] = None
    error_message: Optional[str] = None


class EditPatchOperation(str, Enum):
    """Types of edit operations."""
    HIDE = "hide"
    SHOW = "show"
    MOVE = "move"
    RENAME = "rename"
    RESIZE = "resize"
    FORMAT = "format"
    DELETE = "delete"


class EditPatch(BaseModel):
    """Single edit operation patch."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    operation: EditPatchOperation
    target_field_id: str
    target_section_id: Optional[str] = None
    
    # Operation-specific parameters
    new_name: Optional[str] = None
    new_position: Optional[Dict[str, int]] = None  # {x, y, width, height}
    new_format: Optional[Dict[str, Any]] = None
    visible: Optional[bool] = None
    
    # Metadata
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    applied_at: Optional[datetime] = None
    
    @validator('new_position')
    def validate_position(cls, v):
        if v is not None:
            required_keys = {'x', 'y', 'width', 'height'}
            if not all(key in v for key in required_keys):
                raise ValueError(f"Position must contain all keys: {required_keys}")
            if not all(isinstance(v[key], int) and v[key] >= 0 for key in required_keys):
                raise ValueError("Position values must be non-negative integers")
        return v


class EditPatchList(BaseModel):
    """Collection of edit patches to apply."""
    patches: List[EditPatch]
    report_id: UUID
    description: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ChangeLogEntry(BaseModel):
    """Audit log entry for report changes."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    report_id: UUID
    patch_id: str
    operation: EditPatchOperation
    field_name: str
    field_id: str
    
    # Change details
    before_value: Optional[Union[str, Dict[str, Any]]] = None
    after_value: Optional[Union[str, Dict[str, Any]]] = None
    
    # Metadata
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    user_id: Optional[str] = None
    description: Optional[str] = None
    success: bool = True
    error_message: Optional[str] = None


# Request/Response models

class UploadResponse(BaseModel):
    """Response for file upload."""
    report_id: UUID
    filename: str
    file_size: int
    status: ReportStatus
    message: str


class QueryRequest(BaseModel):
    """Natural language query request."""
    query: str
    context: Optional[Dict[str, Any]] = None


class QueryResponse(BaseModel):
    """Response to natural language query."""
    query: str
    answer: str
    field_references: List[Dict[str, Any]] = []
    confidence: float = Field(ge=0.0, le=1.0)
    sources: List[str] = []
    
    # LLM metadata
    model_used: str
    tokens_used: int
    processing_time_ms: float


class EditPreviewResponse(BaseModel):
    """Preview of edit changes."""
    patches: List[EditPatch]
    affected_fields: List[ReportField]
    html_diff: str
    warnings: List[str] = []
    estimated_impact: str


class ApplyEditsRequest(BaseModel):
    """Request to apply edit patches."""
    patches: List[EditPatch]
    dry_run: bool = False
    create_backup: bool = True


class ApplyEditsResponse(BaseModel):
    """Response after applying edits."""
    success: bool
    applied_patches: List[str]  # Patch IDs
    failed_patches: List[Dict[str, str]] = []  # {patch_id, error}
    backup_path: Optional[str] = None
    change_log_entries: List[ChangeLogEntry] = []