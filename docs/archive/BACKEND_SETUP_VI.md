# 🚀 Hệ Thống Smart Energy - Hướng Dẫn Nâng Cấp Hoàn Chỉnh

## Tổng Quan

Hệ thống Smart Energy Dashboard của bạn đã được nâng cấp với **Node.js Express backend** bổ sung:
- ✅ Giám sát năng lượng thực thời
- ✅ Phân tích dữ liệu lịch sử  
- ✅ Phát hiện bất thường
- ✅ Phân tích dự đoán
- ✅ Cập nhật trực tiếp WebSocket
- ✅ Kiến trúc có thể mở rộng

**Quan trọng**: Ứng dụng Flask hiện tại và UI vẫn **hoàn toàn nguyên vẹn**. Nâng cấp này thêm một lớp API Node.js song song.

---

## Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────┐
│          Trình Duyệt (HTML/CSS/JavaScript)              │
│     Smart Energy Dashboard (KHÔNG THAY ĐỔI)            │
└────────────┬────────────────────────────────────────┬───┘
             │                                        │
             ▼ (gọi API fetch)                        ▼
    ┌──────────────────┐                    ┌──────────────────┐
    │ Backend Flask    │                    │ Backend Node.js  │
    │ (cổng 3000)      │                    │ (cổng 3000)      │
    │                  │                    │ ✨ MỚI ✨         │
    │ - Xác thực       │                    │                  │
    │ - Render UI      │                    │ - Dữ liệu thực   │
    └──────────────────┘                    │ - API Lịch sử    │
                                              │ - Phát hiện BT   │
            Lớp Dữ Liệu                     │ - Dự đoán        │
         (File JSON)                        │ - WebSocket      │
                                              └──────────────────┘
```

---

## Các Bước Cài Đặt

### 1. Cài Đặt Node.js
- Tải từ https://nodejs.org/ (khuyên dùng phiên bản LTS)
- Kiểm tra cài đặt:
  ```bash
  node --version
  npm --version
  ```

### 2. Setup Backend

```bash
# Đi tới folder backend
cd "D:\wed_toa_nha_thong_minh\backend"

# Cài đặt dependencies
npm install

# Cài đặt:
# - express (web framework)
# - cors (hỗ trợ cross-origin)
# - ws (WebSocket)
# - dotenv (cấu hình)
```

### 3. Chạy Backend Server

```bash
# Chế độ phát triển (tự reload khi file thay đổi)
npm run dev

# Hoặc chế độ production
npm start
```

Bạn sẽ thấy:
```
🚀 Smart Energy Backend chạy trên http://192.168.1.19:3000
📊 Các API:
   GET /api/energy/realtime - Công suất & nhiệt độ hiện tại
   GET /api/energy/history - Tiêu thụ lịch sử
   GET /api/energy/anomaly - Phát hiện bất thường
   GET /api/energy/prediction - Dự đoán tiêu thụ
   GET /api/energy/analytics - Phân tích dashboard
🔌 WebSocket: ws://192.168.1.19:3000
```

### 4. Giữ Server Flask Chạy

Trong **terminal khác**:
```bash
cd "d:\wed toà nhà thông minh"

# Kích hoạt virtual environment
.\.venv\Scripts\Activate.ps1

# Chạy Flask
python app.py
```

Flask chạy trên: **http://192.168.1.19:3000**

---

## Kiểm Tra Tích Hợp

### Kiểm Tra 1: Kiểm Tra Sức Khỏe Backend
```bash
# Trong PowerShell hoặc terminal bất kỳ
Invoke-WebRequest -Uri "http://192.168.1.19:3000/health" | ConvertFrom-Json
```

### Kiểm Tra 2: Lấy Dữ Liệu Thực Thời
```bash
curl http://192.168.1.19:3000/api/energy/realtime
```

### Kiểm Tra 3: Mở Dashboard
1. Mở trình duyệt: **http://192.168.1.19:3000**
2. Mở Console (F12 → Console tab)
3. Bạn sẽ thấy:
   ```
   🎯 Smart Energy Dashboard loaded - APIs ready
   🔴 WebSocket connected
   📊 Realtime data: {...}
   ```

### Kiểm Tra 4: Kiểm Tra Lỗi Console
- Nhấn **F12** trong trình duyệt
- Đi tới **Console** tab
- Xem API calls và dữ liệu đăng nhập
- Bất kỳ lỗi nào sẽ giúp gỡ lỗi

---

## Ví Dụ Sử Dụng API

### JavaScript (trong Console Trình Duyệt)

```javascript
// Lấy dữ liệu thực thời
energyAPI.getRealtimeData().then(data => {
  console.log('Công suất:', data.current_power, 'kW');
  console.log('Nhiệt độ:', data.temperature, '°C');
});

