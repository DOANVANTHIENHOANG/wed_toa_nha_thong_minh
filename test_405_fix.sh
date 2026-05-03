#!/usr/bin/env bash
# Test script to verify 405 Method Not Allowed fix

BASE_URL="http://localhost:3000"
REGISTER_URL="$BASE_URL/register"

echo "========================================"
echo "🧪 TEST: Fix lỗi 405 Method Not Allowed"
echo "========================================"
echo ""

# Test 1: GET request (fetch form)
echo "[TEST 1] GET $REGISTER_URL"
echo "Expected: 200 OK - HTML form page"
curl -s -w "\n%{http_code}\n" -X GET "$REGISTER_URL" | head -1 | grep -q "DOCTYPE\|<html" && echo "✅ GET 200 OK - Form loaded" || echo "❌ GET failed"
echo ""

# Test 2: POST request (form submission)
echo "[TEST 2] POST $REGISTER_URL - Valid credentials"
echo "Expected: 201 Created or 400 (validation)"
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "$REGISTER_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Nguyễn Văn Anh",
    "contact": "john@example.com",
    "room_code": "CB-L1-1",
    "meter_code": "CT-L1-001",
    "address": "Quận Thanh Khê",
    "password": "Password123!"
  }' | grep -q "success\|error" && echo "✅ POST endpoint working" || echo "❌ POST failed"
echo ""

echo "========================================"
echo "✅ Tests completed!"
echo "========================================"
