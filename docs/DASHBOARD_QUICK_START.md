# 🚀 Smart Energy Dashboard - Quick Start

**Date**: 2026-04-20  
**Version**: 2.0 Production Ready

---

## ⚡ 30-Second Setup

```powershell
# 1. Navigate to project
cd d:\wed_toa_nha_thong_minh

# 2. Start Flask
python app.py

# 3. Open browser
http://127.0.0.1:5000/smart-dashboard

# 4. Login
Username: admin
Password: 123

# Done! 🎉
```

---

## 📱 Dashboard Access

| Item | Value |
|------|-------|
| **URL** | http://127.0.0.1:5000/smart-dashboard |
| **Admin Username** | admin |
| **Admin Password** | 123 |
| **User Username** | user |
| **User Password** | 123 |
| **Port** | 5000 |

---

## 🎯 Dashboard Overview

### Tabs (4 Total)
1. 📡 **IoT Sensors** - 25 rooms, 4 sensor types, real-time data
2. ❄️ **HVAC Control** - 5 zones, temperature adjustment, ECO mode
3. 💡 **Lighting Control** - 5 zones, brightness slider, occupancy detection
4. 📊 **Energy Stats** - Power consumption, monthly cost, active zones

### Quick Controls (3 Buttons)
- 🔄 **Refresh Now** - Manual data refresh
- ❄️ **HVAC ECO** - Save 15-20% energy
- 💡 **Lighting ECO** - Save 20-30% energy

---

## 🔌 API Endpoints

### IoT (4 endpoints)
```
GET /api/iot/summary
GET /api/iot/room/<id>
GET /api/iot/sensor/<id>/<type>
GET /api/iot/sensors
```

### HVAC (5 endpoints)
```
GET /api/hvac/status
GET /api/hvac/zone/<id>
POST /api/hvac/control
POST /api/hvac/eco-mode
GET /api/hvac/energy-stats
```

### Lighting (5 endpoints)
```
GET /api/lighting/status
GET /api/lighting/zone/<id>
POST /api/lighting/control
POST /api/lighting/eco-mode
GET /api/lighting/energy-stats
```

---

## 🏠 Room & Zone Structure

### 25 IoT Rooms
```
Tầng Trệt (Ground):  5 rooms
  - Sảnh chính, Văn phòng A, Server, Nhà vệ sinh, Thang máy

Tầng 01-04 (Floors):  20 rooms (5 per floor)
  - Phòng họp A/B, Phòng làm việc 08, Phòng quản lý, Thư viện, Kho lạnh
```

### 5 HVAC/Lighting Zones
```
Zone 1: Tầng Trệt
Zone 2: Tầng 01
Zone 3: Tầng 02
Zone 4: Tầng 03
Zone 5: Tầng 04
```

---

## 🎛️ Control Operations

### HVAC Temperature Control
1. Go to "❄️ HVAC Control" tab
2. Find zone
3. Click "+" to increase / "−" to decrease temperature
4. Each click = ±1°C

### Lighting Brightness Control
1. Go to "💡 Lighting Control" tab
2. Find zone
3. Drag slider or click to set brightness (0-100%)
4. Power consumption updates in real-time

### Enable ECO Mode
1. Click "❄️ HVAC ECO" → Reduces HVAC to 24°C (saves 15-20%)
2. Click "💡 Lighting ECO" → Reduces light sensitivity (saves 20-30%)
3. Check Energy Stats tab for cost reduction

---

## 📊 Reading the Dashboard

### IoT Sensor Card
```
Phòng 101 [Có người] ← Room name & occupancy
Tầng 01              ← Floor

🌡️ 22.3°C  💡 50%    ← Temperature & light level
💧 55%    ⏱️ Vừa xong ← Humidity & last update
```

### HVAC Zone Card
```
Tầng 01 [🟢 Đang chạy] ← Zone name & status
Floor 1

Current: 22.3°C → Target: 22.0°C ← Temperatures
Fan: 50% | Power: 0.25 kW        ← Status & consumption

[−] 22.0 [+]                      ← Control buttons
```

### Lighting Zone Card
```
Tầng 01 [🟢 Bật] ← Zone name & status
Floor 1

Brightness: 75%      ← Current brightness
Ambient: 25.5%       ← Light sensor reading
Occupancy: Có        ← Motion detection
Power: 0.03 kW       ← Consumption

▓▓▓▓▓░░░░░ 75%       ← Brightness slider
```

### Energy Statistics
```
⚡ Total Power: 2.53 kW
❄️ HVAC: 2.50 kW
💡 Lighting: 0.03 kW
💰 Monthly Cost: 7,590,000 VND
🌡️ Active Zones: 10
♻️ ECO Status: OFF
```

---

## 🔄 Auto-Refresh

- **Frequency**: Every 10 seconds automatically
- **Manual Refresh**: Click "🔄 Refresh Now"
- **Indicator**: Green dot with "Live Data" label at bottom-right
- **No Action Needed**: Updates happen automatically in background

---

## 🎨 Visual Indicators

### Status Lights
- 🟢 Green dot = Zone active/running
- ⚫ Gray dot = Zone inactive/off
- ⚠️ Yellow = Warning/caution state

### Occupancy Badges
- "Có người" (with green background) = Room occupied
- "Trống" (with gray background) = Room empty

