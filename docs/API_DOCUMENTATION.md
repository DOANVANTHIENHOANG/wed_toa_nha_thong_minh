# 📚 API DOCUMENTATION - Smart Energy V2.1

## 🌐 Base URL
```
http://127.0.0.1:3000
http://192.168.1.19:3000
```

---

## 🔐 Authentication Endpoints

### POST /register
**Đăng ký tài khoản mới**
```
POST /register HTTP/1.1
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "phone": "0901234567",
  "password": "password123",
  "building_id": "B001",
  "meter_id": "M001"
}

Response (201):
{
  "success": true,
  "message": "Đăng ký thành công!",
  "redirect": "/login"
}
```

### POST /login
**Đăng nhập**
```
POST /login HTTP/1.1
Content-Type: application/json

{
  "username": "admin",
  "password": "123"
}

Response (200):
{
  "success": true,
  "message": "Đăng nhập thành công!",
  "redirect": "/dashboard"
}
```

### GET /logout
**Đăng xuất**
```
GET /logout HTTP/1.1

Response: Redirect to /
```

---

## 📊 Dashboard Endpoints

### GET /api/user
**Lấy thông tin người dùng hiện tại**
```
GET /api/user HTTP/1.1

Response (200):
{
  "username": "admin",
  "email": "admin@smartenergy.vn",
  "phone": "0901234567",
  "building_id": "B001",
  "meter_id": "M001",
  "success": true
}

Response (401):
{
  "success": false,
  "error": "No user in session"
}
```

### GET /api/stats
**Lấy dữ liệu thống kê Dashboard**
```
GET /api/stats HTTP/1.1

Response (200):
{
  "current_pwr": 2.45,          // Công suất hiện tại (kW)
  "temp": 24.3,                 // Nhiệt độ (°C)
  "kwh_day": 14.5,              // Điện hôm nay (kWh)
  "kwh_month": 420.8,           // Điện tháng này (kWh)
  "alert": false,               // Có cảnh báo không?
  "threshold": 5.0,             // Ngưỡng cảnh báo (kW)
  "success": true
}
```

### GET /api/devices
**Lấy danh sách thiết bị**
```
GET /api/devices HTTP/1.1

Response (200):
[
  {
    "id": 1,
    "name": "Sảnh chính",
    "location": "Tầng trệt",
    "code": "CB-GF-01",
    "power": 1.2,               // kW
    "status": true              // true = bật, false = tắt
  },
  {
    "id": 2,
    "name": "Văn phòng A",
    "location": "Tầng 01",
    "code": "CB-L1-02",
    "power": 2.5,
    "status": true
  },
  {
    "id": 3,
    "name": "Server",
    "location": "Tầng 02",
    "code": "CB-L2-03",
    "power": 4.8,
    "status": true
  }
]
```

---

## ⚙️ Settings Endpoints

### GET /api/settings
**Lấy cài đặt hệ thống**
```
GET /api/settings HTTP/1.1

Response (200):
{
  "threshold": 5.0,             // Ngưỡng cảnh báo công suất (kW)
  "price_per_kwh": 2500,        // Giá điện (₫/kWh)
  "schedule_off": "22:00"       // Giờ tắt tự động
}
```

### POST /api/settings/update
**Cập nhật cài đặt hệ thống**
```
POST /api/settings/update HTTP/1.1
Content-Type: application/json

{
  "threshold": 6.0,
  "price_per_kwh": 2800,
  "schedule_off": "23:00"
}

Response (200):
{
  "success": true,
  "message": "Settings updated",
  "settings": {
    "threshold": 6.0,
    "price_per_kwh": 2800,
    "schedule_off": "23:00"
  }
}
```

---

## 🤖 AI & Analysis Endpoints

### POST /api/ai-chat
**Chat với AI Assistant**
```
POST /api/ai-chat HTTP/1.1
Content-Type: application/json

{
  "message": "Tổng công suất?"
}

Response (200):
{
  "success": true,
  "response": "📊 Tổng công suất hiện tại: 2.45 kW. Hôm nay tiêu thụ: 14.5 kWh.",
  "message": "📊 Tổng công suất hiện tại: 2.45 kW. Hôm nay tiêu thụ: 14.5 kWh.",
  "timestamp": "2026-04-07T10:30:45.123456"
}
```

**Từ khóa hỗ trợ:**
- "tổng", "tất cả" → Tổng công suất
- "thiết bị", "device" → Danh sách thiết bị
- "dự báo", "forecast" → Dự báo tiêu thụ
- "cảnh báo", "alert" → Trạng thái cảnh báo
- "tối ưu", "optimize" → Gợi ý tối ưu hóa

---

## 🔌 Device Control Endpoints

### POST /api/device/<device_id>/toggle
**Bật/tắt thiết bị**
```
POST /api/device/1/toggle HTTP/1.1

Response (200):
{
  "success": true,
  "id": 1,
  "status": false,
  "message": "Thiết bị Sảnh chính đã tắt"
}

Response (404):
{
  "success": false,
  "message": "Thiết bị không tồn tại"
}
```

