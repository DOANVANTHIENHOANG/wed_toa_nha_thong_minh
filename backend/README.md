# 🚀 Smart Energy Backend (Node.js Express)

## Installation

```bash
# 1. Navigate to backend folder
cd backend

# 2. Install dependencies
npm install

# 3. Start server (development mode)
npm run dev

# Or start production
npm start
```

## API Endpoints

### 1. Real-time Energy Data
```
GET http://192.168.1.19:3000/api/energy/realtime

Response:
{
  "status": "success",
  "data": {
    "current_power": "8.5",
    "temperature": 24.5,
    "devices": [...],
    "timestamp": "2026-04-04T...",
    "history": [1.2, 1.9, 2.5, ...]
  }
}
```

### 2. Historical Data
```
GET http://192.168.1.19:3000/api/energy/history?days=30&device=Sảnh%20chính

Response:
{
  "status": "success",
  "data": {
    "daily_consumption": {
      "2026-03-25": 15.4,
      "2026-03-24": 14.8,
      ...
    },
    "total_consumption": 450.2,
    "device": "Sảnh chính"
  }
}
```

### 3. Anomaly Detection
```
GET http://192.168.1.19:3000/api/energy/anomaly?threshold=1.5

Response:
{
  "status": "success",
  "data": {
    "total_records": 120,
    "anomaly_count": 5,
    "anomaly_percentage": "4.17",
    "anomalies": [
      {
        "timestamp": "2026-03-25 10:00:00",
        "device": "Server",
        "consumption": 7.5,
        "average": 4.8,
        "severity": "high"
      }
    ]
  }
}
```

### 4. Prediction & Analytics
```
GET http://192.168.1.19:3000/api/energy/prediction

Response:
{
  "status": "success",
  "data": {
    "predicted_next_consumption": "8.2",
    "peak_hours": [
      { "hour": 12, "consumption": 45.3 },
      { "hour": 14, "consumption": 42.1 },
      { "hour": 10, "consumption": 40.8 }
    ],
    "top_devices": [
      { "device": "Server", "consumption": 156.8 },
      { "device": "Văn phòng A", "consumption": 142.5 },
      { "device": "Sảnh chính", "consumption": 48.9 }
    ],
    "forecast_confidence": 0.85,
    "timestamp": "2026-04-04T..."
  }
}
```

### 5. Dashboard Analytics
```
GET http://192.168.1.19:3000/api/energy/analytics

Response:
{
  "status": "success",
  "data": {
    "daily_all": 348.2,
    "peak_hours": [...],
    "top_devices": [...],
    "device_breakdown": [
      { "device": "Sảnh chính", "consumption": 15.4 },
      { "device": "Văn phòng A", "consumption": 18.2 },
      { "device": "Server", "consumption": 122.4 }
    ]
  }
}
```

## WebSocket Real-time Updates

```javascript
// Connect to real-time data
const ws = new WebSocket('ws://192.168.1.19:3000');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Real-time update:', message);
};
```

## Features ✨

- ✅ Real-time power monitoring
- ✅ Historical data analysis
- ✅ Anomaly detection (1.5x threshold)
- ✅ Linear regression prediction
- ✅ Peak hour identification
- ✅ Top device ranking
- ✅ WebSocket live updates
- ✅ Error handling
- ✅ CORS enabled for frontend

## Testing Endpoints

```bash
# Windows PowerShell
Invoke-WebRequest -Uri "http://192.168.1.19:3000/health"
Invoke-WebRequest -Uri "http://192.168.1.19:3000/api/energy/realtime" | ConvertFrom-Json

# Linux/Mac
curl http://192.168.1.19:3000/health
curl http://192.168.1.19:3000/api/energy/realtime
```

## Architecture

```
backend/
├── server.js          # Main Express server + APIs + WebSocket
├── package.json       # Dependencies
├── .env              # Configuration
└── README.md         # This file
```

## Notes

- Backend runs on **port 3000** (configurable via .env)
- Flask app still runs on **port 5000**
- Frontend can be served from Flask while calling Node.js APIs
- All APIs have CORS enabled for frontend access