### Data Freshness
- "Vừa xong" (just now) = Data is current
- Timestamps show exact update time

---

## 🛠️ Troubleshooting

### Dashboard Shows Blank Page
- [ ] Flask running? Check: `python app.py`
- [ ] Logged in? Try: `http://127.0.0.1:5000/login`
- [ ] Port 5000 free? Check: `netstat -ano | findstr :5000`

### Data Not Updating
- [ ] Click "🔄 Refresh Now"
- [ ] Check F12 console for errors
- [ ] Restart Flask: `Ctrl+C` then `python app.py`

### Controls Not Working
- [ ] Are you admin? (user account can't control)
- [ ] Try: `admin` / `123`
- [ ] Check browser console: `F12` → Console tab

### Slow Performance
- [ ] Check internet speed
- [ ] Close other tabs
- [ ] Clear browser cache: `Ctrl+Shift+Delete`

---

## 📈 Energy Monitoring

### Daily Monitoring
```
Check Energy Stats tab:
- Total power consumption (kW)
- Cost per hour
- Active zones count
```

### Cost Calculation
```
Monthly Cost = Power (kW) × 24h × 30 days × 2,500 VND/kWh

Example:
2.5 kW × 24 × 30 × 2,500 = 4,500,000 VND/month
```

### Savings with ECO Mode
```
HVAC ECO:     15-20% energy reduction
Lighting ECO: 20-30% energy reduction
Total:        15-25% system savings

Monthly Savings: ~900,000 VND
Yearly Savings:  ~10.8M VND
```

---

## 🔐 Access Control

### What Admin Can Do
✅ View all data  
✅ Adjust HVAC temperature  
✅ Adjust lighting brightness  
✅ Enable/disable ECO modes  
✅ See energy statistics

### What User Can Do
✅ View all data (read-only)  
✅ See real-time sensors  
✅ Check energy stats  
❌ Cannot control devices

---

## 📱 Mobile Access

### Mobile Responsive
- Works on iPhone, Android, iPad
- Touch-friendly controls
- Swipeable tabs
- Single-column layout on small screens

### URL on Mobile
```
Same URL: http://127.0.0.1:5000/smart-dashboard
(if on same network)
```

---

## 📚 Full Documentation

For detailed information, see:
- **DASHBOARD_GUIDE.md** - Complete dashboard guide
- **IOT_INTEGRATION.md** - IoT sensor API reference
- **HVAC_INTEGRATION.md** - HVAC control details
- **LIGHTING_INTEGRATION.md** - Lighting control details
- **PROJECT_COMPLETION_SUMMARY_v2.0.md** - Full project overview

All in: `/docs/` folder

---

## 🎓 Common Tasks

### Task: Check Current Building Temperature
1. Open smart-dashboard
2. Go to "❄️ HVAC Control" tab
3. See "Nhiệt độ hiện tại" for each zone

### Task: Reduce Power Consumption
1. Open smart-dashboard
2. Click "❄️ HVAC ECO" (saves 15-20%)
3. Click "💡 Lighting ECO" (saves 20-30%)
4. Check Energy Stats for updated costs

### Task: Adjust Office Lighting
1. Go to "💡 Lighting Control" tab
2. Find "Tầng 01" zone
3. Drag brightness slider to desired level
4. Changes apply immediately

### Task: Set Conference Room to 23°C
1. Go to "❄️ HVAC Control" tab
2. Find zone (e.g., "Tầng 01")
3. Click "+" button 1 time (22°C → 23°C)
4. Temperature updates in real-time

### Task: Check Monthly Energy Cost
1. Go to "📊 Energy Stats" tab
2. Look for "💰 Chi Phí Tháng"
3. Shows estimated monthly cost in VND
4. ECO modes reduce this cost

---

## 🚀 Tips & Tricks

### Pro Tips
✨ Use ECO modes during low occupancy (saves 15-30%)  
✨ Check energy stats regularly  
✨ Adjust settings based on occupancy  
✨ Use quick refresh during peak hours

### Time-Savers
⚡ Set bookmark: `http://127.0.0.1:5000/smart-dashboard`  
⚡ Use keyboard: F5 to refresh, Tab to navigate  
⚡ Remember password: admin/123

---

## ✅ Checklist

Before first use:
- [ ] Flask running (`python app.py`)
- [ ] Dashboard accessible (http://127.0.0.1:5000/smart-dashboard)
- [ ] Can login (admin/123)
- [ ] All 4 tabs visible
- [ ] Data auto-refreshes
- [ ] IoT sensors showing data
- [ ] HVAC zones visible
- [ ] Lighting zones visible
- [ ] Energy stats calculating

---

## 📞 Need Help?

### Check These First
1. Browser console (F12): Any error messages?
2. Flask output: Any stack traces?
3. Network tab (F12): API calls succeeding?
4. Refresh page: `Ctrl+R` or F5

### Then Try
1. Restart Flask: `Ctrl+C`, then `python app.py`
2. Clear cache: `Ctrl+Shift+Delete`
3. Try different browser
4. Check documentation in `/docs/`

---

**Version**: 2.0  
**Created**: 2026-04-20  
**Status**: ✅ Production Ready

🎉 **Welcome to Smart Energy Dashboard!** 🎉
