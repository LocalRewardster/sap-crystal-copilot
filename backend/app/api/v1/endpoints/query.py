"""
Natural language query endpoints for Crystal Reports analysis.
Provides AI-powered Q&A functionality for report lineage and understanding.
"""

import time
from typing import Optional, Dict, Any

from fastapi import APIRouter, HTTPException, Depends

from app.core.logging import get_logger, log_api_request
from app.models.report import QueryRequest, QueryResponse
from app.services.storage import StorageService
from app.services.llm_service import LLMService

router = APIRouter()
logger = get_logger(__name__)


def get_storage_service() -> StorageService:
    """Dependency to get storage service."""
    return StorageService()


def get_llm_service() -> LLMService:
    """Dependency to get LLM service."""
    return LLMService()


@router.post("/{report_id}", response_model=QueryResponse)
async def query_report(
    report_id: str,
    query_request: QueryRequest,
    storage: StorageService = Depends(get_storage_service),
    llm_service: LLMService = Depends(get_llm_service)
):
    """
    Ask a natural language question about a Crystal Report.
    
    Examples of questions you can ask:
    - "Where does Gross Profit come from?"
    - "What database tables are used in this report?"
    - "Show me all fields in the Details section"
    - "Which fields use formulas?"
    - "Where is the customer name displayed?"
    
    - **report_id**: The UUID of the report to query
    - **query**: Natural language question about the report
    - **context**: Optional additional context for the query
    """
    start_time = time.time()
    
    try:
        logger.info("Processing report query", report_id=report_id, query=query_request.query)
        
        # Get report metadata
        metadata = await storage.get_metadata(report_id)
        if not metadata:
            # Check if report exists but hasn't been processed
            report_info = await storage.get_report_status(report_id)
            if not report_info:
                raise HTTPException(status_code=404, detail="Report not found")
            
            if report_info['status'] == 'parsing':
                raise HTTPException(
                    status_code=202,
                    detail="Report is still being processed. Please try again later."
                )
            elif report_info['status'] == 'error':
                raise HTTPException(
                    status_code=422,
                    detail=f"Report processing failed: {report_info.get('error_message', 'Unknown error')}"
                )
            else:
                raise HTTPException(status_code=404, detail="Report metadata not available")
        
        # Process the query using LLM
        response = await llm_service.query_report(
            query=query_request.query,
            metadata=metadata,
            context=query_request.context
        )
        
        duration_ms = (time.time() - start_time) * 1000
        
        log_api_request(
            method="POST",
            path=f"/query/{report_id}",
            status_code=200,
            duration_ms=duration_ms,
            query=query_request.query,
            model_used=response.model_used,
            tokens_used=response.tokens_used,
            confidence=response.confidence
        )
        
        logger.info(
            "Query processed successfully",
            report_id=report_id,
            query=query_request.query,
            confidence=response.confidence,
            model_used=response.model_used,
            duration_ms=duration_ms
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        
        log_api_request(
            method="POST",
            path=f"/query/{report_id}",
            status_code=500,
            duration_ms=duration_ms,
            error=str(e)
        )
        
        logger.error("Query processing failed", report_id=report_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Query processing failed: {str(e)}")


@router.get("/{report_id}/suggestions")
async def get_query_suggestions(
    report_id: str,
    storage: StorageService = Depends(get_storage_service)
):
    """
    Get suggested questions for a report based on its structure.
    
    - **report_id**: The UUID of the report
    """
    try:
        # Get report metadata to generate contextual suggestions
        metadata = await storage.get_metadata(report_id)
        if not metadata:
            raise HTTPException(status_code=404, detail="Report not found or not processed")
        
        # Generate suggestions based on report structure
        suggestions = await _generate_query_suggestions(metadata)
        
        return {
            "report_id": report_id,
            "suggestions": suggestions
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to generate query suggestions", report_id=report_id, error=str(e))
        raise HTTPException(status_code=500, detail="Failed to generate suggestions")


async def _generate_query_suggestions(metadata) -> list:
    """Generate contextual query suggestions based on report metadata."""
    
    suggestions = []
    
    # Basic structure questions
    suggestions.extend([
        "What sections does this report have?",
        "How many fields are in this report?",
        "What database tables are used?"
    ])
    
    # Field-specific questions
    field_names = []
    formula_fields = []
    currency_fields = []
    
    for section in metadata.sections:
        for field in section.fields:
            if field.name not in field_names:
                field_names.append(field.name)
            
            if field.field_type.value == 'formula' and field.name not in formula_fields:
                formula_fields.append(field.name)
            
            if field.field_type.value == 'currency' and field.name not in currency_fields:
                currency_fields.append(field.name)
    
    # Add field-specific suggestions
    if field_names:
        # Pick a few interesting field names
        sample_fields = field_names[:3]
        for field_name in sample_fields:
            suggestions.append(f"Where does {field_name} come from?")
            suggestions.append(f"Show me details about the {field_name} field")
    
    if formula_fields:
        suggestions.append("Which fields use formulas?")
        if formula_fields[0]:
            suggestions.append(f"What is the formula for {formula_fields[0]}?")
    
    if currency_fields:
        suggestions.append("Show me all currency fields")
        if currency_fields[0]:
            suggestions.append(f"How is {currency_fields[0]} calculated?")
    
    # Database-specific questions
    if metadata.database_connections:
        suggestions.append("What database connections are configured?")
    
    if metadata.tables:
        suggestions.append("What tables are used in this report?")
        if len(metadata.tables) > 1:
            suggestions.append("How are the tables related?")
    
    # Parameter questions
    if metadata.parameters:
        suggestions.append("What parameters does this report have?")
        param_names = [p.name for p in metadata.parameters[:2]]
        for param_name in param_names:
            suggestions.append(f"How is the {param_name} parameter used?")
    
    # Section-specific questions
    section_types = list(set([s.section_type.value for s in metadata.sections]))
    if 'details' in section_types:
        suggestions.append("What fields are in the Details section?")
    if 'report_header' in section_types:
        suggestions.append("What's displayed in the report header?")
    if 'report_footer' in section_types:
        suggestions.append("What totals are shown in the footer?")
    
    # Remove duplicates and limit
    suggestions = list(dict.fromkeys(suggestions))  # Remove duplicates while preserving order
    
    return suggestions[:15]  # Limit to 15 suggestions


@router.post("/{report_id}/explain-field")
async def explain_field(
    report_id: str,
    field_id: str,
    storage: StorageService = Depends(get_storage_service),
    llm_service: LLMService = Depends(get_llm_service)
):
    """
    Get detailed explanation of a specific field.
    
    - **report_id**: The UUID of the report
    - **field_id**: The ID of the field to explain
    """
    try:
        # Get report metadata
        metadata = await storage.get_metadata(report_id)
        if not metadata:
            raise HTTPException(status_code=404, detail="Report not found or not processed")
        
        # Find the specific field
        target_field = None
        target_section = None
        
        for section in metadata.sections:
            for field in section.fields:
                if field.id == field_id:
                    target_field = field
                    target_section = section
                    break
            if target_field:
                break
        
        # Check parameters and formulas too
        if not target_field:
            for param in metadata.parameters:
                if param.id == field_id:
                    target_field = param
                    break
        
        if not target_field:
            for formula in metadata.formulas:
                if formula.id == field_id:
                    target_field = formula
                    break
        
        if not target_field:
            raise HTTPException(status_code=404, detail="Field not found")
        
        # Create specific query about this field
        query = f"Explain the {target_field.name} field in detail. Include its data source, location, format, and purpose."
        
        # Add field-specific context
        field_context = {
            "target_field": {
                "id": target_field.id,
                "name": target_field.name,
                "type": target_field.field_type.value,
                "section": target_section.name if target_section else "N/A",
                "formula": target_field.formula,
                "database_field": target_field.database_field.model_dump() if target_field.database_field else None
            }
        }
        
        # Process query
        response = await llm_service.query_report(
            query=query,
            metadata=metadata,
            context=field_context
        )
        
        return {
            "field_id": field_id,
            "field_name": target_field.name,
            "explanation": response
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to explain field", report_id=report_id, field_id=field_id, error=str(e))
        raise HTTPException(status_code=500, detail="Failed to explain field")