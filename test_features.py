#!/usr/bin/env python3
import requests
import json

API = 'http://192.168.1.19:3000'
print("\n" + "="*60)
print("📊 KIỂM TRA FEATURES DASHBOARD")
print("="*60 + "\n")

# Test endpoints
endpoints = {
    'IoT Devices': '/api/iot/devices',
    'IoT Status': '/api/iot/status',
    'HVAC Status': '/api/hvac/status/hvac-main',
    'Lighting Status': '/api/lighting/status/lighting-main',
    'Alerts': '/api/alerts',
    'Schedule Rules': '/api/schedule/rules',
    'Demand Response': '/api/demandresponse/status',
}

print("1️⃣ API ENDPOINTS AVAILABILITY:\n")
available = 0
for name, endpoint in endpoints.items():
    try:
        r = requests.get(f"{API}{endpoint}", timeout=1)
        if r.status_code < 400:
            print(f"   ✅ {name:20s} → {endpoint}")
            available += 1
        else:
            print(f"   ⚠️  {name:20s} → {r.status_code}")
    except Exception as e:
        print(f"   ❌ {name:20s} → {str(e)[:30]}")

print(f"\n   SẴN SÀN: {available}/{len(endpoints)}\n")

# Check dashboard features
print("2️⃣ FEATURES TRONG DASHBOARD:\n")

features = {
    "✅ Hoạt động": [
        "Tab Tổng quan (Overview)",
        "UI Glass-morphism + Tiếng Việt",
        "Notification system",
        "Tab Switcher",
    ],
    "🟡 Partial (Chỉ UI, không API)": [
        "Tab HVAC - Chỉ có slider, thiếu API",
        "Tab Lighting - Chỉ có slider, thiếu API",
        "Tab Alerts - Bảng trống",
        "Tab Analytics - Placeholder",
    ],
    "❌ Thiếu hoàn toàn": [
        "Tab Schedule - Không có",
        "WebSocket real-time updates",
        "Mode selection (Làm mát/Sưởi/Tự động)",
        "Color temperature (Ấm/Trung tính/Ban ngày)",
        "Eco Mode",
        "Biểu đồ so sánh tiêu thụ",
        "Top 5 thiết bị tiêu thụ",
        "Alert history with acknowledge",
    ],
}

for status, items in features.items():
    print(f"   {status}:")
    for item in items:
        print(f"      • {item}")
    print()

# Check WebSocket
print("3️⃣ WEBSOCKET CONNECTION:\n")
try:
    import websocket # type: ignore
    ws = websocket.create_connection("ws://192.168.1.19:3000", timeout=1)
    print("   ✅ WebSocket server responsive")
    ws.close()
except ImportError:
    print("   ⚠️  websocket module not installed")
except Exception as e:
    print(f"   ❌ WebSocket: {str(e)[:50]}")

# Summary
print("\n" + "="*60)
print("📋 TÍNH TOÁN:")
print("="*60)
print(f"""
DASHBOARD CÓ:
  ✅ {available} API endpoints hoạt động
  ✅ 5 tabs (nhưng 4 trong số đó không hoàn chỉnh)
  ✅ UI/UX hiện đại + Tiếng Việt
  ✅ Notification system

DASHBOARD THIẾU:
  ❌ WebSocket real-time Updates (no live data)
  ❌ HVAC control (chỉ có UI, không có API implementation)
  ❌ Lighting control (chỉ có UI, không có API implementation)
  ❌ Schedule tab hoàn chỉnh
  ❌ Analytics phức tạp
  ❌ Alert acknowledgement
  ❌ Auto-reconnect WebSocket

⚠️ KẾT LUẬN:
   → Dashboard là "BỮA NHÌN" 60%
   → Có UI đẹp nhất không hoạt động thực tế
   → Cần implement các API call đúng cách
   → Cần WebSocket integration
   → Cần thêm Schedule tab
""")
