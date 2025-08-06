"""
Chat endpoint for general AI assistance with Crystal Reports.
"""

import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.services.llm_service import LLMService
from app.services.storage import StorageService
from app.core.logging import get_logger, log_api_request

router = APIRouter()
logger = get_logger(__name__)


def get_storage_service() -> StorageService:
    """Dependency to get storage service."""
    return StorageService()


def get_llm_service() -> LLMService:
    """Dependency to get LLM service."""
    return LLMService()


class ChatMessage(BaseModel):
    """Chat message model."""
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: str


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    messages: List[ChatMessage]
    report_id: Optional[str] = None


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    response: str
    sources: Optional[List[str]] = None


@router.post("/", response_model=ChatResponse)
async def chat_with_ai(
    chat_request: ChatRequest,
    storage: StorageService = Depends(get_storage_service),
    llm_service: LLMService = Depends(get_llm_service)
):
    """
    General AI chat assistance for Crystal Reports.
    
    This endpoint provides conversational AI assistance for Crystal Reports users.
    It can answer questions about:
    - General Crystal Reports concepts
    - Best practices for report design
    - Troubleshooting common issues
    - Specific report analysis (when report_id is provided)
    
    - **messages**: Conversation history including user and assistant messages
    - **report_id**: Optional report ID for context-aware responses
    """
    start_time = time.time()
    
    try:
        # Get the latest user message
        if not chat_request.messages:
            raise HTTPException(status_code=400, detail="No messages provided")
        
        user_messages = [msg for msg in chat_request.messages if msg.role == 'user']
        if not user_messages:
            raise HTTPException(status_code=400, detail="No user messages found")
        
        latest_message = user_messages[-1].content
        
        logger.info("Processing chat request", 
                   message_count=len(chat_request.messages),
                   report_id=chat_request.report_id,
                   latest_message=latest_message[:100])
        
        # Get report context if report_id is provided
        metadata = None
        if chat_request.report_id:
            try:
                metadata = await storage.get_metadata(chat_request.report_id)
                if not metadata:
                    logger.warning("Report metadata not found", report_id=chat_request.report_id)
            except Exception as e:
                logger.warning("Failed to get report metadata", 
                              report_id=chat_request.report_id, error=str(e))
        
        # Process the chat request
        if metadata:
            # Use the report query service for context-aware responses
            response = await llm_service.query_report(
                query=latest_message,
                metadata=metadata,
                context={"conversation_history": [
                    {"role": msg.role, "content": msg.content} 
                    for msg in chat_request.messages[:-1]  # Exclude the latest message
                ]}
            )
            
            chat_response = ChatResponse(
                response=response.answer,
                sources=response.sources if hasattr(response, 'sources') else None
            )
        else:
            # Use general chat service for non-report-specific queries
            response = await llm_service.general_chat(
                message=latest_message,
                conversation_history=[
                    {"role": msg.role, "content": msg.content} 
                    for msg in chat_request.messages[:-1]
                ]
            )
            
            chat_response = ChatResponse(
                response=response,
                sources=None
            )
        
        duration_ms = (time.time() - start_time) * 1000
        
        log_api_request(
            method="POST",
            path="/chat",
            status_code=200,
            duration_ms=duration_ms,
            message=latest_message[:100],
            report_id=chat_request.report_id,
            response_length=len(chat_response.response)
        )
        
        logger.info("Chat request processed successfully",
                   duration_ms=duration_ms,
                   response_length=len(chat_response.response),
                   report_id=chat_request.report_id)
        
        return chat_response
        
    except HTTPException:
        raise
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        error_msg = str(e)
        
        log_api_request(
            method="POST",
            path="/chat",
            status_code=500,
            duration_ms=duration_ms,
            error=error_msg
        )
        
        logger.error("Chat request failed", 
                    error=error_msg, 
                    duration_ms=duration_ms,
                    report_id=chat_request.report_id)
        
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {error_msg}")