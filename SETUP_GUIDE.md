# 🚀 HƯỚNG DẪN KHẮC PHỤC LỖI VÀ CHẠY HỆ THỐNG

## 📋 Các lỗi đã sửa:

✅ **CORS Error**: Thêm `flask-cors` vào app.py  
✅ **KeyError: 'today_kwh'**: Sửa get_stats() với safe defaults  
✅ **Backend Connection**: Tất cả API routes đã được update với @require_login  
✅ **API Error Handling**: Thêm try-catch để return 200 thay vì 500

---

## 🔧 BƯỚC 1: Chuẩn bị môi trường

### Windows PowerShell - Bypass ExecutionPolicy

```powershell
# 1. Mở PowerShell AS ADMINISTRATOR (Chạy dưới quyền Admin)

# 2. Chạy lệnh này để cho phép chạy script
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 3. Xác nhận bằng cách gõ: Y (Yes)
# Lúc này bạn có thể kích hoạt virtual environment

# 4. Di chuyển đến thư mục dự án
cd "d:\wed toà nhà thông minh"

# 5. Kích hoạt virtual environment
.\.venv\Scripts\Activate.ps1

# Nếu vẫn gặp lỗi, thử cách khác:
powershell -ExecutionPolicy Bypass -File .\.venv\Scripts\Activate.ps1
```

---

## 🔧 BƯỚC 2: Cài đặt Dependencies

```powershell
# Sau khi kích hoạt venv, cài đặt Flask và flask-cors
pip install -r requirements.txt

# Hoặc cài một lần:
pip install Flask==2.3.0 flask-cors==4.0.0 werkzeug==2.3.0 scikit-learn==1.3.0 numpy==1.24.0
```

---

## 🚀 BƯỚC 3: Chạy Backend Flask

```powershell
# Chắc chắn bạn đang ở trong thư mục dự án với venv được kích hoạt
cd "d:\wed toà nhà thông minh"

# Chạy Flask app
python app.py

# Hoặc với debug mode (để reload tự động)
python -m flask run --debug
```

**Kết quả kỳ vọng:**
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:3000
Press CTRL+C to quit
```

---

## 🌐 BƯỚC 4: Truy cập Dashboard

### ✅ Mở trình duyệt:
```
192.168.1.19:3000login

# Hoặc
http://192.168.1.19:3000/login
```

### ✅ Đăng nhập với credentials:
- **Username**: admin  
- **Password**: 123

Hoặc:
- **Username**: user  
- **Password**: 123

---

## 📊 KHÁC CHI TIẾT CỐI FIX

### 1. Flask CORS Configuration
```python
# Đã thêm vào app.py (line ~19)
from flask_cors import CORS

CORS(app, 
     resources={r"/api/*": {"origins": "*"}},
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"],
     supports_credentials=True)
```

### 2. get_stats() - Safe Defaults
```python
# Bây giờ có full error handling:
- Kiểm tra None values và return defaults
- Try-catch bao quanh toàn bộ logic
- Return 200 thay vì 500 để frontend không crash
```

### 3. API Routes được update
- ✅ `/api/user` - get current user info
- ✅ `/api/stats` - get dashboard statistics  
- ✅ `/api/devices` - get device list
- ✅ `/api/settings` - get system settings
- ✅ `/api/settings/update` - update settings
- ✅ `/api/ai-chat` - AI assistant

---

## 🐛 TROUBLESHOOTING

### ❌ Lỗi: "Cannot find flask-cors"
```powershell
pip install flask-cors --upgrade
```

### ❌ Lỗi: "Port 5000 already in use"
```powershell
# Tìm process đang dùng port 5000
netstat -ano | findstr :3000

# Kill process (copy PID từ kết quả trên)
taskkill /PID <PID> /F

# Hoặc chạy Flask trên port khác
python app.py --port 5001
```

### ❌ Lỗi: "KeyError: today_kwh"
```python
# Không còn lỗi này vì đã fix get_stats()
# Nhưng nếu vẫn gặp, kiểm tra system_data:
print(system_data)  # In ra console để debug
```

### ❌ Lỗi: "Unauthorized" khi gọi API
```
→ Bạn chưa đăng nhập
→ Hãy login ở 192.168.1.19:3000login trước
```

---

## 📱 API Endpoint Test (cURL hoặc Postman)

### Lấy Stats
```bash
curl -X GET 192.168.1.19:3000api/stats \
  -H "Content-Type: application/json"
```

### Lấy Devices
```bash
curl -X GET 192.168.1.19:3000api/devices \
  -H "Content-Type: application/json"
```

### AI Chat
```bash
curl -X POST 192.168.1.19:3000api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tổng công suất?"}'
```

---

## ✅ CHECKLIST HOÀN TẤT

- [ ] Mở PowerShell AS ADMIN
- [ ] Set-ExecutionPolicy RemoteSigned
- [ ] Kích hoạt .venv
- [ ] pip install -r requirements.txt
- [ ] python app.py
- [ ] Mở 192.168.1.19:3000login
- [ ] Đăng nhập với admin/123
- [ ] Xem dashboard tải dữ liệu ✅

---

## 📞 Nếu còn lỗi:

1. Kiểm tra Console (F12 → Console tab)
2. Kiểm tra Terminal nơi chạy Flask
3. Xem logs: `print()` statements trong app.py
4. Kiểm tra Network tab để xem requests đến API

**Chúc bạn thành công! 🎉**
