#!/usr/bin/env python3
"""
Detailed environment debugging script for Crystal Copilot.
"""

import os
import sys
from pathlib import Path

# Add the backend directory to the path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def debug_environment():
    """Debug environment variable loading."""
    print("🔍 ENVIRONMENT DEBUGGING\n")
    
    # Check current working directory
    print(f"Current working directory: {os.getcwd()}")
    
    # Check if .env file exists
    env_file = Path(".env")
    env_file_abs = env_file.resolve()
    print(f".env file path: {env_file_abs}")
    print(f".env file exists: {env_file.exists()}")
    
    if env_file.exists():
        print(f".env file size: {env_file.stat().st_size} bytes")
        # Read first few lines (safely)
        try:
            with open(env_file, 'r') as f:
                lines = f.readlines()[:10]  # First 10 lines
            print("First few lines of .env:")
            for i, line in enumerate(lines, 1):
                # Hide API key values for security
                if "API_KEY" in line and "=" in line:
                    key, value = line.split("=", 1)
                    masked_value = "***" + value.strip()[-4:] if len(value.strip()) > 4 else "NOT_SET"
                    print(f"  {i}: {key}={masked_value}")
                else:
                    print(f"  {i}: {line.strip()}")
        except Exception as e:
            print(f"Error reading .env file: {e}")
    
    # Check environment variables directly
    print(f"\nDirect OS environment check:")
    openrouter_key = os.getenv("OPENROUTER_API_KEY", "NOT_SET")
    if openrouter_key != "NOT_SET":
        print(f"OPENROUTER_API_KEY: ***{openrouter_key[-4:] if len(openrouter_key) > 4 else 'TOO_SHORT'}")
    else:
        print("OPENROUTER_API_KEY: NOT_SET")
    
    secret_key = os.getenv("SECRET_KEY", "NOT_SET")
    if secret_key != "NOT_SET":
        print(f"SECRET_KEY: ***{secret_key[-4:] if len(secret_key) > 4 else 'TOO_SHORT'}")
    else:
        print("SECRET_KEY: NOT_SET")
    
    print(f"DEBUG: {os.getenv('DEBUG', 'NOT_SET')}")

def debug_pydantic_settings():
    """Debug Pydantic settings loading."""
    print("\n🔧 PYDANTIC SETTINGS DEBUG\n")
    
    try:
        # Try to load python-dotenv manually first
        from dotenv import load_dotenv
        
        # Load .env file manually
        env_loaded = load_dotenv(".env", verbose=True)
        print(f"Manual dotenv load result: {env_loaded}")
        
        # Check if the key is now available
        openrouter_key = os.getenv("OPENROUTER_API_KEY", "NOT_SET")
        print(f"After manual load - OPENROUTER_API_KEY: {'***' + openrouter_key[-4:] if len(openrouter_key) > 4 and openrouter_key != 'NOT_SET' else 'NOT_SET'}")
        
    except ImportError:
        print("python-dotenv not available")
    except Exception as e:
        print(f"Error with manual dotenv load: {e}")
    
    try:
        from app.core.config import get_settings
        settings = get_settings()
        
        print("✅ Pydantic Settings loaded successfully")
        
        # Check the actual values
        api_key = settings.OPENROUTER_API_KEY
        if api_key and len(api_key) > 4:
            print(f"Settings OPENROUTER_API_KEY: ***{api_key[-4:]}")
            print(f"Key length: {len(api_key)}")
            print(f"Key starts with: {api_key[:10]}...")
        else:
            print(f"Settings OPENROUTER_API_KEY: {api_key}")
        
        print(f"Settings PRIMARY_MODEL: {settings.PRIMARY_MODEL}")
        print(f"Settings DEBUG: {settings.DEBUG}")
        
        return settings
        
    except Exception as e:
        print(f"❌ Pydantic Settings failed: {e}")
        import traceback
        traceback.print_exc()
        return None

def debug_llm_service():
    """Debug LLM service with detailed info."""
    print("\n🤖 LLM SERVICE DEBUG\n")
    
    try:
        from app.services.llm_service import LLMService
        
        llm = LLMService()
        print("✅ LLMService initialized")
        
        api_key = llm.openrouter_api_key
        if api_key and len(api_key) > 4:
            print(f"LLM Service API Key: ***{api_key[-4:]}")
            print(f"Key length: {len(api_key)}")
            print(f"Key format check: starts with 'sk-or-v1-': {api_key.startswith('sk-or-v1-')}")
        else:
            print(f"LLM Service API Key: {api_key}")
        
        print(f"Base URL: {llm.base_url}")
        print(f"Models: {llm.models}")
        
        return llm
        
    except Exception as e:
        print(f"❌ LLMService failed: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    debug_environment()
    settings = debug_pydantic_settings()
    llm = debug_llm_service()
    
    print("\n" + "="*50)
    if settings and llm:
        print("🎉 Configuration appears to be working!")
        print("The issue might be in the HTTP request to OpenRouter.")
    else:
        print("💥 Configuration has issues that need to be resolved.")