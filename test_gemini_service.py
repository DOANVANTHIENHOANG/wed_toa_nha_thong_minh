#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Test gemini_service"""
import gemini_service

# Test 1: Validate API key
is_valid, error_msg = gemini_service.validate_api_key()
print(f"✓ API Key Valid: {is_valid}")
if not is_valid:
    print(f"  Error: {error_msg[:100]}")

# Test 2: Get API key
api_key = gemini_service.get_api_key()
print(f"✓ API Key retrieved: {'Yes' if api_key else 'No'}")
if api_key:
    print(f"  First 20 chars: {api_key[:20]}...")

# Test 3: Build headers
headers = gemini_service.build_headers()
print(f"✓ Headers built: {list(headers.keys())}")

# Test 4: Build prompt
prompt = gemini_service.build_energy_consultation_prompt(
    "Công suất hệ thống bao nhiêu?",
    {
        'current_power_kw': 10.5,
        'current_temp': 26.5,
        'day_consumption_kwh': 50.0,
        'threshold': 15.0,
        'device_details': 'Tầng 1: 5kW, Tầng 2: 3.5kW'
    }
)
print(f"✓ Prompt built: {len(prompt)} chars")
print(f"  First 100 chars: {prompt[:100]}")
