"""
LLM service for natural language queries and AI-powered report analysis.
Integrates with OpenRouter.ai for GPT-4o, Claude-Haiku, and Mistral Large.
"""

import json
import time
from typing import Dict, List, Optional, Any, Tuple
import httpx

from app.core.config import get_settings
from app.core.logging import get_logger, log_llm_request
from app.models.report import ReportMetadata, QueryResponse

logger = get_logger(__name__)
settings = get_settings()


class LLMService:
    """Service for AI-powered report analysis and natural language queries."""
    
    def __init__(self):
        self.openrouter_api_key = settings.OPENROUTER_API_KEY
        self.base_url = "https://openrouter.ai/api/v1"
        
        # Model configurations
        self.models = {
            "primary": settings.PRIMARY_MODEL,  # GPT-4o
            "fallback": settings.FALLBACK_MODEL,  # Claude-3-Haiku
            "large_context": settings.LARGE_CONTEXT_MODEL  # Mistral Large
        }
    
    async def query_report(
        self, 
        query: str, 
        metadata: ReportMetadata,
        context: Optional[Dict[str, Any]] = None
    ) -> QueryResponse:
        """
        Process a natural language query about a Crystal Report.
        
        Args:
            query: Natural language question
            metadata: Report metadata for context
            context: Additional context information
            
        Returns:
            QueryResponse with answer and field references
        """
        start_time = time.time()
        
        try:
            logger.info("Processing report query", query=query, report_id=str(metadata.id))
            
            # Prepare context for the LLM
            report_context = await self._prepare_report_context(metadata)
            
            # Try primary model first
            try:
                response = await self._query_model(
                    query=query,
                    report_context=report_context,
                    model=self.models["primary"],
                    context=context
                )
                
                duration_ms = (time.time() - start_time) * 1000
                
                log_llm_request(
                    model=self.models["primary"],
                    prompt_tokens=response.get("usage", {}).get("prompt_tokens", 0),
                    completion_tokens=response.get("usage", {}).get("completion_tokens", 0),
                    duration_ms=duration_ms,
                    success=True,
                    query=query
                )
                
                return await self._parse_response(query, response, self.models["primary"], duration_ms)
                
            except Exception as primary_error:
                logger.warning(
                    "Primary model failed, trying fallback",
                    primary_model=self.models["primary"],
                    error=str(primary_error)
                )
                
                # Try fallback model
                response = await self._query_model(
                    query=query,
                    report_context=report_context,
                    model=self.models["fallback"],
                    context=context
                )
                
                duration_ms = (time.time() - start_time) * 1000
                
                log_llm_request(
                    model=self.models["fallback"],
                    prompt_tokens=response.get("usage", {}).get("prompt_tokens", 0),
                    completion_tokens=response.get("usage", {}).get("completion_tokens", 0),
                    duration_ms=duration_ms,
                    success=True,
                    query=query,
                    fallback_reason=str(primary_error)
                )
                
                return await self._parse_response(query, response, self.models["fallback"], duration_ms)
                
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            
            log_llm_request(
                model="unknown",
                prompt_tokens=0,
                completion_tokens=0,
                duration_ms=duration_ms,
                success=False,
                error=str(e),
                query=query
            )
            
            logger.error("LLM query failed", query=query, error=str(e))
            raise
    
    async def _prepare_report_context(self, metadata: ReportMetadata) -> Dict[str, Any]:
        """Prepare report metadata as context for the LLM."""
        
        # Extract field information
        fields = []
        for section in metadata.sections:
            for field in section.fields:
                field_info = {
                    "id": field.id,
                    "name": field.name,
                    "display_name": field.display_name,
                    "type": field.field_type.value,
                    "section": section.section_type.value,
                    "section_name": section.name,
                    "visible": field.visible
                }
                
                # Add database field information if available
                if field.database_field:
                    field_info["database_table"] = field.database_field.table_name
                    field_info["database_field"] = field.database_field.field_name
                    field_info["data_type"] = field.database_field.data_type
                
                # Add formula if available
                if field.formula:
                    field_info["formula"] = field.formula
                
                fields.append(field_info)
        
        # Add parameters
        parameters = []
        for param in metadata.parameters:
            parameters.append({
                "name": param.name,
                "type": param.field_type.value
            })
        
        # Add formulas
        formulas = []
        for formula in metadata.formulas:
            formulas.append({
                "name": formula.name,
                "formula": formula.formula
            })
        
        # Database connections
        databases = []
        for db_conn in metadata.database_connections:
            databases.append({
                "driver": db_conn.driver,
                "server": db_conn.server,
                "database": db_conn.database
            })
        
        return {
            "report": {
                "title": metadata.title,
                "filename": metadata.filename,
                "author": metadata.author,
                "description": metadata.description
            },
            "sections": [
                {
                    "name": section.name,
                    "type": section.section_type.value,
                    "field_count": len(section.fields)
                }
                for section in metadata.sections
            ],
            "fields": fields,
            "parameters": parameters,
            "formulas": formulas,
            "databases": databases,
            "tables": metadata.tables
        }
    
    async def _query_model(
        self, 
        query: str, 
        report_context: Dict[str, Any],
        model: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Query a specific LLM model."""
        
        # Prepare system prompt
        system_prompt = self._get_system_prompt()
        
        # Prepare user message with context
        user_message = self._prepare_user_message(query, report_context, context)
        
        # Prepare request payload
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            "temperature": 0.1,  # Low temperature for consistent results
            "max_tokens": 1000,
            "functions": [self._get_function_schema()],
            "function_call": {"name": "analyze_report_query"}
        }
        
        # Make API request
        headers = {
            "Authorization": f"Bearer {self.openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://crystal-copilot.sap.com",
            "X-Title": "SAP Crystal Copilot"
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code != 200:
                error_detail = response.text
                raise RuntimeError(f"LLM API error ({response.status_code}): {error_detail}")
            
            return response.json()
    
    def _get_system_prompt(self) -> str:
        """Get the system prompt for Crystal Reports analysis."""
        return """You are an expert Crystal Reports analyst and SAP BusinessObjects specialist. 
Your role is to help users understand and analyze Crystal Reports by answering questions about:

1. Field lineage and data sources
2. Report structure and sections
3. Formulas and calculations
4. Database connections and tables
5. Field locations and properties

When answering queries:
- Be precise and specific about field locations
- Reference exact section names and field IDs when possible
- Explain database relationships and data flow
- Provide context about formulas and calculations
- Use technical Crystal Reports terminology accurately
- Always cite specific fields, sections, or database objects

Focus on helping users locate, understand, and trace report elements quickly and accurately."""
    
    def _prepare_user_message(
        self, 
        query: str, 
        report_context: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Prepare the user message with query and context."""
        
        message = f"""Please analyze this Crystal Report and answer the following question:

QUESTION: {query}

REPORT CONTEXT:
{json.dumps(report_context, indent=2)}
"""
        
        if context:
            message += f"\n\nADDITIONAL CONTEXT:\n{json.dumps(context, indent=2)}"
        
        return message
    
    def _get_function_schema(self) -> Dict[str, Any]:
        """Get the function schema for structured responses."""
        return {
            "name": "analyze_report_query",
            "description": "Analyze a Crystal Report query and provide structured response",
            "parameters": {
                "type": "object",
                "properties": {
                    "answer": {
                        "type": "string",
                        "description": "Detailed answer to the user's question"
                    },
                    "field_references": {
                        "type": "array",
                        "description": "List of fields referenced in the answer",
                        "items": {
                            "type": "object",
                            "properties": {
                                "field_id": {"type": "string"},
                                "field_name": {"type": "string"},
                                "section": {"type": "string"},
                                "database_source": {"type": "string"},
                                "relevance": {"type": "string"}
                            }
                        }
                    },
                    "confidence": {
                        "type": "number",
                        "description": "Confidence level (0.0 to 1.0)",
                        "minimum": 0.0,
                        "maximum": 1.0
                    },
                    "sources": {
                        "type": "array",
                        "description": "Data sources or sections referenced",
                        "items": {"type": "string"}
                    },
                    "follow_up_suggestions": {
                        "type": "array",
                        "description": "Suggested follow-up questions",
                        "items": {"type": "string"}
                    }
                },
                "required": ["answer", "confidence"]
            }
        }
    
    async def _parse_response(
        self, 
        query: str, 
        response: Dict[str, Any],
        model: str,
        duration_ms: float
    ) -> QueryResponse:
        """Parse LLM response into QueryResponse format."""
        
        try:
            # Extract function call result
            message = response["choices"][0]["message"]
            
            if "function_call" in message:
                function_result = json.loads(message["function_call"]["arguments"])
                
                return QueryResponse(
                    query=query,
                    answer=function_result.get("answer", "No answer provided"),
                    field_references=function_result.get("field_references", []),
                    confidence=function_result.get("confidence", 0.5),
                    sources=function_result.get("sources", []),
                    model_used=model,
                    tokens_used=response.get("usage", {}).get("total_tokens", 0),
                    processing_time_ms=duration_ms
                )
            else:
                # Fallback to regular content
                content = message.get("content", "No response provided")
                
                return QueryResponse(
                    query=query,
                    answer=content,
                    field_references=[],
                    confidence=0.7,
                    sources=[],
                    model_used=model,
                    tokens_used=response.get("usage", {}).get("total_tokens", 0),
                    processing_time_ms=duration_ms
                )
                
        except Exception as e:
            logger.error("Failed to parse LLM response", error=str(e))
            
            # Return basic response
            return QueryResponse(
                query=query,
                answer=f"Error processing response: {str(e)}",
                field_references=[],
                confidence=0.0,
                sources=[],
                model_used=model,
                tokens_used=0,
                processing_time_ms=duration_ms
            )