#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Test Gemini API call"""
import gemini_service

print("=" * 60)
print("TESTING GEMINI API CALL - v2026-04-22")
print("=" * 60)

# Test: Call Gemini API with simple prompt
test_prompt = "Xin chào. Bạn là AI gì?"

print(f"\n📝 Prompt: {test_prompt}")
print(f"⏳ Calling Gemini API...")

try:
    success, response = gemini_service.call_gemini_api(test_prompt)
    
    print(f"\n✓ Success: {success}")
    print(f"📄 Response ({len(response)} chars):")
    print("-" * 60)
    print(response[:500])  # First 500 chars
    print("-" * 60)
    
    if success:
        print("\n✅ API CALL SUCCESSFUL!")
    else:
        print("\n⚠️ API returned error (check response)")
        
except Exception as e:
    print(f"\n❌ Exception: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