// Lấy dữ liệu lịch sử
energyAPI.getHistoryData(30, 'Sảnh chính').then(data => {
  console.log('Tiêu thụ hàng ngày:', data.daily_consumption);
  console.log('Tổng:', data.total_consumption, 'kWh');
});

// Lấy bất thường
energyAPI.getAnomalyData(1.5).then(data => {
  console.log('Bất thường tìm thấy:', data.anomaly_count);
  console.log('Danh sách:', data.anomalies);
});

// Lấy dự đoán
energyAPI.getPredictionData().then(data => {
  console.log('Dự đoán tiếp theo:', data.predicted_next_consumption);
  console.log('Giờ cao điểm:', data.peak_hours);
  console.log('Thiết bị hàng đầu:', data.top_devices);
});

// Lấy phân tích
energyAPI.getAnalyticsData().then(data => {
  console.log('Tiêu thụ hàng ngày:', data.daily_all, 'kWh');
  console.log('Phân bổ thiết bị:', data.device_breakdown);
});
```

### cURL (trong Terminal)

```bash
# Dữ liệu thực thời
curl http://192.168.1.19:3000/api/energy/realtime

# Dữ liệu lịch sử (30 ngày cuối)
curl "http://192.168.1.19:3000/api/energy/history?days=30"

# Dữ liệu lịch sử cho thiết bị cụ thể
curl "http://192.168.1.19:3000/api/energy/history?days=30&device=Sảnh%20chính"

# Phát hiện bất thường
curl "http://192.168.1.19:3000/api/energy/anomaly?threshold=1.5"

# Dự đoán
curl http://192.168.1.19:3000/api/energy/prediction

# Phân tích
curl http://192.168.1.19:3000/api/energy/analytics
```

---

## Cấu Trúc Tệp

```
D:\wed_toa_nha_thong_minh\
├── backend\                    ✨ FOLDER MỚI
│   ├── server.js              # Express backend + tất cả API
│   ├── package.json           # Dependencies
│   ├── .env                   # Configuration
│   └── README.md              # Tài liệu backend
│
├── templates\
│   └── index.html             # ✏️ SỬA ĐỔI: Thêm script API client
│
├── static\
│   ├── api-client.js          # ✨ MỚI: Frontend API client
│   ├── main.js                # (không thay đổi)
│   └── style.css              # (không thay đổi)
│
├── app.py                     # (không thay đổi - Flask vẫn hoạt động)
├── data\
│   └── energy_data.json       # (được backend sử dụng)
│
└── BACKEND_SETUP.md           # ✨ MỚI: Tệp này
```

---

## Những Gì Thay Đổi? Những Gì Không Thay Đổi?

### ✅ VẪN HOẠT ĐỘNG
- Tất cả HTML/CSS hiện tại (100% nguyên vẹn)
- Tất cả route Python Flask
- Tất cả xác thực
- Tất cả tệp dữ liệu
- Trải nghiệm người dùng (UI không thay đổi)

### ✨ MỚI ĐƯỢC THÊM
- Backend Node.js Express (`/backend/` folder)
- 5 API REST mới cho phân tích
- Cập nhật WebSocket thực thời
- Xử lý dữ liệu nâng cao (phát hiện bất thường, dự đoán)
- Thư viện API client JavaScript

### ⚠️ SỬA ĐỔI TỐI THIỂU
- `templates/index.html`: Thêm 2 script tags (api-client.js + ví dụ sử dụng)
- Đó là tất cả! Không có thay đổi cấu trúc HTML!

---

## Gỡ Lỗi

### Vấn Đề: "Cannot find module 'express'"
**Giải pháp**: 
```bash
cd backend
npm install
```

### Vấn Đề: "Port 3000 đã được sử dụng"
**Giải pháp**: 
```bash
# Windows - Tìm và kill process trên port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Hoặc thay đổi port trong .env
PORT=3001
```

### Vấn Đề: "Kết nối WebSocket thất bại"
**Giải pháp**: 
- Đảm bảo backend server đang chạy
- Kiểm tra tường lửa không chặn port 3000
- Kiểm tra console trình duyệt (F12) để xem lỗi mạng

### Vấn Đề: "API trả về null"
**Giải pháp**:
- Xác minh backend đang chạy: `curl http://192.168.1.19:3000/health`
- Kiểm tra `/data/energy_data.json` tồn tại
- Kiểm tra console trình duyệt để lỗi mạng (F12)

