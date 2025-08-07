"""
Storage service for Crystal Reports metadata and files.
Handles database operations, file storage, and caching.
"""

import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
from uuid import UUID

from app.core.config import get_settings
from app.core.logging import get_logger
from app.models.report import ReportMetadata, ReportStatus, ChangeLogEntry

logger = get_logger(__name__)
settings = get_settings()


class StorageService:
    """Service for storing and retrieving report data."""
    
    def __init__(self):
        self.db_path = Path("crystal_copilot.db")
        self._init_database()
    
    def _init_database(self):
        """Initialize SQLite database with required tables."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS reports (
                        id TEXT PRIMARY KEY,
                        filename TEXT NOT NULL,
                        file_path TEXT NOT NULL,
                        file_size INTEGER NOT NULL,
                        status TEXT NOT NULL DEFAULT 'uploading',
                        error_message TEXT,
                        metadata_json TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS change_log (
                        id TEXT PRIMARY KEY,
                        report_id TEXT NOT NULL,
                        patch_id TEXT NOT NULL,
                        operation TEXT NOT NULL,
                        field_name TEXT NOT NULL,
                        field_id TEXT NOT NULL,
                        before_value TEXT,
                        after_value TEXT,
                        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        user_id TEXT,
                        description TEXT,
                        success BOOLEAN DEFAULT TRUE,
                        error_message TEXT,
                        FOREIGN KEY (report_id) REFERENCES reports (id)
                    )
                """)
                
                conn.execute("""
                    CREATE INDEX IF NOT EXISTS idx_reports_status ON reports (status);
                """)
                
                conn.execute("""
                    CREATE INDEX IF NOT EXISTS idx_change_log_report_id ON change_log (report_id);
                """)
                
                conn.execute("""
                    CREATE INDEX IF NOT EXISTS idx_change_log_timestamp ON change_log (timestamp);
                """)
                
                conn.commit()
                logger.info("Database initialized successfully")
                
        except Exception as e:
            logger.error("Failed to initialize database", error=str(e))
            raise
    
    async def create_report_record(
        self, 
        report_id: str, 
        filename: str, 
        file_size: int, 
        file_path: str
    ) -> None:
        """Create initial report record."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT INTO reports (id, filename, file_path, file_size, status)
                    VALUES (?, ?, ?, ?, ?)
                """, (report_id, filename, file_path, file_size, ReportStatus.UPLOADING.value))
                conn.commit()
                
            logger.info("Report record created", report_id=report_id, filename=filename)
            
        except Exception as e:
            logger.error("Failed to create report record", report_id=report_id, error=str(e))
            raise
    
    async def store_metadata(self, report_id: str, metadata: ReportMetadata) -> None:
        """Store parsed report metadata."""
        try:
            # Convert metadata to JSON
            metadata_json = metadata.model_dump_json()
            
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    UPDATE reports 
                    SET metadata_json = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                """, (metadata_json, report_id))
                conn.commit()
                
            logger.info("Metadata stored", report_id=report_id)
            
        except Exception as e:
            logger.error("Failed to store metadata", report_id=report_id, error=str(e))
            raise
    
    async def get_metadata(self, report_id: str) -> Optional[ReportMetadata]:
        """Retrieve report metadata."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.execute("""
                    SELECT metadata_json FROM reports WHERE id = ?
                """, (report_id,))
                
                row = cursor.fetchone()
                if not row or not row['metadata_json']:
                    return None
                
                # Parse JSON back to ReportMetadata
                metadata_dict = json.loads(row['metadata_json'])
                return ReportMetadata(**metadata_dict)
                
        except Exception as e:
            logger.error("Failed to get metadata", report_id=report_id, error=str(e))
            return None
    
    async def update_report_status(
        self, 
        report_id: str, 
        status: ReportStatus, 
        error_message: Optional[str] = None
    ) -> None:
        """Update report processing status."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    UPDATE reports 
                    SET status = ?, error_message = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                """, (status.value, error_message, report_id))
                conn.commit()
                
            logger.info("Report status updated", report_id=report_id, status=status.value)
            
        except Exception as e:
            logger.error("Failed to update report status", report_id=report_id, error=str(e))
            raise
    
    async def get_report_status(self, report_id: str) -> Optional[Dict[str, Any]]:
        """Get current report status and basic info."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.execute("""
                    SELECT id, filename, file_path, file_size, status, error_message, 
                           created_at, updated_at
                    FROM reports WHERE id = ?
                """, (report_id,))
                
                row = cursor.fetchone()
                if not row:
                    return None
                
                return {
                    "report_id": row['id'],
                    "filename": row['filename'],
                    "file_path": row['file_path'],
                    "file_size": row['file_size'],
                    "status": row['status'],
                    "error_message": row['error_message'],
                    "created_at": row['created_at'],
                    "updated_at": row['updated_at']
                }
                
        except Exception as e:
            logger.error("Failed to get report status", report_id=report_id, error=str(e))
            return None
    
    async def delete_report(self, report_id: str) -> bool:
        """Delete report and all associated data."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                # Get file path for cleanup
                cursor = conn.execute("""
                    SELECT file_path FROM reports WHERE id = ?
                """, (report_id,))
                
                row = cursor.fetchone()
                if not row:
                    return False
                
                file_path = Path(row[0])
                
                # Delete from database
                conn.execute("DELETE FROM change_log WHERE report_id = ?", (report_id,))
                conn.execute("DELETE FROM reports WHERE id = ?", (report_id,))
                conn.commit()
                
                # Delete file
                if file_path.exists():
                    file_path.unlink()
                
            logger.info("Report deleted", report_id=report_id)
            return True
            
        except Exception as e:
            logger.error("Failed to delete report", report_id=report_id, error=str(e))
            return False
    
    async def list_reports(
        self, 
        status: Optional[ReportStatus] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """List reports with optional filtering."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                
                if status:
                    cursor = conn.execute("""
                        SELECT id, filename, file_size, status, created_at, updated_at
                        FROM reports 
                        WHERE status = ?
                        ORDER BY created_at DESC
                        LIMIT ? OFFSET ?
                    """, (status.value, limit, offset))
                else:
                    cursor = conn.execute("""
                        SELECT id, filename, file_size, status, created_at, updated_at
                        FROM reports 
                        ORDER BY created_at DESC
                        LIMIT ? OFFSET ?
                    """, (limit, offset))
                
                rows = cursor.fetchall()
                
                return [
                    {
                        "report_id": row['id'],
                        "filename": row['filename'],
                        "file_size": row['file_size'],
                        "status": row['status'],
                        "created_at": row['created_at'],
                        "updated_at": row['updated_at']
                    }
                    for row in rows
                ]
                
        except Exception as e:
            logger.error("Failed to list reports", error=str(e))
            return []
    
    async def add_change_log_entry(self, entry: ChangeLogEntry) -> None:
        """Add entry to change log."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT INTO change_log (
                        id, report_id, patch_id, operation, field_name, field_id,
                        before_value, after_value, timestamp, user_id, description,
                        success, error_message
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    entry.id,
                    str(entry.report_id),
                    entry.patch_id,
                    entry.operation.value,
                    entry.field_name,
                    entry.field_id,
                    json.dumps(entry.before_value) if entry.before_value else None,
                    json.dumps(entry.after_value) if entry.after_value else None,
                    entry.timestamp.isoformat(),
                    entry.user_id,
                    entry.description,
                    entry.success,
                    entry.error_message
                ))
                conn.commit()
                
            logger.info("Change log entry added", report_id=str(entry.report_id), entry_id=entry.id)
            
        except Exception as e:
            logger.error("Failed to add change log entry", error=str(e))
            raise
    
    async def get_change_log(
        self, 
        report_id: str,
        limit: int = 1000,
        offset: int = 0
    ) -> List[ChangeLogEntry]:
        """Get change log entries for a report."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.execute("""
                    SELECT * FROM change_log 
                    WHERE report_id = ?
                    ORDER BY timestamp DESC
                    LIMIT ? OFFSET ?
                """, (report_id, limit, offset))
                
                rows = cursor.fetchall()
                
                entries = []
                for row in rows:
                    entry = ChangeLogEntry(
                        id=row['id'],
                        report_id=UUID(row['report_id']),
                        patch_id=row['patch_id'],
                        operation=row['operation'],
                        field_name=row['field_name'],
                        field_id=row['field_id'],
                        before_value=json.loads(row['before_value']) if row['before_value'] else None,
                        after_value=json.loads(row['after_value']) if row['after_value'] else None,
                        timestamp=datetime.fromisoformat(row['timestamp']),
                        user_id=row['user_id'],
                        description=row['description'],
                        success=bool(row['success']),
                        error_message=row['error_message']
                    )
                    entries.append(entry)
                
                return entries
                
        except Exception as e:
            logger.error("Failed to get change log", report_id=report_id, error=str(e))
            return []
    
    async def get_change_log_csv(self, report_id: str) -> str:
        """Get change log as CSV format."""
        try:
            entries = await self.get_change_log(report_id)
            
            # CSV header
            csv_lines = [
                "ID,Report ID,Patch ID,Operation,Field Name,Field ID,Before Value,After Value,Timestamp,User ID,Description,Success,Error Message"
            ]
            
            # CSV data
            for entry in entries:
                before_val = json.dumps(entry.before_value) if entry.before_value else ""
                after_val = json.dumps(entry.after_value) if entry.after_value else ""
                
                csv_lines.append(
                    f'"{entry.id}","{entry.report_id}","{entry.patch_id}","{entry.operation.value}",'
                    f'"{entry.field_name}","{entry.field_id}","{before_val}","{after_val}",'
                    f'"{entry.timestamp.isoformat()}","{entry.user_id or ""}","{entry.description or ""}",'
                    f'"{entry.success}","{entry.error_message or ""}"'
                )
            
            return "\n".join(csv_lines)
            
        except Exception as e:
            logger.error("Failed to generate change log CSV", report_id=report_id, error=str(e))
            raise