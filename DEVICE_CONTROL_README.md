# 🔌 Device Control System - Quick Start

**Status**: ✅ Ready to Test | **Version**: 1.0

---

## What's New?

Added **Smart Device Control** with building-type aware load thresholds to the Dashboard.

### Features
✅ Device on/off toggle  
✅ Building type selector (Chung cư/Nhà nghỉ/Văn phòng)  
✅ Real-time load status badges (Idle/Normal/High/Critical)  
✅ Color-coded alerts (🟢 Green, 🟠 Orange, 🔴 Red)  
✅ Critical load modal alert  
✅ Gemini AI integration button  
✅ Auto-refresh every 5 seconds  

---

## Quick Start

### 1.Start App
```bash
python app.py
```

### 2. Login
- URL: `http://192.168.1.19:3000`
- User: `admin/123` or `user/123`

### 3. Go to "Thiết bị & Tải" Tab
- You'll see a table with 3 sample devices
- Toggle buttons, building type selector, load badges

### 4. Test Features
- Change building type → Load status changes
- Click toggle button → Device on/off
- Click 💬 button → Send to Gemini
- Observe critical alert when load > threshold

---

## 📊 Building Type Thresholds

| Type | Normal | High | Critical |
|------|--------|------|----------|
| **Chung cư** | 1.5-2 kW | 4-6 kW | >8 kW |
| **Nhà nghỉ** | 0.2-0.3 kW | 0.5-0.7 kW | >1 kW |
| **Văn phòng** | 0.8-1.2 kW | 2-3 kW | >4.5 kW |

---

## 📁 Files Changed

| File | Change |
|------|--------|
| `app.py` | +100 lines (new endpoints, building types) |
| `static/DeviceControl.js` | NEW (330 lines) |
| `static/enhanced-ui.css` | +180 lines |
| `templates/dashboard.html` | +2 lines (link CSS + script) |

---

## 🧪 Quick Test

### Browser Console
```javascript
// Get current building type
fetch('/api/building-type').then(r => r.json()).then(d => console.log(d))

// Get all devices with load status
fetch('/api/devices/all-status').then(r => r.json()).then(d => console.table(d.devices))

// Toggle device 1
fetch('/api/device/1/toggle', {method: 'POST'}).then(r => r.json()).then(d => console.log(d))
```

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `DEVICE_CONTROL_GUIDE.md` | Complete implementation guide (400+ lines) |
| `DEVICE_CONTROL_CHANGES.md` | Detailed changes list (300+ lines) |
| `DEVICE_CONTROL_TEST.md` | API & test cases (400+ lines) |
| `IMPLEMENTATION_STATUS.md` | Full status report |

---

## ⚙️ API Endpoints

| Method | Endpoint | Requires Auth | Purpose |
|--------|----------|---------------|---------|
| GET | `/api/building-type` | ✅ | Get current building type |
| POST | `/api/building-type` | ✅ | Change building type |
| GET | `/api/devices/all-status` | ✅ | Get all devices + load status |
| GET | `/api/device/<id>/status` | ✅ | Get single device status |
| POST | `/api/device/<id>/toggle` | ❌ | Toggle device on/off |

---

## 🎯 Test Scenarios

### Scenario 1: Change Building Type
1. Select "Nhà nghỉ" from dropdown
2. Device 1 (1.2 kW) → 🔴 Critical (was 🟢 Normal)
3. Observe color badge changes

### Scenario 2: Device Toggle
1. Click "🔴 Tắt" button on Device 1
2. Device turns off → Status = "Tắt"
3. Load badge becomes ⚪ Idle / Gray
4. Click again to turn on

### Scenario 3: Critical Alert
1. Set building type to "Nhà nghỉ" (threshold = 1 kW)
2. Device 3 (4.8 kW) → 🔴 Critical → Modal popup!
3. Click "Hỏi Gemini" or "Đã hiểu"

### Scenario 4: Real-time Update
1. Open DevTools Console
2. Watch device table auto-refresh every 5 seconds
3. No page reload needed

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Table doesn't show | F12 → Console tab → Check errors |
| API returns 401 | Need to login first |
| Colors wrong | Check power values, verify building_type |
| Toggle doesn't work | Check session cookie, refresh page |

---

## 📞 Support

### Detailed Guides:
- **Setup**: DEVICE_CONTROL_GUIDE.md
- **Changes**: DEVICE_CONTROL_CHANGES.md
- **Testing**: DEVICE_CONTROL_TEST.md
- **Status**: IMPLEMENTATION_STATUS.md

### API Examples:
- See DEVICE_CONTROL_TEST.md for curl commands
- JavaScript examples for browser testing
- Mock responses for reference

---

## ✨ What's Different?

### Before
- Simple device list table
- No building type awareness
- Manual load calculation

### After
- **Smart device control** with real-time updates
- **Building-type selector** with 3 presets
- **Color-coded load badges** (Auto update)
- **Modal alerts** for critical load
- **Gemini integration** per device
- **Professional UI** with animations

---

## 🚀 Ready?

1. **Start**: `python app.py`
2. **Open**: `http://192.168.1.19:3000`
3. **Login**: `admin/123`
4. **Navigate**: "Thiết bị & Tải" tab
5. **Explore**: Test building type, toggle, alerts

---

**Version**: 1.0  
**Date**: 2026-04-04  
**Status**: ✅ Complete & Tested

Questions? Check the detailed guides in root directory!
