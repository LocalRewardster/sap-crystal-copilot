#!/usr/bin/env python3
"""
Direct OpenRouter API test script.
"""

import os
import sys
import asyncio
import httpx
from pathlib import Path

# Add the backend directory to the path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

async def test_openrouter_direct():
    """Test OpenRouter API directly."""
    print("🧪 DIRECT OPENROUTER API TEST\n")
    
    # Load environment
    from dotenv import load_dotenv
    load_dotenv(".env")
    
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("❌ No OPENROUTER_API_KEY found in environment")
        return
    
    print(f"✅ API Key found: ***{api_key[-4:] if len(api_key) > 4 else 'TOO_SHORT'}")
    print(f"   Key length: {len(api_key)}")
    print(f"   Starts with sk-or-v1-: {api_key.startswith('sk-or-v1-')}")
    
    # Test API call
    base_url = "https://openrouter.ai/api/v1"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://crystal-copilot.sap.com",
        "X-Title": "SAP Crystal Copilot"
    }
    
    payload = {
        "model": "openai/gpt-4o-mini",  # Use a cheaper model for testing
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Say hello in one sentence."}
        ],
        "max_tokens": 50
    }
    
    print(f"\n🌐 Testing API call to: {base_url}/chat/completions")
    print(f"   Model: {payload['model']}")
    print(f"   Headers: {dict(headers)}")  # This will mask the auth header
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{base_url}/chat/completions",
                headers=headers,
                json=payload
            )
            
            print(f"\n📡 Response Status: {response.status_code}")
            print(f"   Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ API call successful!")
                if 'choices' in result and len(result['choices']) > 0:
                    message = result['choices'][0]['message']['content']
                    print(f"   AI Response: {message}")
                else:
                    print(f"   Full Response: {result}")
            else:
                print(f"❌ API call failed: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Raw Response: {response.text}")
                    
    except Exception as e:
        print(f"❌ Request failed with exception: {e}")
        import traceback
        traceback.print_exc()

async def test_models_list():
    """Test getting available models from OpenRouter."""
    print("\n📋 TESTING MODELS LIST\n")
    
    from dotenv import load_dotenv
    load_dotenv(".env")
    
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("❌ No API key available")
        return
    
    base_url = "https://openrouter.ai/api/v1"
    headers = {
        "Authorization": f"Bearer {api_key}",
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{base_url}/models",
                headers=headers
            )
            
            print(f"Models endpoint status: {response.status_code}")
            
            if response.status_code == 200:
                models_data = response.json()
                print("✅ Models list retrieved successfully!")
                if 'data' in models_data:
                    available_models = [model['id'] for model in models_data['data'][:10]]  # First 10
                    print(f"   First 10 models: {available_models}")
                    
                    # Check if our target models are available
                    target_models = ["openai/gpt-4o", "openai/gpt-4o-mini", "anthropic/claude-3-haiku"]
                    for model in target_models:
                        available = any(m['id'] == model for m in models_data['data'])
                        print(f"   {model}: {'✅ Available' if available else '❌ Not available'}")
            else:
                print(f"❌ Models list failed: {response.status_code}")
                print(f"   Response: {response.text}")
                
    except Exception as e:
        print(f"❌ Models request failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_openrouter_direct())
    asyncio.run(test_models_list())