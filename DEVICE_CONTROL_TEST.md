# 🧪 Device Control API Test Guide

## Quick Test Commands

### 1. Test GET /api/building-type

```bash
# Using curl
curl http://192.168.1.19:3000/api/building-type \
  -H "Cookie: session=YOUR_SESSION_COOKIE"

# Expected Response (200 OK)
{
  "current_type": "van_phong",
  "name": "Văn phòng (1000 m²)",
  "available_types": {
    "chung_cu": "Chung cư (100 căn)",
    "nha_nghi": "Nhà nghỉ (20 phòng)",
    "van_phong": "Văn phòng (1000 m²)"
  },
  "standards": {
    "name": "Văn phòng (1000 m²)",
    "normal": {"min": 0.8, "max": 1.2},
    "high": {"min": 2.0, "max": 3.0},
    "critical": {"min": 4.5, "max": 9999999999.0}
  }
}
```

### 2. Test POST /api/building-type

```bash
curl -X POST http://192.168.1.19:3000/api/building-type \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  -d '{
    "building_type": "chung_cu"
  }'

# Expected Response (200 OK)
{
  "success": true,
  "building_type": "chung_cu",
  "name": "Chung cư (100 căn)",
  "message": "Đã thay đổi loại tòa nhà thành Chung cư (100 căn)"
}
```

### 3. Test GET /api/devices/all-status

```bash
curl http://192.168.1.19:3000/api/devices/all-status \
  -H "Cookie: session=YOUR_SESSION_COOKIE"

# Expected Response (200 OK)
{
  "building_type": "van_phong",
  "building_name": "Văn phòng (1000 m²)",
  "devices": [
    {
      "id": 1,
      "name": "Sảnh chính",
      "location": "Tầng trệt",
      "code": "CB-GF-01",
      "power": 1.2,
      "status": true,
      "load_status": {
        "status": "normal",
        "label": "Bình thường",
        "color": "#66bb6a",
        "severity": 1
      }
    },
    {
      "id": 2,
      "name": "Văn phòng A",
      "location": "Tầng 01",
      "code": "CB-L1-02",
      "power": 2.5,
      "status": true,
      "load_status": {
        "status": "high",
        "label": "Cao",
        "color": "#ffa726",
        "severity": 2
      }
    },
    {
      "id": 3,
      "name": "Server",
      "location": "Tầng 02",
      "code": "CB-L2-03",
      "power": 4.8,
      "status": true,
      "load_status": {
        "status": "critical",
        "label": "Tới hạn",
        "color": "#ff6b6b",
        "severity": 3
      }
    }
  ],
  "timestamp": "2026-04-04T10:30:00.123456"
}
```

### 4. Test GET /api/device/<id>/status

```bash
curl http://192.168.1.19:3000/api/device/2/status \
  -H "Cookie: session=YOUR_SESSION_COOKIE"

# Expected Response (200 OK)
{
  "id": 2,
  "name": "Văn phòng A",
  "location": "Tầng 01",
  "code": "CB-L1-02",
  "power": 2.5,
  "status": true,
  "load_status": {
    "status": "high",
    "label": "Cao",
    "color": "#ffa726",
    "severity": 2
  },
  "timestamp": "2026-04-04T10:30:00.123456"
}
```

### 5. Test POST /api/device/<id>/toggle

```bash
curl -X POST http://192.168.1.19:3000/api/device/1/toggle \
  -H "Content-Type: application/json"

# Expected Response (200 OK) - Device OFF
{
  "success": true,
  "id": 1,
  "status": false,
  "power": 1.2,
  "load_status": {
    "status": "idle",
    "label": "Chờ",
    "color": "#95959d",
    "severity": 0
  },
  "message": "Thiết bị Sảnh chính đã tắt"
}

# Expected Response (200 OK) - Device ON
{
  "success": true,
  "id": 1,
  "status": true,
  "power": 1.2,
  "load_status": {
    "status": "normal",
    "label": "Bình thường",
    "color": "#66bb6a",
    "severity": 1
  },
  "message": "Thiết bị Sảnh chính đã bật"
}
```

---

## JavaScript Test in Browser Console

### Test 1: Load Current Building Type
```javascript
fetch('/api/building-type')
  .then(r => r.json())
  .then(data => {
    console.log('Current Building:', data.current_type);
    console.log('Standards:', data.standards);
  });
```

### Test 2: Change Building Type
```javascript
fetch('/api/building-type', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ building_type: 'nha_nghi' })
})
.then(r => r.json())
.then(data => {
  console.log('Response:', data);
  if (data.success) {
    console.log('✓ Building type changed to:', data.name);
  }
});
```

### Test 3: Load All Devices with Status
```javascript
fetch('/api/devices/all-status')
  .then(r => r.json())
  .then(data => {
    console.table(data.devices, ['name', 'power', 'status', 'load_status']);
  });
```

### Test 4: Toggle Device
```javascript
fetch('/api/device/1/toggle', {
  method: 'POST'
})
.then(r => r.json())
.then(data => {
  console.log('Device toggled:', data.message);
  console.log('New status:', data.status);
  console.log('Load status:', data.load_status);
});
```

