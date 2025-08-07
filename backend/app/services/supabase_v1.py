"""
Supabase service compatible with Pydantic v1 for Windows.
Handles database operations using Supabase PostgreSQL.
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
import json

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Supabase not available - {e}")
    SUPABASE_AVAILABLE = False
    Client = None

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)
settings = get_settings()


class SupabaseV1Service:
    """Service for Supabase database operations - Pydantic v1 compatible."""
    
    def __init__(self):
        if not SUPABASE_AVAILABLE:
            logger.warning("Supabase library not installed - falling back to SQLite")
            self.client = None
            return
            
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
            logger.warning("Supabase configuration missing - falling back to SQLite")
            self.client = None
            return
            
        try:
            self.client: Client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_KEY
            )
            logger.info("Supabase client initialized (v1 compatible)")
        except Exception as e:
            logger.error("Failed to initialize Supabase client", error=str(e))
            self.client = None
    
    def is_available(self) -> bool:
        """Check if Supabase is configured and available."""
        return self.client is not None
    
    async def create_report_record(
        self, 
        report_id: str, 
        filename: str, 
        file_size: int, 
        file_path: str
    ) -> None:
        """Create initial report record."""
        if not self.client:
            raise RuntimeError("Supabase not configured")
            
        try:
            data = {
                "id": report_id,
                "filename": filename,
                "file_path": file_path,
                "file_size": file_size,
                "status": "uploading",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            result = self.client.table("reports").insert(data).execute()
            
            if result.data:
                logger.info("Report record created in Supabase", report_id=report_id, filename=filename)
            else:
                raise RuntimeError(f"Failed to create report record: {result}")
                
        except Exception as e:
            logger.error("Failed to create report record in Supabase", report_id=report_id, error=str(e))
            raise
    
    async def store_metadata(self, report_id: str, metadata: Dict[str, Any]) -> None:
        """Store parsed report metadata."""
        if not self.client:
            raise RuntimeError("Supabase not configured")
            
        try:
            # Convert metadata to JSON
            metadata_json = json.dumps(metadata) if not isinstance(metadata, str) else metadata
            
            data = {
                "metadata_json": metadata_json,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            result = self.client.table("reports").update(data).eq("id", report_id).execute()
            
            if result.data:
                logger.info("Metadata stored in Supabase", report_id=report_id)
            else:
                raise RuntimeError(f"Failed to store metadata: {result}")
                
        except Exception as e:
            logger.error("Failed to store metadata in Supabase", report_id=report_id, error=str(e))
            raise
    
    async def get_metadata(self, report_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve report metadata."""
        if not self.client:
            raise RuntimeError("Supabase not configured")
            
        try:
            result = self.client.table("reports").select("metadata_json").eq("id", report_id).execute()
            
            if result.data and len(result.data) > 0:
                metadata_json = result.data[0].get("metadata_json")
                if metadata_json:
                    return json.loads(metadata_json) if isinstance(metadata_json, str) else metadata_json
            
            return None
            
        except Exception as e:
            logger.error("Failed to get metadata from Supabase", report_id=report_id, error=str(e))
            return None
    
    async def update_report_status(
        self, 
        report_id: str, 
        status: str, 
        error_message: Optional[str] = None
    ) -> None:
        """Update report processing status."""
        if not self.client:
            raise RuntimeError("Supabase not configured")
            
        try:
            data = {
                "status": status,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            if error_message:
                data["error_message"] = error_message
            
            result = self.client.table("reports").update(data).eq("id", report_id).execute()
            
            if result.data:
                logger.info("Report status updated in Supabase", report_id=report_id, status=status)
            else:
                raise RuntimeError(f"Failed to update report status: {result}")
                
        except Exception as e:
            logger.error("Failed to update report status in Supabase", report_id=report_id, error=str(e))
            raise
    
    async def get_report_status(self, report_id: str) -> Optional[Dict[str, Any]]:
        """Get current report status and basic info."""
        if not self.client:
            raise RuntimeError("Supabase not configured")
            
        try:
            result = self.client.table("reports").select(
                "id, filename, file_path, file_size, status, error_message, created_at, updated_at"
            ).eq("id", report_id).execute()
            
            if result.data and len(result.data) > 0:
                row = result.data[0]
                return {
                    "report_id": row["id"],
                    "filename": row["filename"],
                    "file_path": row["file_path"],
                    "file_size": row["file_size"],
                    "status": row["status"],
                    "error_message": row.get("error_message"),
                    "created_at": row["created_at"],
                    "updated_at": row["updated_at"]
                }
            
            return None
            
        except Exception as e:
            logger.error("Failed to get report status from Supabase", report_id=report_id, error=str(e))
            return None
    
    async def list_reports(self, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """List all reports with pagination."""
        if not self.client:
            raise RuntimeError("Supabase not configured")
            
        try:
            result = self.client.table("reports").select(
                "id, filename, file_size, status, created_at, updated_at"
            ).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
            
            return result.data or []
            
        except Exception as e:
            logger.error("Failed to list reports from Supabase", error=str(e))
            return []
    
    async def delete_report(self, report_id: str) -> bool:
        """Delete report and all associated data."""
        if not self.client:
            raise RuntimeError("Supabase not configured")
            
        try:
            # Delete change log entries first
            self.client.table("change_log").delete().eq("report_id", report_id).execute()
            
            # Delete report
            result = self.client.table("reports").delete().eq("id", report_id).execute()
            
            if result.data:
                logger.info("Report deleted from Supabase", report_id=report_id)
                return True
            else:
                logger.warning("Report not found in Supabase", report_id=report_id)
                return False
                
        except Exception as e:
            logger.error("Failed to delete report from Supabase", report_id=report_id, error=str(e))
            return False


# Singleton instance
_supabase_v1_service = None

def get_supabase_v1_service() -> SupabaseV1Service:
    """Get the Supabase v1 service singleton."""
    global _supabase_v1_service
    if _supabase_v1_service is None:
        _supabase_v1_service = SupabaseV1Service()
    return _supabase_v1_service