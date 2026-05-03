# 🚀 Smart Energy System - Complete Upgrade Guide

## Overview

Your Smart Energy Dashboard has been upgraded with a **Node.js Express backend** that adds:
- ✅ Real-time energy monitoring
- ✅ Historical data analysis  
- ✅ Anomaly detection
- ✅ Predictive analytics
- ✅ WebSocket live updates
- ✅ Scalable architecture

**Important**: The existing Flask application and UI remain **completely intact**. This upgrade adds a parallel Node.js API layer.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│          Browser (HTML/CSS/JavaScript)                  │
│     Smart Energy Dashboard (UNCHANGED)                  │
└────────────┬────────────────────────────────────────┬───┘
             │                                        │
             ▼ (fetch API calls)                      ▼
    ┌──────────────────┐                    ┌──────────────────┐
    │ Flask Backend    │                    │ Node.js Backend  │
    │ (port 3000)      │                    │ (port 3000)      │
    │                  │                    │ ✨ NEW ✨         │
    │ - Auth           │                    │                  │
    │ - UI Rendering   │                    │ - Realtime Data  │
    └──────────────────┘                    │ - History API    │
                                              │ - Anomaly Detection
            Data Layer                       │ - Predictions
         (JSON Files)                        │ - WebSocket Live
                                              └──────────────────┘
```

---

## Installation Steps

### 1. Install Node.js
- Download from https://nodejs.org/ (LTS version recommended)
- Verify installation:
  ```bash
  node --version
  npm --version
  ```

### 2. Setup Backend

```bash
# Navigate to backend directory
cd "D:\wed_toa_nha_thong_minh\backend"

# Install dependencies
npm install

# This installs:
# - express (web framework)
# - cors (cross-origin support)
# - ws (WebSocket)
# - dotenv (configuration)
```

### 3. Start Backend Server

```bash
# Development mode (auto-reload on changes)
npm run dev

# Or production mode
npm start
```

You should see:
```
🚀 Smart Energy Backend running on http://192.168.1.19:3000
📊 APIs:
   GET /api/energy/realtime - Current power & temperature
   GET /api/energy/history - Historical consumption
   GET /api/energy/anomaly - Anomaly detection
   GET /api/energy/prediction - Consumption prediction
   GET /api/energy/analytics - Dashboard analytics
🔌 WebSocket: ws://192.168.1.19:3000
```

### 4. Keep Flask Server Running

In a **separate terminal**:
```bash
cd "d:\wed toà nhà thông minh"

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Start Flask
python app.py
```

Flask runs on: **http://192.168.1.19:3000**

---

## Testing the Integration

### Test 1: Check Backend Health
```bash
# In PowerShell or any terminal
Invoke-WebRequest -Uri "http://192.168.1.19:3000/health" | ConvertFrom-Json
```

### Test 2: Get Real-time Data
```bash
curl http://192.168.1.19:3000/api/energy/realtime
```

### Test 3: Open Dashboard
1. Open browser: **http://192.168.1.19:3000**
2. Open **Browser Console** (F12 → Console tab)
3. You should see:
   ```
   🎯 Smart Energy Dashboard loaded - APIs ready
   🔴 WebSocket connected
   📊 Realtime data: {...}
   ```

### Test 4: Check Browser Console Errors
- Press **F12** in browser
- Go to **Console** tab
- Should show API calls and data logs
- Any red errors will help debug

---

## API Usage Examples

### JavaScript (in Browser Console)

```javascript
// Get real-time data
energyAPI.getRealtimeData().then(data => {
  console.log('Current Power:', data.current_power, 'kW');
  console.log('Temperature:', data.temperature, '°C');
});

// Get historical data
energyAPI.getHistoryData(30, 'Sảnh chính').then(data => {
  console.log('Daily consumption:', data.daily_consumption);
  console.log('Total:', data.total_consumption, 'kWh');
});

// Get anomalies
energyAPI.getAnomalyData(1.5).then(data => {
  console.log('Anomalies found:', data.anomaly_count);
  console.log('List:', data.anomalies);
});

// Get predictions
energyAPI.getPredictionData().then(data => {
  console.log('Next prediction:', data.predicted_next_consumption);
  console.log('Peak hours:', data.peak_hours);
  console.log('Top devices:', data.top_devices);
});

// Get analytics
energyAPI.getAnalyticsData().then(data => {
  console.log('Daily all:', data.daily_all, 'kWh');
  console.log('Device breakdown:', data.device_breakdown);
});
```

### cURL (in Terminal)

```bash
# Real-time data
curl http://192.168.1.19:3000/api/energy/realtime

