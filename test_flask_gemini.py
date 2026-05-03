#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Test Gemini integration route in Flask
Run: python test_flask_gemini.py
"""
from flask import Flask, jsonify, request
import json

# Import Flask app (nếu app.py chạy được)
try:
    from app import app, require_login, users_db
    print("✓ Flask app imported successfully")
except Exception as e:
    print(f"❌ Cannot import app: {e}")
    print("Make sure all dependencies are installed")
    exit(1)

# Create test client
client = app.test_client()

print("=" * 70)
print("TESTING GEMINI ROUTE - /api/ai/gemini-consult")
print("=" * 70)

# Test 1: Request without login (should be 401)
print("\n[TEST 1] Request WITHOUT login")
print("-" * 70)
response = client.post(
    '/api/ai/gemini-consult',
    json={'query': 'Xin chào'},
    content_type='application/json'
)
print(f"Status: {response.status_code}")
if response.status_code == 302:  # Redirect to login
    print("✓ Correctly requires login (302 redirect)")
elif response.status_code == 401:
    print("✓ Correctly requires login (401 unauthorized)")
else:
    print(f"Response: {response.get_json()}")

# Test 2: Login first
print("\n[TEST 2] Login as admin")
print("-" * 70)
with client:
    # Login
    response = client.post(
        '/login',
        data={'username': 'admin', 'password': '123'},
        follow_redirects=True
    )
    print(f"Login status: {response.status_code}")
    
    if response.status_code == 200:
        print("✓ Login successful")
        
        # Test 3: Now call Gemini endpoint
        print("\n[TEST 3] Call /api/ai/gemini-consult WITH login")
        print("-" * 70)
        
        response = client.post(
            '/api/ai/gemini-consult',
            json={'query': 'Công suất hiện tại bao nhiêu?'},
            content_type='application/json'
        )
        
        print(f"Status: {response.status_code}")
        data = response.get_json()
        print(f"Response keys: {list(data.keys())}")
        print(f"Success: {data.get('success', 'N/A')}")
        print(f"Timestamp: {data.get('timestamp', 'N/A')}")
        print(f"Response preview ({len(data.get('response', ''))} chars):")
        print("-" * 70)
        print(data.get('response', 'N/A')[:300])
        print("-" * 70)
        
        if response.status_code == 200:
            print("\n✅ ROUTE WORKS! Status 200 OK")
        else:
            print(f"\n⚠️ Status {response.status_code}")
    else:
        print(f"❌ Login failed: {response.status_code}")

print("\n" + "=" * 70)
print("TEST COMPLETE")
print("=" * 70)
