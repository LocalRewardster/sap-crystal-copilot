#!/usr/bin/env python3
"""
Quick test script to verify configuration and LLM service setup.
"""

import os
import sys
from pathlib import Path

# Add the backend directory to the path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def test_config():
    """Test configuration loading."""
    try:
        from app.core.config import get_settings
        settings = get_settings()
        
        print("✅ Configuration loaded successfully")
        print(f"   - DEBUG: {settings.DEBUG}")
        print(f"   - PRIMARY_MODEL: {settings.PRIMARY_MODEL}")
        print(f"   - OPENROUTER_API_KEY: {'***' + settings.OPENROUTER_API_KEY[-4:] if len(settings.OPENROUTER_API_KEY) > 4 else 'NOT SET'}")
        
        return settings
    except Exception as e:
        print(f"❌ Configuration failed: {e}")
        return None

def test_llm_service():
    """Test LLM service initialization."""
    try:
        from app.services.llm_service import LLMService
        
        llm = LLMService()
        print("✅ LLMService initialized successfully")
        print(f"   - Base URL: {llm.base_url}")
        print(f"   - Models: {llm.models}")
        print(f"   - API Key: {'***' + llm.openrouter_api_key[-4:] if len(llm.openrouter_api_key) > 4 else 'NOT SET'}")
        
        return llm
    except Exception as e:
        print(f"❌ LLMService failed: {e}")
        return None

if __name__ == "__main__":
    print("🧪 Testing Crystal Copilot Backend Configuration\n")
    
    # Check if .env file exists
    env_file = backend_dir / ".env"
    if env_file.exists():
        print("✅ .env file found")
    else:
        print("⚠️  .env file not found - using defaults and environment variables")
    
    print("\n1. Testing Configuration...")
    settings = test_config()
    
    print("\n2. Testing LLM Service...")
    llm = test_llm_service()
    
    if settings and llm:
        print("\n🎉 All tests passed! Backend should work correctly.")
    else:
        print("\n💥 Some tests failed. Check the errors above.")