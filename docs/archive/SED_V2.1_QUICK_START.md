# 🚀 SED V2.1 - Quick Start Guide (5 Phút)

**Phiên bản:** 2.1.0  
**Cập nhật:** 2026-04-07  
**Trạng thái:** ✅ Production Ready

---

## ⚡ 5 Bước Để Chạy Hệ Thống

### Bước 1️⃣: Mở PowerShell
```powershell
cd "d:\wed toà nhà thông minh"
```

### Bước 2️⃣: Kích Hoạt Virtual Environment
```powershell
. .\.venv\Scripts\Activate.ps1
```

### Bước 3️⃣: Khởi Tạo Database (Lần Đầu)
```powershell
python init_db.py

# Chọn 'y' để thêm dữ liệu mẫu
```

**Output:**
```
✅ Database initialized at: D:\wed_toa_nha_thong_minh\data\energy.db
✅ Inserted sample data for 5 devices × 168 hours
```

### Bước 4️⃣: Chạy Backend
```powershell
python app.py

# Đợi cho tới khi thấy:
# Running on http://127.0.0.1:3000
```

### Bước 5️⃣: Mở Trình Duyệt
Truy cập: **192.168.1.19:3000login**

**Đăng nhập với:**
- Username: `admin`
- Password: `123`

---

## ✅ Kiểm Tra Nhanh

```powershell
# Test API trong PowerShell mới
. .\test_api.ps1

# Kết quả mong đợi:
# ✓ Backend is running - HTTP Status: 200
# ✓ Response Status: 200
# ✓ Response: {...}
```

---

## 📊 Tính Năng Chính

| Tính Năng | Truy Cập | Mô Tả |
|-----------|----------|-------|
| **📊 Tổng Quan** | Dashboard chính | Xem stats theo thời gian thực |
| **🤖 Tự Động Hóa** | Menu sidebar | Thêm lịch trình bật/tắt thiết bị |
| **🧠 Phân Tích AI** | Menu sidebar | Chat với Gemini AI |
| **⚙️ Cài Đặt** | Menu sidebar | Thay đổi ngưỡng cảnh báo |
| **📈 Phân Tích** | Menu sidebar | Xem biểu đồ & dự báo |

---

## 🔥 Các Điều Cần Thử

### 1. Tự Động Hóa
```
1. Click "Tự Động Hóa" → Tab automation
2. Click "+ Thêm Lịch Trình"
3. Chọn thiết bị: "HVAC"
4. Ngày: "Everyday"
5. Thời gian: 08:00 - 22:00
6. Hành động: "OPTIMIZE"
7. Click "✅ Lưu" → ✅ Lịch trình được thêm!
```

### 2. Phân Tích AI
```
1. Click "Phân Tích Gemini" → Tab gemini
2. Click một trong các câu hỏi nhanh:
   - "📊 Phân tích lãng phí"
   - "💡 Gợi ý tiết kiệm"
   - "📈 Dự báo tuần tới"
3. Thấy kết quả phân tích từ AI
4. Xem các khuyến nghị cụ thể
5. Click "📥 Xuất báo cáo" để tải file JSON
```

### 3. Cài Đặt
```
1. Click "Cấu Hình Hệ Thống" → Tab settings
2. Thay đổi "Ngưỡng Cảnh Báo" → ví dụ: 4.0 kW
3. Thay đổi "Giá Điện" → ví dụ: 2500 ₫/kWh
4. Click "💾 Lưu Cài Đặt" → ✅ Cập nhật thành công!
5. Xem "Trạng Thái Thực Tế" cập nhật tự động
```

### 4. Dự Báo ML
```
1. Call API trong PowerShell:
   $response = Invoke-WebRequest 192.168.1.19:3000api/prediction/daily
   $response.Content | ConvertFrom-Json | Select -Expand forecast

2. Xem dự báo tiêu thụ 24 giờ
3. Xem tổng chi phí ước tính
```

---

## 📁 Cấu Trúc File

```
D:\wed_toa_nha_thong_minh\
├── app.py                      ← Flask Backend (chính)
├── init_db.py                  ← Khởi tạo Database
├── db_helper.py                ← Database Helper
├── ml_predictor.py             ← ML Prediction
├── requirements.txt            ← Dependencies
├── data/
│   └── energy.db              ← SQLite Database
├── templates/
│   ├── dashboard.html         ← Main UI
│   ├── login.html
│   ├── index.html
│   └── ...
├── static/
│   ├── Automation.js          ← NEW: Automation Component
│   ├── GeminiAnalysis.js       ← NEW: AI Component
│   ├── Settings.js            ← NEW: Settings Component
│   ├── enhanced-ui.css        ← NEW: Styling
│   ├── main.js
│   ├── style.css
│   └── ...
└── docs/
    ├── SED_V2.1_COMPLETE_GUIDE.md    ← Đầy đủ
    ├── HTML_INTEGRATION_GUIDE.md      ← HTML examples
    └── SED_V2.1_QUICK_START.md        ← This file
```

---

## 🔑 Database Tables

