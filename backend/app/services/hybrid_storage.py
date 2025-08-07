"""
Hybrid storage service that supports both SQLite and Supabase.
Automatically chooses the best available option.
"""

from typing import Dict, List, Optional, Any
from app.core.config import get_settings
from app.core.logging import get_logger
from app.models.report import ReportMetadata, ReportStatus, ChangeLogEntry

logger = get_logger(__name__)
settings = get_settings()


class HybridStorageService:
    """Storage service that automatically chooses between SQLite and Supabase."""
    
    def __init__(self):
        self.supabase_service = None
        self.sqlite_service = None
        
        # Try to initialize Supabase first
        if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_KEY:
            try:
                from app.services.supabase_service import get_supabase_service
                self.supabase_service = get_supabase_service()
                if self.supabase_service.is_available():
                    logger.info("Using Supabase as primary storage")
                    return
            except Exception as e:
                logger.warning("Failed to initialize Supabase, falling back to SQLite", error=str(e))
        
        # Fall back to SQLite
        try:
            from app.services.storage import StorageService
            self.sqlite_service = StorageService()
            logger.info("Using SQLite as primary storage")
        except Exception as e:
            logger.error("Failed to initialize SQLite storage service", error=str(e))
            # If we can't initialize either service, we need to handle this gracefully
            if not self.supabase_service:
                logger.error("No storage service available - both Supabase and SQLite failed")
                raise RuntimeError("No storage service available")
            else:
                logger.warning("SQLite unavailable but Supabase is working")
    
    @property
    def active_service(self):
        """Get the active storage service."""
        return self.supabase_service if self.supabase_service and self.supabase_service.is_available() else self.sqlite_service
    
    @property
    def is_supabase(self) -> bool:
        """Check if we're using Supabase."""
        return self.supabase_service is not None and self.supabase_service.is_available()
    
    async def create_report_record(
        self, 
        report_id: str, 
        filename: str, 
        file_size: int, 
        file_path: str
    ) -> None:
        """Create initial report record."""
        return await self.active_service.create_report_record(report_id, filename, file_size, file_path)
    
    async def store_metadata(self, report_id: str, metadata: ReportMetadata) -> None:
        """Store parsed report metadata."""
        return await self.active_service.store_metadata(report_id, metadata)
    
    async def get_metadata(self, report_id: str) -> Optional[ReportMetadata]:
        """Retrieve report metadata."""
        return await self.active_service.get_metadata(report_id)
    
    async def update_report_status(
        self, 
        report_id: str, 
        status: ReportStatus, 
        error_message: Optional[str] = None
    ) -> None:
        """Update report processing status."""
        return await self.active_service.update_report_status(report_id, status, error_message)
    
    async def get_report_status(self, report_id: str) -> Optional[Dict[str, Any]]:
        """Get current report status and basic info."""
        return await self.active_service.get_report_status(report_id)
    
    async def list_reports(self, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """List all reports with pagination."""
        return await self.active_service.list_reports(limit, offset)
    
    async def log_change(self, entry: ChangeLogEntry) -> None:
        """Log a change to the audit trail."""
        return await self.active_service.log_change(entry)
    
    async def get_change_log(self, report_id: str, limit: int = 100) -> List[ChangeLogEntry]:
        """Get change log for a report."""
        return await self.active_service.get_change_log(report_id, limit)
    
    async def delete_report(self, report_id: str) -> bool:
        """Delete report and all associated data."""
        return await self.active_service.delete_report(report_id)


# Singleton instance
_hybrid_storage_service = None

def get_hybrid_storage_service() -> HybridStorageService:
    """Get the hybrid storage service singleton."""
    global _hybrid_storage_service
    if _hybrid_storage_service is None:
        _hybrid_storage_service = HybridStorageService()
    return _hybrid_storage_service