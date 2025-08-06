"""
Configuration management for Crystal Copilot API.
Uses Pydantic Settings for environment-based configuration.
"""

from functools import lru_cache
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Application
    VERSION: str = "1.0.0"
    DEBUG: bool = Field(default=False, env="DEBUG")
    SECRET_KEY: str = Field(env="SECRET_KEY", min_length=32)
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:3001"],
        env="ALLOWED_ORIGINS"
    )
    ALLOWED_HOSTS: List[str] = Field(
        default=["localhost", "127.0.0.1", "*"],
        env="ALLOWED_HOSTS"
    )
    
    # File Upload
    MAX_FILE_SIZE: int = Field(default=25 * 1024 * 1024, env="MAX_FILE_SIZE")  # 25MB
    UPLOAD_DIR: str = Field(default="./uploads", env="UPLOAD_DIR")
    ALLOWED_EXTENSIONS: List[str] = Field(default=[".rpt"], env="ALLOWED_EXTENSIONS")
    
    # AI/LLM Configuration
    OPENROUTER_API_KEY: str = Field(env="OPENROUTER_API_KEY")
    OPENAI_API_KEY: str = Field(default="", env="OPENAI_API_KEY")
    ANTHROPIC_API_KEY: str = Field(default="", env="ANTHROPIC_API_KEY")
    
    # LLM Models
    PRIMARY_MODEL: str = Field(default="openai/gpt-4o", env="PRIMARY_MODEL")
    FALLBACK_MODEL: str = Field(default="anthropic/claude-3-haiku", env="FALLBACK_MODEL")
    LARGE_CONTEXT_MODEL: str = Field(default="mistral/mistral-large", env="LARGE_CONTEXT_MODEL")
    
    # Database
    DATABASE_URL: str = Field(env="DATABASE_URL", default="sqlite:///./crystal_copilot.db")
    
    # Redis Cache
    REDIS_URL: str = Field(env="REDIS_URL", default="redis://localhost:6379/0")
    
    # Crystal Reports Processing
    RPTTOXML_PATH: str = Field(env="RPTTOXML_PATH", default="./bin/RptToXml.exe")
    CRYSTAL_SDK_PATH: str = Field(env="CRYSTAL_SDK_PATH", default="C:/Program Files/SAP BusinessObjects/Crystal Reports for .NET Framework 4.0/Common/SAP BusinessObjects Enterprise XI 4.0/win64_x64/")
    CRYSTAL_SERVICE_URL: str = Field(env="CRYSTAL_SERVICE_URL", default="http://localhost:5001")
    
    # Security
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7, env="REFRESH_TOKEN_EXPIRE_DAYS")
    
    # Monitoring
    ENABLE_METRICS: bool = Field(default=True, env="ENABLE_METRICS")
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()