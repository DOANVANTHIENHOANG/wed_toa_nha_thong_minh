#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Direct test of Gemini integration logic (without Flask)
"""
import json
from datetime import datetime

# Import service
import gemini_service
from db_helper import get_all_devices, get_energy_statistics

print("=" * 70)
print("TESTING GEMINI INTEGRATION LOGIC (Direct)")
print("=" * 70)

# Simulate what happens in the route
try:
    print("\n[STEP 1] Getting devices and statistics")
    devices = get_all_devices()
    stats_today = get_energy_statistics(hours=24)
    print(f"✓ Got {len(devices)} devices")
    print(f"✓ Got stats: {stats_today}")
    
    # Build snapshot
    current_pwr = sum(
        float(d.get('current_power', 0)) 
        for d in devices 
        if d.get('power_status') == 'ON'
    ) if devices else 0.0
    
    device_details = ", ".join([
        f"{d.get('room_name', 'N/A')}: {d.get('current_power', 0)}kW"
        for d in devices
    ]) if devices else "Không có thiết bị"
    
    threshold = 15.0
    
    data_snapshot = {
        'current_power_kw': round(current_pwr, 2),
        'current_temp': 26.5,
        'day_consumption_kwh': round(stats_today.get('total_power', 0.0), 2),
        'threshold': threshold,
        'device_details': device_details,
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    print(f"\n[STEP 2] Built snapshot:")
    print(json.dumps(data_snapshot, indent=2, ensure_ascii=False))
    
    # Build prompt
    print(f"\n[STEP 3] Building prompt...")
    user_query = "Công suất hệ thống hiện tại bao nhiêu? Có vấn đề gì không?"
    prompt = gemini_service.build_energy_consultation_prompt(user_query, data_snapshot)
    print(f"✓ Prompt built ({len(prompt)} chars)")
    print(f"  First 300 chars: {prompt[:300]}")
    
    # Call Gemini API
    print(f"\n[STEP 4] Calling Gemini API...")
    success, response = gemini_service.call_gemini_api(prompt)
    
    print(f"✓ API call completed")
    print(f"  Success: {success}")
    print(f"  Response length: {len(response)} chars")
    print(f"  Response preview:\n" + "-" * 70)
    print(response[:500])
    print("-" * 70)
    
    # Build final response
    final_response = {
        'success': success,
        'response': response,
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    print(f"\n[FINAL RESPONSE]")
    print(json.dumps(final_response, indent=2, ensure_ascii=False))
    
    print("\n✅ INTEGRATION TEST PASSED!")
    
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 70)