# Historical data (last 30 days)
curl "http://192.168.1.19:3000/api/energy/history?days=30"

# Historical data for specific device
curl "http://192.168.1.19:3000/api/energy/history?days=30&device=Sảnh%20chính"

# Anomaly detection
curl "http://192.168.1.19:3000/api/energy/anomaly?threshold=1.5"

# Prediction
curl http://192.168.1.19:3000/api/energy/prediction

# Analytics
curl http://192.168.1.19:3000/api/energy/analytics
```

---

## File Structure

```
D:\wed_toa_nha_thong_minh\
├── backend\                    ✨ NEW FOLDER
│   ├── server.js              # Express backend + all APIs
│   ├── package.json           # Dependencies
│   ├── .env                   # Configuration
│   └── README.md              # Backend documentation
│
├── templates\
│   └── index.html             # ✏️ MODIFIED: Added API client script
│
├── static\
│   ├── api-client.js          # ✨ NEW: Frontend API client
│   ├── main.js                # (unchanged)
│   └── style.css              # (unchanged)
│
├── app.py                     # (unchanged - Flask still works)
├── data\
│   └── energy_data.json       # (used by backend)
│
└── BACKEND_SETUP.md           # ✨ NEW: This file
```

---

## What Changed? What Stayed the Same?

### ✅ KEEPS WORKING
- All existing HTML/CSS (100% intact)
- All existing Python Flask routes
- All existing authentication
- All existing data files
- User experience (UI is unchanged)

### ✨ NEWLY ADDED
- Node.js Express backend (`/backend/` folder)
- 5 new REST APIs for analytics
- WebSocket real-time updates
- Advanced data processing (anomaly detection, predictions)
- API client JavaScript library

### ⚠️ MODIFIED (Minimally)
- `templates/index.html`: Added 2 script tags (api-client.js + example usage)
- That's it! No HTML structure changes!

---

## Troubleshooting

### Issue: "Cannot find module 'express'"
**Solution**: 
```bash
cd backend
npm install
```

### Issue: "Port 3000 already in use"
**Solution**: 
```bash
# Windows - Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in .env
PORT=3001
```

### Issue: "WebSocket connection failed"
**Solution**: 
- Make sure backend server is running
- Check firewall isn't blocking port 3000
- Check browser console (F12) for errors

### Issue: "API returns null"
**Solution**:
- Verify backend is running: `curl http://192.168.1.19:3000/health`
- Check `/data/energy_data.json` exists
- Check browser console for network errors (F12)

### Issue: "CORS error"
**Solution**:
- Backend has CORS enabled (should work)
- If persistent, add to frontend (if needed):
  ```javascript
  fetch(url, {
    mode: 'cors',
    credentials: 'include'
  })
  ```

---

## Performance & Best Practices

### Optimization Tips

1. **Caching**: APIs return fresh data each call
   - Consider caching in frontend for repeated calls
   - Use `sessionStorage` for session-level cache

2. **WebSocket**: Updates every 2 seconds
   - Configurable in `backend/.env` → `WS_UPDATE_INTERVAL`
   - Reduce frequency to lower bandwidth usage

3. **Data Size**: 
   - Large datasets may slow down
   - Use `days` parameter to limit historical data

4. **Error Handling**:
   - All errors shown in browser console
   - Non-intrusive error alerts (don't break UI)
   - API client automatically retries WebSocket

---

## Next Steps

### To Extend the Backend:

1. **Add Database** (MongoDB/PostgreSQL)
   - Replace JSON file with real DB
   - Enable persistent data storage

2. **Add Authentication** 
   - Integrate with Flask auth
   - Add API key verification

3. **Add More APIs**
   - Device control endpoints
   - Settings management
   - User preferences

4. **Enhanced Predictions**
   - Machine learning models
   - Seasonal analysis
   - Forecasting weeks ahead

---

## Support & Documentation

- **Backend README**: `backend/README.md`
- **Original Instructions**: `.github/copilot-instructions.md`
- **API Client Code**: `static/api-client.js` (self-documented)

---

## Summary

✅ **Your dashboard is now upgraded with enterprise-grade backend capabilities**

- Existing system works exactly as before
- New Node.js backend handles analytics & predictions
- WebSocket provides live real-time updates
- Fully scalable architecture ready for growth
- Error handling ensures stability

**Run both servers and enjoy! 🎉**

```bash
# Terminal 1: Node.js Backend
cd backend && npm run dev

# Terminal 2: Flask Frontend  
python app.py

# Open: http://192.168.1.19:3000
```