---

## 📊 Chart/Analytics Endpoints

### GET /api/chart-data
**Lấy dữ liệu biểu đồ**
```
GET /api/chart-data HTTP/1.1

Response (200):
{
  "labels": ["06:00", "09:00", "12:00", "15:00", "18:00", "21:00", "00:00"],
  "data": [1.2, 2.5, 3.8, 2.1, 2.9, 1.5, 0.8],
  "avg": 2.27
}
```

### GET /api/analytics/comparison
**So sánh tiêu thụ giữa các kỳ**
```
GET /api/analytics/comparison HTTP/1.1

Response (200):
{
  "statistics": {
    "total": 420.8,
    "avg": 13.58,
    "max": 22.5,
    "min": 5.2,
    "count": 31
  },
  "devices": {...},
  "top_consumers": [...]
}
```

### GET /api/analytics/device-consumption
**Phân tích tiêu thụ theo thiết bị**
```
GET /api/analytics/device-consumption HTTP/1.1

Response (200):
{
  "breakdown": {
    "Sảnh chính": {"total": 40.5, "avg": 1.3},
    "Văn phòng A": {"total": 82.5, "avg": 2.66},
    "Server": {"total": 158.4, "avg": 5.11}
  },
  "total": 281.4
}
```

### GET /api/analytics/energy-hogs
**Top 5 thiết bị tiêu thụ nhiều nhất**
```
GET /api/analytics/energy-hogs HTTP/1.1

Response (200):
{
  "top_consumers": [
    {
      "device": "Server",
      "total_kwh": 158.4,
      "avg_kw": 5.11
    },
    {
      "device": "Văn phòng A",
      "total_kwh": 82.5,
      "avg_kw": 2.66
    },
    ...
  ]
}
```

### GET /api/analytics/forecast
**Dự báo tiêu thụ tháng tới (ML LinearRegression)**
```
GET /api/analytics/forecast HTTP/1.1

Response (200):
{
  "forecast": {
    "predicted_monthly": 450.25,
    "current_daily_avg": 13.56,
    "trend": "increasing"
  },
  "current_data_points": 31
}
```

---

## ⚠️ Alert Management Endpoints

### GET /api/alerts (Admin only)
**Lấy danh sách tất cả cảnh báo**
```
GET /api/alerts HTTP/1.1

Response (200):
{
  "alerts": [
    {
      "timestamp": "2026-04-07T10:15:30",
      "status": "ALERT",
      "current": 5.5,
      "threshold": 5.0,
      "message": "⚠️ Cảnh báo: Công suất vượt ngưỡng (5.5kW > 5.0kW)"
    }
  ],
  "total": 5,
  "critical": 2
}
```

### POST /api/alerts/clear (Admin only)
**Xóa tất cả cảnh báo**
```
POST /api/alerts/clear HTTP/1.1

Response (200):
{
  "success": true,
  "message": "Alerts cleared"
}
```

---

## 📤 Export Endpoints

### GET /api/export-report
**Xuất báo cáo năng lượng (JSON)**
```
GET /api/export-report HTTP/1.1

Response (200):
{
  "generated_at": "2026-04-07T10:30:45.123456",
  "user": "admin",
  "statistics": {...},
  "devices": {...},
  "top_consumers": [...],
  "forecast": {...},
  "insights": {
    "summary": "⚡ Công suất cao trong giờ cao điểm",
    "recommendations": [...]
  }
}
```

---

## 🛠️ Optimization Endpoints

### GET /api/optimization/check-overload
**Kiểm tra quá tải**
```
GET /api/optimization/check-overload HTTP/1.1

Response (200):
{
  "status": "OK",
  "current": 2.45
}

Response (400) if alert:
{
  "status": "ALERT",
  "current": 5.5,
  "threshold": 5.0,
  "message": "⚠️ Cảnh báo: Công suất vượt ngưỡng..."
}
```

### POST /api/optimization/eco-mode
**Gợi ý ECO mode**
```
POST /api/optimization/eco-mode HTTP/1.1
Content-Type: application/json

{
  "occupancy": 1
}

Response (200):
{
  "suggestion": "Enable ECO mode",
  "devices_to_disable": ["Server", "Văn phòng A"],
  "estimated_saving": 2.5,
  "reason": "Low occupancy detected"
}
```

---

## ❌ Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "error": "No user in session"
}
```

### 404 Not Found
```json
{
  "error": "Not found"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid input"
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "Server error message"
}
```

---

## 📝 Notes

- **Authentication**: Tất cả `/api/*` routes cần login (session cookie)
- **Admin Only**: `/api/alerts/*` và `/api/system/*` cần role=admin
- **CORS Enabled**: Frontend có thể gọi từ bất kỳ domain nào
- **Default Values**: Nếu dữ liệu thiếu, API trả về default values thay vì error
- **Timestamps**: Sử dụng ISO 8601 format

---

**Version**: 2.1 (Research Edition)  
**Last Updated**: 2026-04-07
