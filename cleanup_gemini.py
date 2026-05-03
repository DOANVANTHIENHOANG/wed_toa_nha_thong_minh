#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Cleanup script: Remove old call_gemini_api function from app.py
"""
import re

with open('app.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern để tìm hàm call_gemini_api cũ
pattern = r"\ndef call_gemini_api\(prompt.*?\n@app\.route\('/api/analytics/forecast'"
replacement = "\n@app.route('/api/analytics/forecast'"

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('app.py', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✓ Deleted old call_gemini_api function")
print(f"New file size: {len(new_content)} bytes")
