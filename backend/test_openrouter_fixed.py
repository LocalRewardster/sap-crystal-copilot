#!/usr/bin/env python3
"""
Fixed OpenRouter API test with exact format matching their documentation.
"""

import os
import sys
import asyncio
import httpx
import json
from pathlib import Path

# Add the backend directory to the path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

async def test_openrouter_exact_format():
    """Test OpenRouter with their exact documented format."""
    print("🔧 TESTING WITH EXACT OPENROUTER FORMAT\n")
    
    # Load environment
    from dotenv import load_dotenv
    load_dotenv(".env")
    
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("❌ No OPENROUTER_API_KEY found")
        return
    
    print(f"✅ Using API Key: ***{api_key[-4:]}")
    
    # Use OpenRouter's exact documented format
    url = "https://openrouter.ai/api/v1/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "https://crystal-copilot.sap.com",
        "X-Title": "SAP Crystal Copilot",
        "Content-Type": "application/json"
    }
    
    # Minimal payload exactly as in OpenRouter docs
    data = {
        "model": "openai/gpt-4o-mini",
        "messages": [
            {
                "role": "user",
                "content": "Say hello"
            }
        ]
    }
    
    print(f"🌐 Making request to: {url}")
    print(f"📦 Payload: {json.dumps(data, indent=2)}")
    print(f"📋 Headers (auth masked): {dict(headers)}")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                url,
                headers=headers,
                json=data
            )
            
            print(f"\n📡 Response Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ SUCCESS! API call worked!")
                
                if 'choices' in result and result['choices']:
                    content = result['choices'][0]['message']['content']
                    print(f"🤖 AI Response: {content}")
                
                if 'usage' in result:
                    usage = result['usage']
                    print(f"💰 Token Usage: {usage}")
                    
            else:
                print(f"❌ FAILED: Status {response.status_code}")
                try:
                    error_json = response.json()
                    print(f"📄 Error Response: {json.dumps(error_json, indent=2)}")
                except:
                    print(f"📄 Raw Response: {response.text}")
                    
    except Exception as e:
        print(f"💥 Exception occurred: {e}")
        import traceback
        traceback.print_exc()

async def test_with_different_models():
    """Test with different models to see if it's model-specific."""
    print("\n🔄 TESTING DIFFERENT MODELS\n")
    
    from dotenv import load_dotenv
    load_dotenv(".env")
    
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        return
    
    # Test different models
    models_to_test = [
        "openai/gpt-4o-mini",
        "anthropic/claude-3-haiku",
        "meta-llama/llama-3.2-3b-instruct:free"  # Free model
    ]
    
    for model in models_to_test:
        print(f"Testing model: {model}")
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "HTTP-Referer": "https://crystal-copilot.sap.com", 
            "X-Title": "SAP Crystal Copilot",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": model,
            "messages": [{"role": "user", "content": "Hi"}],
            "max_tokens": 10
        }
        
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json=data
                )
                
                if response.status_code == 200:
                    print(f"  ✅ {model}: SUCCESS")
                    result = response.json()
                    if 'choices' in result and result['choices']:
                        content = result['choices'][0]['message']['content']
                        print(f"     Response: {content}")
                else:
                    print(f"  ❌ {model}: Status {response.status_code}")
                    try:
                        error = response.json()
                        print(f"     Error: {error.get('error', {}).get('message', 'Unknown')}")
                    except:
                        pass
                        
        except Exception as e:
            print(f"  💥 {model}: Exception - {e}")

if __name__ == "__main__":
    asyncio.run(test_openrouter_exact_format())
    asyncio.run(test_with_different_models())