```sql
-- Xem dữ liệu:
SELECT * FROM energy_consumption LIMIT 10;        -- Tiêu thụ
SELECT * FROM device_schedule;                    -- Lịch trình
SELECT * FROM alerts WHERE is_resolved = 0;       -- Cảnh báo chưa xử lý
SELECT * FROM ai_analysis ORDER BY timestamp DESC; -- Phân tích AI
```

---

## 🛠️ Troubleshooting Nhanh

| Vấn đề | Giải Pháp |
|-------|----------|
| "Connection refused" | Chạy: `python app.py` |
| "Module not found" | Chạy: `pip install -r requirements.txt` |
| "Database locked" | Chạy: `rm data/energy.db` rồi `python init_db.py` |
| "CORS error" | Refresh browser: Ctrl+Shift+Delete |
| "401 Unauthorized" | Logout rồi login lại với admin/123 |
| "Template not found" | Restart Flask: Ctrl+C → `python app.py` |

---

## 📊 API Endpoints (Chính)

```powershell
# Get Stats
Invoke-WebRequest 192.168.1.19:3000api/stats

# Get Schedules
Invoke-WebRequest 192.168.1.19:3000api/automation/schedule

# Add Schedule
$body = @{
    device_id = 1
    device_name = "HVAC"
    location = "Tầng mái"
    day_of_week = "Everyday"
    start_time = "08:00"
    end_time = "22:00"
    action = "OPTIMIZE"
} | ConvertTo-Json

Invoke-WebRequest 192.168.1.19:3000api/automation/schedule -Method POST -Body $body

# AI Analysis
$query = @{query = "Phân tích năng lượng"} | ConvertTo-Json
Invoke-WebRequest 192.168.1.19:3000api/ai/gemini-analyze -Method POST -Body $query

# Predict Next Hour
Invoke-WebRequest 192.168.1.19:3000api/prediction/next-hour

# Get Recommendations
Invoke-WebRequest 192.168.1.19:3000api/ai/recommendations
```

---

## 🎯 Hoàn Thành Checklist

Để xác nhận hệ thống chạy tốt:

- [ ] Backend chạy: `python app.py`
- [ ] Database tạo: `data/energy.db` tồn tại
- [ ] Login hoạt động: admin/123
- [ ] Dashboard load: Thấy stats cards
- [ ] Automation tab: Hiển thị lịch trình
- [ ] Gemini tab: Có thể gửi câu hỏi
- [ ] Settings tab: Có thể thay đổi ngưỡng
- [ ] Cảnh báo: Hiển thị trong settings
- [ ] API test: `test_api.ps1` thành công

---

## 💡 Mẹo Hữu Ích

### 1. Real-time Updates
Dashboard cập nhật tự động mỗi 30 giây. Nếu muốn nhanh hơn, sửa:
```javascript
// Trong Automation.js, Settings.js, GeminiAnalysis.js
setInterval(() => {...}, 30000);  // Đổi thành 5000 (5 giây)
```

### 2. Export Data
```powershell
# Export database to CSV
sqlite3 data/energy.db ".mode csv" ".output data/export.csv" "SELECT * FROM energy_consumption;"
```

### 3. Database Backup
```powershell
# Backup database
Copy-Item data/energy.db "data/energy.db.backup-$(Get-Date -Format yyyyMMdd-HHmmss)"
```

### 4. Enable Gemini AI
```powershell
# Set Gemini API Key
$env:GEMINI_API_KEY = "your-api-key-here"

# Restart Flask
# Ctrl+C
# python app.py
```

---

## 📞 Cần Giúp Đỡ?

### 1. Check Logs
```powershell
# Terminal output khi chạy Flask
# Tìm dòng chứa ERROR hoặc Exception

# Browser Console (F12 → Console)
# Tìm red errors
```

### 2. Clear Cache
```powershell
# Browser
# Ctrl+Shift+Delete → Clear Everything

# Flask Cache
# Ctrl+C (stop server)
# rm __pycache__/ -Recurse
# python app.py
```

### 3. Reset Everything
```powershell
# Stop Flask: Ctrl+C
rm data/energy.db
python init_db.py
python app.py
# Then Open: 192.168.1.19:3000login
```

---

## 📚 Tài Liệu Chi Tiết

- **Hướng dẫn đầy đủ:** `SED_V2.1_COMPLETE_GUIDE.md`
- **HTML Integration:** `HTML_INTEGRATION_GUIDE.md`
- **API Documentation:** `API_DOCUMENTATION.md`
- **Setup Guide:** `SETUP_GUIDE.md`

---

## 🎉 Chúc Mừng!

Bạn đã cài đặt **SED V2.1** thành công! 

**Tiếp theo:**
1. Khám phá các tính năng trong Dashboard
2. Tạo lịch trình tự động hóa
3. Sử dụng AI để phân tích năng lượng
4. Theo dõi dự báo tiêu thụ
5. Tối ưu hóa chi phí điện

---

**✅ Happy Energy Optimization! 🌱⚡**

---

**Questions?** Kiểm tra các file documentation hoặc restart Flask.

**Last Updated:** 2026-04-07  
**Version:** 2.1.0