### Test 5: Monitor Load Status Changes (Every 2 seconds)
```javascript
const testInterval = setInterval(() => {
  fetch('/api/devices/all-status')
    .then(r => r.json())
    .then(data => {
      console.clear();
      console.log('Building:', data.building_name);
      console.table(data.devices.map(d => ({
        name: d.name,
        power: d.power.toFixed(2) + ' kW',
        status: d.status ? '✓ ON' : '✗ OFF',
        load: d.load_status.label,
        color: d.load_status.color,
        severity: d.load_status.severity
      })));
    });
}, 2000);

// Stop monitoring: clearInterval(testInterval)
```

---

## Postman Collection (JSON Format)

```json
{
  "info": {
    "name": "Device Control API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Current Building Type",
      "request": {
        "method": "GET",
        "url": "http://192.168.1.19:3000/api/building-type"
      }
    },
    {
      "name": "Change Building Type",
      "request": {
        "method": "POST",
        "url": "http://192.168.1.19:3000/api/building-type",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"building_type\": \"chung_cu\"}"
        }
      }
    },
    {
      "name": "Get All Devices Status",
      "request": {
        "method": "GET",
        "url": "http://192.168.1.19:3000/api/devices/all-status"
      }
    },
    {
      "name": "Get Single Device Status",
      "request": {
        "method": "GET",
        "url": "http://192.168.1.19:3000/api/device/1/status"
      }
    },
    {
      "name": "Toggle Device",
      "request": {
        "method": "POST",
        "url": "http://192.168.1.19:3000/api/device/1/toggle"
      }
    }
  ]
}
```

---

## Test Scenarios

### Scenario 1: Testing Building Type Thresholds

**Setup**:
- Devices: 1.2 kW, 2.5 kW, 4.8 kW
- Test each building type

**Expect Results**:

| Building | Device 1 (1.2) | Device 2 (2.5) | Device 3 (4.8) |
|---|---|---|---|
| **Văn phòng** | Normal 🟢 | High 🟠 | Critical 🔴 |
| **Chung cư** | Normal 🟢 | Normal 🟢 | Critical 🔴 |
| **Nhà nghỉ** | Critical 🔴 | Critical 🔴 | Critical 🔴 |

### Scenario 2: Testing Device Toggle

1. Start with all devices ON
2. Toggle device 1 → Status = OFF
3. Check load status → Should be "Chờ" (idle, gray)
4. Toggle device 1 again → Status = ON
5. Check load status → Should return to "Bình thường" or "Cao" depending on power

### Scenario 3: Testing Session/Authentication

1. Try to access `/api/devices/all-status` **WITHOUT** login
   - Expected: 401 Unauthorized
2. Login first, then test
   - Expected: 200 OK with data
3. Logout, then test again
   - Expected: 401 Unauthorized

### Scenario 4: Testing Frontend Integration

1. Open Dashboard
2. Go to "Thiết bị & Tải" tab
3. Verify table loads
4. Change building type via dropdown
5. Observe load status colors change
6. Click toggle button
7. Verify device status changes
8. Click Gemini button (💬)
9. Verify message sent to AI tab

---

## Error Handling Tests

### Test 1: Invalid Building Type
```javascript
fetch('/api/building-type', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ building_type: 'invalid_type' })
})
// Expected: 400 Bad Request
```

### Test 2: Non-existent Device
```javascript
fetch('/api/device/999/toggle', { method: 'POST' })
// Expected: 404 Not Found
```

### Test 3: Missing Authentication
```javascript
fetch('/api/devices/all-status')
// Expected: 401 Unauthorized (if not logged in)
```

---

## Performance Testing

### Load Test: Many Devices
```javascript
// Simulate loading table with 100 devices
const devices = Array.from({length: 100}, (_, i) => ({
  id: i + 1,
  name: `Device ${i + 1}`,
  location: `Floor ${Math.floor(i / 10)}`,
  code: `DEV-${String(i+1).padStart(3, '0')}`,
  power: Math.random() * 5,
  status: Math.random() > 0.5,
  load_status: {
    status: 'normal',
    label: 'Bình thường',
    color: '#66bb6a',
    severity: 1
  }
}));

console.time('Render 100 devices');
// Simulate render 
const html = devices.map(d => `<tr><td>${d.name}</td>...</tr>`).join('');
console.timeEnd('Render 100 devices');
```

### Polling Stress Test
```javascript
// Test polling doesn't cause memory leak
let count = 0;
const pollTest = setInterval(() => {
  count++;
  fetch('/api/devices/all-status')
    .then(r => r.json())
    .then(data => {
      if (count % 10 === 0) {
        console.log(`Poll #${count}: ${data.devices.length} devices`);
      }
    });
  
  if (count >= 60) {
    clearInterval(pollTest);
    console.log('✓ 60 polls completed without crash');
  }
}, 1000);
```

---

## Debug Checklist

- [ ] Check DeviceControl.js loaded: `window.deviceControl` exists?
- [ ] Check CSS loaded: `.devices-table` styles applied?
- [ ] Check API response: Console → Network tab → check response format
- [ ] Check session: Cookie contains valid session token?
- [ ] Check building_type: `system_data['building_type']` is set?
- [ ] Check devices: `system_data['devices']` has 3+ devices?
- [ ] Check notification: Toast messages appear on action?
- [ ] Check Gemini: Message sent to AI tab?
- [ ] Check critical alert: Modal popup shows when severity=3?

---

**Test Guide Version**: 1.0  
**Last Updated**: 2026-04-04  
**Status**: Ready for Testing ✅
