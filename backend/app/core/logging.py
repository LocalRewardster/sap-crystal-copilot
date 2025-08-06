"""
Structured logging configuration for Crystal Copilot API.
Uses structlog for consistent, structured logging across the application.
"""

import logging
import sys
from typing import Any, Dict

import structlog
from structlog.stdlib import LoggerFactory

from app.core.config import get_settings


def setup_logging() -> None:
    """Configure structured logging for the application."""
    settings = get_settings()
    
    # Configure standard library logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, settings.LOG_LEVEL.upper()),
    )
    
    # Configure structlog
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.StackInfoRenderer(),
            structlog.dev.set_exc_info if settings.DEBUG else structlog.processors.format_exc_info,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.dev.ConsoleRenderer() if settings.DEBUG else structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            getattr(logging, settings.LOG_LEVEL.upper())
        ),
        logger_factory=LoggerFactory(),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str = __name__) -> structlog.BoundLogger:
    """Get a configured logger instance."""
    return structlog.get_logger(name)


def log_api_request(
    method: str,
    path: str,
    status_code: int,
    duration_ms: float,
    user_id: str = None,
    **kwargs: Any
) -> None:
    """Log API request with structured data."""
    logger = get_logger("api.request")
    
    log_data: Dict[str, Any] = {
        "method": method,
        "path": path,
        "status_code": status_code,
        "duration_ms": round(duration_ms, 2),
        **kwargs
    }
    
    if user_id:
        log_data["user_id"] = user_id
    
    if status_code >= 400:
        logger.warning("API request failed", **log_data)
    else:
        logger.info("API request completed", **log_data)


def log_llm_request(
    model: str,
    prompt_tokens: int,
    completion_tokens: int,
    duration_ms: float,
    success: bool = True,
    error: str = None,
    **kwargs: Any
) -> None:
    """Log LLM request with usage metrics."""
    logger = get_logger("llm.request")
    
    log_data: Dict[str, Any] = {
        "model": model,
        "prompt_tokens": prompt_tokens,
        "completion_tokens": completion_tokens,
        "total_tokens": prompt_tokens + completion_tokens,
        "duration_ms": round(duration_ms, 2),
        "success": success,
        **kwargs
    }
    
    if error:
        log_data["error"] = error
        logger.error("LLM request failed", **log_data)
    else:
        logger.info("LLM request completed", **log_data)


def log_file_processing(
    filename: str,
    file_size: int,
    operation: str,
    duration_ms: float,
    success: bool = True,
    error: str = None,
    **kwargs: Any
) -> None:
    """Log file processing operations."""
    logger = get_logger("file.processing")
    
    log_data: Dict[str, Any] = {
        "filename": filename,
        "file_size_bytes": file_size,
        "operation": operation,
        "duration_ms": round(duration_ms, 2),
        "success": success,
        **kwargs
    }
    
    if error:
        log_data["error"] = error
        logger.error("File processing failed", **log_data)
    else:
        logger.info("File processing completed", **log_data)