### Vấn Đề: "Lỗi CORS"
**Giải pháp**:
- Backend đã bật CORS (nên hoạt động)
- Nếu vẫn có vấn đề, thêm vào frontend (nếu cần):
  ```javascript
  fetch(url, {
    mode: 'cors',
    credentials: 'include'
  })
  ```

---

## Hiệu Năng & Thực Hành Tốt Nhất

### Gợi Ý Tối Ưu Hóa

1. **Bộ Nhớ Đệm**: API trả về dữ liệu mới mỗi lần gọi
   - Xem xét bộ nhớ đệm trong frontend cho các lệnh gọi lặp lại
   - Sử dụng `sessionStorage` để bộ nhớ đệm cấp phiên

2. **WebSocket**: Cập nhật mỗi 2 giây
   - Có thể cấu hình trong `backend/.env` → `WS_UPDATE_INTERVAL`
   - Giảm tần suất để giảm sử dụng băng thông

3. **Kích Thước Dữ Liệu**: 
   - Tập dữ liệu lớn có thể làm chậm
   - Sử dụng tham số `days` để giới hạn dữ liệu lịch sử

4. **Xử Lý Lỗi**:
   - Tất cả lỗi được hiển thị trong console trình duyệt
   - Alert lỗi không xâm phạm (không phá vỡ UI)
   - API client tự động thử lại WebSocket

---

## Bước Tiếp Theo

### Để Mở Rộng Backend:

1. **Thêm Cơ Sở Dữ Liệu** (MongoDB/PostgreSQL)
   - Thay thế tệp JSON bằng DB thực
   - Bật lưu trữ dữ liệu liên tục

2. **Thêm Xác Thực** 
   - Tích hợp với xác thực Flask
   - Thêm xác minh API key

3. **Thêm Nhiều API**
   - Điểm cuối điều khiển thiết bị
   - Quản lý cài đặt
   - Tùy chọn người dùng

4. **Cải Thiện Dự Đoán**
   - Mô hình học máy
   - Phân tích theo mùa
   - Dự báo nhiều tuần

---

## Hỗ Trợ & Tài Liệu

- **Backend README**: `backend/README.md`
- **Hướng Dẫn Ban Đầu**: `.github/copilot-instructions.md`
- **Mã Nguồn API Client**: `static/api-client.js` (tự giải thích)

---

## TÓM TẮT

✅ **Dashboard của bạn bây giờ được nâng cấp với khả năng backend cấp doanh nghiệp**

- Hệ thống hiện tại hoạt động chính xác như trước
- Backend Node.js mới xử lý phân tích & dự đoán
- WebSocket cung cấp cập nhật trực tiếp thực thời
- Kiến trúc hoàn toàn có thể mở rộng sẵn sàng để phát triển

**Chạy cả hai server và thưởng thức! 🎉**

```bash
# Terminal 1: Node.js Backend
cd backend && npm run dev

# Terminal 2: Flask Frontend  
python app.py

# Mở: http://192.168.1.19:3000
```
