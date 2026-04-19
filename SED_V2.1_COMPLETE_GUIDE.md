# 🏢 SED V2.1 - Smart Energy Dashboard V2.1 - Complete Integration Guide

**Ngày cập nhật:** 2026-04-07  
**Phiên bản:** 2.1.0 (Database + ML + Automation + AI Integration)  
**Trạng thái:** ✅ Production Ready

---

## 📋 Mục Lục

1. [Tổng Quan Hệ Thống](#tổng-quan)
2. [Cài Đặt & Chạy](#cài-đặt)
3. [Database Schema](#database)
4. [API Endpoints](#api)
5. [Frontend Components](#frontend)
6. [Tính Năng Mới](#features)
7. [Machine Learning](#ml)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Tổng Quan

SED V2.1 là hệ thống quản lý năng lượng tòa nhà thông minh với:

✅ **Database SQLite** - Lưu lịch sử tiêu thụ, cảnh báo, logs  
✅ **Automation Scheduling** - Lịch trình bật/tắt thiết bị  
✅ **ML Forecasting** - Dự báo tiêu thụ dùng scikit-learn  
✅ **Gemini AI Analysis** - Phân tích tối ưu hóa năng lượng  
✅ **Real-time Monitoring** - Cập nhật dữ liệu mỗi 30 giây  
✅ **Advanced Settings** - Cài đặt ngưỡng & cảnh báo  

### 📊 Kiến Trúc

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (HTML/CSS/JS)               │
├─────────────────────────────────────────────────────────┤
│  Dashboard │ Automation │ Gemini AI │ Settings │ Charts │
├─────────────────────────────────────────────────────────┤
│                   Flask Backend (Python)                │
├─────────────────────────────────────────────────────────┤
│  Database │ ML Predictor │ API Routes │  Auth  │ CORS   │
├─────────────────────────────────────────────────────────┤
│          SQLite Database + JSON Data + API Keys         │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Cài Đặt & Chạy

### 1️⃣ Chuẩn Bị Môi Trường

```powershell
# Kích hoạt virtual environment
cd "d:\wed toà nhà thông minh"
. .\.venv\Scripts\Activate.ps1

# Cài đặt dependencies
pip install -r requirements.txt
```

### 2️⃣ Khởi Tạo Database

```powershell
# Tạo database với sample data
python init_db.py

# Output: ✅ Database initialized at: D:\wed_toa_nha_thong_minh\data\energy.db
```

### 3️⃣ Chạy Backend

```powershell
# Khởi động Flask server
python app.py

# Output: Running on http://127.0.0.1:3000
```

### 4️⃣ Mở Frontend

Truy cập: **192.168.1.19:3000login**

**Test Accounts:**
- Admin: `admin` / `123`
- User: `user` / `123`

---

## 🗄️ Database Schema

### 📝 Bảng Chính

#### `energy_consumption` - Lịch sử tiêu thụ điện
```sql
CREATE TABLE energy_consumption (
    id INTEGER PRIMARY KEY,
    timestamp DATETIME,
    device_id INTEGER,
    device_name TEXT,
    location TEXT,
    power_kw REAL,
    temperature REAL,
    humidity REAL,
    occupancy INTEGER,
    created_at DATETIME
);
```

**Ví dụ:** 
```python
db_helper.log_energy_consumption(
    device_id=1,
    device_name='Sảnh chính',
    location='Tầng trệt',
    power_kw=1.5,
    temperature=24.5,
    humidity=65.0,
    occupancy=5
)
```

#### `device_schedule` - Lịch trình tự động hóa
```sql
CREATE TABLE device_schedule (
    id INTEGER PRIMARY KEY,
    device_id INTEGER,
    device_name TEXT,
    day_of_week TEXT,      -- "Monday", "Everyday", etc.
    start_time TEXT,       -- "08:00"
    end_time TEXT,         -- "17:00"
    action TEXT,           -- "ON", "OFF", "OPTIMIZE"
    is_enabled BOOLEAN
);
```

#### `threshold_settings` - Cài đặt ngưỡng
```sql
CREATE TABLE threshold_settings (
    setting_key TEXT UNIQUE,
    setting_value REAL,
    description TEXT
);
-- Keys: threshold_power_kw, price_per_kwh, temp_max, temp_min, etc.
```

#### `alerts` - Lịch sử cảnh báo
```sql
CREATE TABLE alerts (
    id INTEGER PRIMARY KEY,
    timestamp DATETIME,
    alert_type TEXT,       -- "OVERLOAD", "TEMP_HIGH", "TEMP_LOW"
    device_name TEXT,
    current_value REAL,
    threshold_value REAL,
    message TEXT,
    severity TEXT,         -- "HIGH", "WARNING", "INFO"
    is_resolved BOOLEAN
);
```

#### `ai_analysis` - Lịch sử phân tích AI
```sql
CREATE TABLE ai_analysis (
    id INTEGER PRIMARY KEY,
    timestamp DATETIME,
    user_query TEXT,
    ai_response TEXT,
    data_snapshot TEXT,    -- JSON với dữ liệu tại thời điểm phân tích
    created_at DATETIME
);
```

#### `ml_training_data` - Dữ liệu huấn luyện ML
```sql
CREATE TABLE ml_training_data (
    id INTEGER PRIMARY KEY,
    timestamp DATETIME,
    temperature REAL,
    humidity REAL,
    occupancy INTEGER,
    power_consumption_kw REAL,
    is_peak_hour BOOLEAN
);
```

### 🔑 Helper Functions (`db_helper.py`)

```python
# Energy Consumption
db_helper.log_energy_consumption(device_id, name, location, power, temp, humidity, occupancy)
db_helper.get_energy_history(hours=24)
db_helper.get_device_breakdown(hours=24)

# Device Schedule
db_helper.add_schedule(device_id, name, location, day_of_week, start_time, end_time, action)
db_helper.get_schedules(device_id=None)
db_helper.delete_schedule(schedule_id)

# Settings
db_helper.get_setting(key)
db_helper.update_setting(key, value)
db_helper.get_all_settings()

# Alerts
db_helper.log_alert(alert_type, device_id, name, current, threshold, message, severity)
db_helper.get_recent_alerts(limit=10)
db_helper.resolve_alert(alert_id)
```

---

## 🔌 API Endpoints

### 🔐 Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/login` | POST | Đăng nhập |
| `/logout` | GET | Đăng xuất |
| `/register` | POST | Đăng ký tài khoản |

### 📊 Real-time Data

#### `GET /api/stats` - Lấy thống kê hiện tại
```json
{
    "current_pwr": 1.8,
    "temp": 24.5,
    "kwh_day": 14.5,
    "kwh_month": 420.8,
    "alert": false,
    "threshold": 5.0
}
```

#### `GET /api/realtime/current` - Dữ liệu thực tế
```json
{
    "timestamp": "2026-04-07T15:30:00",
    "current_pwr": 2.5,
    "temp": 25.2,
    "threshold": 5.0,
    "alert": false
}
```

#### `GET /api/realtime/alerts?limit=10` - Cảnh báo gần đây
```json
{
    "success": true,
    "alerts": [
        {
            "id": 1,
            "timestamp": "2026-04-07T14:00:00",
            "alert_type": "OVERLOAD",
            "device_name": "HVAC",
            "current_value": 6.2,
            "threshold_value": 5.0,
            "message": "Công suất vượt ngưỡng",
            "severity": "HIGH",
            "is_resolved": false
        }
    ]
}
```

### 🤖 Automation & Scheduling

#### `GET /api/automation/schedule` - Danh sách lịch trình
```json
{
    "schedules": [
        {
            "id": 1,
            "device_id": 1,
            "device_name": "HVAC",
            "day_of_week": "Everyday",
            "start_time": "08:00",
            "end_time": "22:00",
            "action": "OPTIMIZE"
        }
    ]
}
```

#### `POST /api/automation/schedule` - Thêm lịch trình
```json
{
    "device_id": 1,
    "device_name": "HVAC",
    "location": "Tầng mái",
    "day_of_week": "Everyday",
    "start_time": "08:00",
    "end_time": "22:00",
    "action": "OPTIMIZE"
}
```

#### `DELETE /api/automation/schedule/<id>` - Xóa lịch trình

#### `GET /api/automation/check-peak-hours` - Kiểm tra giờ cao điểm
```json
{
    "is_peak_hour": true,
    "current_hour": 19,
    "peak_start": 18,
    "peak_end": 21,
    "recommendation": "Nên tối ưu hóa công suất"
}
```

#### `POST /api/automation/eco-mode` - Kích hoạt chế độ ECO
```json
{
    "success": true,
    "message": "Chế độ ECO đã được kích hoạt",
    "affected_devices": [
        {"id": 1, "name": "HVAC", "power_reduction": "20%"},
        {"id": 2, "name": "Chiếu sáng", "power_reduction": "15%"}
    ],
    "estimated_power_saved_kw": 0.8
}
```

### 🧠 ML Prediction

#### `GET /api/prediction/next-hour` - Dự báo 1 giờ tới
```json
{
    "prediction": {
        "predicted_power_kw": 2.3,
        "confidence": 0.85,
        "predicted_hour": "20:00",
        "data_points": 168,
        "features": {
            "hour": 20,
            "temperature": 24.5,
            "humidity": 65.0,
            "occupancy": 2
        }
    }
}
```

#### `GET /api/prediction/daily` - Dự báo 24 giờ
```json
{
    "forecast": {
        "hourly_forecast": [1.2, 1.3, 1.1, ..., 2.5],
        "total_forecast_kwh": 45.2,
        "estimated_cost_vnd": 113000,
        "peak_hours": [18, 19, 20, 21],
        "low_hours": [0, 1, 2, 3, 4, 5]
    }
}
```

#### `GET /api/prediction/monthly` - Dự báo 30 ngày
```json
{
    "forecast": {
        "estimated_kwh": 1350,
        "estimated_cost_vnd": 3375000,
        "average_daily_kwh": 45,
        "weekly_breakdown": [315, 315, 315, 90]
    }
}
```

#### `GET /api/prediction/anomalies` - Phát hiện bất thường
```json
{
    "anomalies": [
        {
            "timestamp": "2026-04-05T14:00:00",
            "power_kw": 8.5,
            "threshold": 5.0,
            "deviation_factor": 2.1
        }
    ],
    "count": 3
}
```

### 🤖 AI Analysis (Gemini)

#### `POST /api/ai/gemini-analyze` - Phân tích với Gemini/Local AI
```json
Request:
{
    "query": "Phân tích xem hệ thống có đang lãng phí điện không?"
}

Response:
{
    "success": true,
    "response": "📊 **Phân tích Hệ Thống Năng Lượng**\n\n...",
    "source": "gemini_api" or "local_analysis",
    "recommendations": [
        {
            "type": "power_reduction",
            "severity": "HIGH",
            "message": "Công suất hiện tại cao hơn 50%...",
            "action": "Giảm tải từ HVAC",
            "potential_saving": 1.2
        }
    ],
    "data_snapshot": {
        "current_power_kw": 2.5,
        "current_temp": 24.5,
        "day_consumption_kwh": 35.2,
        "anomalies_detected": 2
    }
}
```

#### `GET /api/ai/recommendations` - Danh sách khuyến nghị
```json
{
    "recommendations": [
        {
            "type": "temperature_control",
            "severity": "MEDIUM",
            "message": "Nhiệt độ cao (26.5°C)",
            "action": "Đóng rèm, tắt thêm thiết bị sinh nhiệt",
            "potential_saving": 0.5
        }
    ]
}
```

### 📈 Analytics

#### `GET /api/analytics/device-breakdown?hours=24` - Phân tích theo thiết bị
```json
{
    "breakdown": [
        {
            "device_id": 3,
            "device_name": "Server",
            "location": "Tầng 02",
            "total": 115.2,
            "avg": 4.8,
            "max": 5.2
        }
    ]
}
```

#### `GET /api/analytics/statistics?hours=24` - Thống kê
```json
{
    "statistics": {
        "total_power": 120.5,
        "avg_power": 2.1,
        "max_power": 5.2,
        "min_power": 0.8,
        "avg_temp": 24.2,
        "avg_humidity": 65.5
    }
}
```

#### `GET /api/analytics/history?hours=24` - Lịch sử
```json
{
    "history": [
        {
            "timestamp": "2026-04-07T15:00:00",
            "device_name": "HVAC",
            "power_kw": 4.2,
            "temperature": 24.5
        }
    ],
    "count": 1440
}
```

### ⚙️ Settings

#### `GET /api/settings` - Lấy cài đặt
```json
{
    "threshold": 5.0,
    "price_per_kwh": 2500,
    "schedule_off": "22:00"
}
```

#### `POST /api/settings/update` - Cập nhật cài đặt
```json
{
    "threshold": 6.0,
    "price_per_kwh": 2500,
    "schedule_off": "23:00"
}
```

---

## 🎨 Frontend Components

### 1. **Automation.js** - Quản lý lịch trình
**Vị trí:** `static/Automation.js`

**Tính năng:**
- ✅ Xem danh sách lịch trình
- ✅ Thêm/xóa lịch trình
- ✅ Phát hiện giờ cao điểm tự động
- ✅ Kích hoạt chế độ ECO

**Component HTML cần có:**
```html
<div id="automation-schedules-list"></div>
<div id="peak-hour-indicator"></div>
<button id="btn-add-schedule">+ Thêm lịch trình</button>
<button id="btn-eco-mode">🌱 Chế độ ECO</button>
```

**Khởi tạo:**
```javascript
<script src="static/Automation.js"></script>
// automationManager được khởi tạo tự động
```

### 2. **GeminiAnalysis.js** - Phân tích AI
**Vị trí:** `static/GeminiAnalysis.js`

**Tính năng:**
- ✅ Chat với AI
- ✅ Phân tích dữ liệu năng lượng
- ✅ Khuyến nghị tối ưu hóa
- ✅ Xuất báo cáo

**Component HTML cần có:**
```html
<textarea id="analysis-query-input" placeholder="Hỏi giúp tôi..."></textarea>
<button id="btn-send-analysis">🚀 Gửi</button>
<div id="analysis-result"></div>
<div id="analysis-history"></div>
```

**Khởi tạo:**
```javascript
<script src="static/GeminiAnalysis.js"></script>
// geminiManager được khởi tạo tự động
```

### 3. **Settings.js** - Cài đặt nâng cao
**Vị trí:** `static/Settings.js`

**Tính năng:**
- ✅ Thay đổi ngưỡng cảnh báo
- ✅ Cập nhật giá tiền điện
- ✅ Quản lý cảnh báo
- ✅ Real-time monitoring

**Component HTML cần có:**
```html
<input id="threshold-input" type="number" min="1" max="15">
<input id="price-per-kwh-input" type="number" min="0">
<input id="schedule-off-input" type="time">
<div id="realtime-display"></div>
<div id="alerts-container"></div>
<button id="btn-apply-settings">💾 Lưu cài đặt</button>
```

**Khởi tạo:**
```javascript
<script src="static/Settings.js"></script>
// advancedSettings được khởi tạo tự động
```

### 4. **enhanced-ui.css** - Styling nâng cao
**Vị trí:** `static/enhanced-ui.css`

**Bao gồm:**
- Skeleton Loading animations
- Modal dialogs
- Cards & badges
- Real-time indicators
- Notifications

**Thêm vào HTML:**
```html
<link rel="stylesheet" href="static/enhanced-ui.css">
```

---

## ⚙️ Cấu Hình Gemini AI (Optional)

Để sử dụng Gemini AI thực tế thay vì local AI:

### 1. Lấy API Key
- Truy cập: https://makersuite.google.com/app/apikey
- Copy API Key

### 2. Đặt Environment Variable
```powershell
# Windows
$env:GEMINI_API_KEY = "your-api-key-here"

# Or thêm vào .env file
GEMINI_API_KEY=your-api-key-here
```

### 3. Backend sẽ tự động sử dụng Gemini nếu key có sẵn

---

## 🧪 Testing

### Run All Tests
```powershell
# Test API endpoints
. .\test_api.ps1

# Test features
python test_features.py

# Test HVAC system
python test_hvac.py
```

### Manual Testing Checklist

```powershell
# 1. Backend running?
python app.py

# 2. Login works?
# Truy cập 192.168.1.19:3000login
# Username: admin
# Password: 123

# 3. Dashboard loads?
# Click "Tổng quan" - See stats

# 4. Database working?
# Check data in tools like DB Browser
# Or: SELECT COUNT(*) FROM energy_consumption

# 5. Automation?
# Go to "Tự động hóa"
# Click "+ Thêm lịch trình"
# Fill form and save

# 6. AI Analysis?
# Go to "Phân tích Gemini"
# Type query and click "Gửi"
# Should see response

# 7. Settings?
# Go to "Cấu hình hệ thống"
# Change threshold to 4.0
# Click "Lưu cài đặt"
# Click "⚠️ Check Alert"
```

---

## 📚 Django/Flask Integration

### Add to Flask Templates

**dashboard.html additions:**
```html
<!-- Scripts -->
<script src="/static/Automation.js"></script>
<script src="/static/GeminiAnalysis.js"></script>
<script src="/static/Settings.js"></script>

<!-- CSS -->
<link rel="stylesheet" href="/static/enhanced-ui.css">

<!-- Components -->
<div id="automation-schedules-list"></div>
<div id="analysis-result"></div>
<div id="alerts-container"></div>
```

### Environment Setup

**.env file:**
```
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-in-production
GEMINI_API_KEY=your-gemini-api-key-optional
DATABASE_PATH=data/energy.db
```

---

## 📖 Developer Guide

### Adding New Device

1. **Add to database:**
```python
cursor.execute('''
    INSERT INTO energy_consumption 
    (device_id, device_name, location)
    VALUES (?, ?, ?)
''', (6, 'Elevators', 'Tầng mái'))
```

2. **Add to schedule options:**
```javascript
// In Automation.js - getAvailableDevices()
{ id: 6, name: 'Elevators', location: 'Tầng mái' }
```

### Creating New API Route

```python
@app.route('/api/custom-endpoint', methods=['GET', 'POST'])
@require_login
def custom_endpoint():
    try:
        data = request.get_json()
        # Your logic here
        return jsonify({'success': True, 'data': result}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

### Querying Database

```python
# Get all data
history = db_helper.get_energy_history(hours=24)

# Filter by device
hvac_data = db_helper.get_energy_history(hours=168, device_id=3)

# Get statistics
stats = db_helper.get_energy_statistics(hours=24)

# Get settings
threshold = db_helper.get_setting('threshold_power_kw')
```

---

## 🐛 Troubleshooting

### Error: "ModuleNotFoundError: No module named 'db_helper'"

**Solution:**
```powershell
# Make sure db_helper.py exists in project root
ls db_helper.py

# If not, restart Python kernel
# Restart Flask: Ctrl+C then 'python app.py'
```

### Error: "Database is locked"

**Solution:**
```powershell
# Close all connections
# Delete data/energy.db-journal if exists
rm data/energy.db-journal

# Restart Flask
```

### Error: "CORS error - Failed to fetch"

**Solution:**
```powershell
# Check if CORS is enabled in app.py lines 17-23
# Restart Flask
# Clear browser cache (Ctrl+Shift+Delete)
```

### Error: "Template not found"

**Solution:**
```powershell
# Make sure all HTML files in templates/ folder
# Restart Flask
# Check template names match render_template() calls
```

### Gemini AI not responding

**Solution:**
```powershell
# Check API key is set
echo $env:GEMINI_API_KEY

# Verify API key is valid
# If not, falls back to local AI automatically
```

---

## 📞 Support

**Issues?** Check:
1. Terminal output for Python exceptions
2. Browser console (F12) for JavaScript errors
3. Network tab (F12 → Network) for API failures
4. Database browser to verify data

**Reset Everything:**
```powershell
# Stop Flask (Ctrl+C)
rm data/energy.db
python init_db.py
python app.py
```

---

## 📝 Changelog

### V2.1.0 (Current)
- ✅ SQLite Database integration
- ✅ Automation scheduling
- ✅ ML forecasting (scikit-learn)
- ✅ Gemini AI analysis
- ✅ Real-time monitoring
- ✅ Advanced settings with database persistence
- ✅ Skeleton loading UI
- ✅ Enhanced error handling

### V2.0.0 (Previous)
- Flask backend with in-memory data
- Basic dashboard
- API endpoints

### V1.0.0 (Initial)
- HTML/CSS responsive design
- Basic visualization

---

## 📄 License & Attribution

**Project:** Smart Energy Dashboard V2.1  
**Author:** Hoàng (Smart Building Research)  
**Type:** Educational/Research Project  
**Stack:** Python 3.x, Flask, scikit-learn, SQLite  
**Last Update:** 2026-04-07

---

**✅ Hệ thống sẵn sàng sử dụng!**
