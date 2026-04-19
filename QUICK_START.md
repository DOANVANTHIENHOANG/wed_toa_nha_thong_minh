# ⚡ QUICK START - SED V2.1

## 🎯 Nếu bạn vội, chỉ cần làm này:

### 1️⃣ Mở PowerShell AS ADMIN

```powershell
# Nhấp chuột phải trên PowerShell → "Run as Administrator"
```

### 2️⃣ Chạy các lệnh này (copy-paste liên tiếp):

```powershell
# Cho phép chạy script
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# Chọn Y (Yes)

# Di chuyển đến thư mục dự án
cd "d:\wed toà nhà thông minh"

# Kích hoạt virtual environment
.\.venv\Scripts\Activate.ps1

# Cài đặt các thư viện (nếu chưa có)
pip install Flask flask-cors werkzeug scikit-learn numpy

# Chạy Flask server
python app.py
```

### 3️⃣ Mở trình duyệt:

```
http://192.168.1.19:3000/login
```

### 4️⃣ Đăng nhập:

| Field | Value |
|-------|-------|
| Username | admin |
| Password | 123 |

✅ **Xong! Bạn sẽ thấy Dashboard với dữ liệu từ Backend.**

---

## 🔍 Kiểm tra xem Backend đã chạy chưa:

Nếu thấy dòng này trong PowerShell:
```
 * Running on http://127.0.0.1:3000
```

→ Backend đang chạy ✅

---

## ❌ Nếu gặp lỗi:

| Lỗi | Giải pháp |
|-----|----------|
| `"Cannot find flask-cors"` | `pip install flask-cors` |
| `"Module not found: sklearn"` | `pip install scikit-learn` |
| `"Port 5000 already in use"` | Đóng ứng dụng khác dùng port 5000, hoặc thử port 5001: `python app.py --port 5001` |
| `"Permission denied"` | Mở PowerShell AS ADMIN |
| `-ExecutionPolicy` error | Đã chạy: `Set-ExecutionPolicy RemoteSigned` chưa? |

---

## 📚 Tài liệu chi tiết:

- 📖 **SETUP_GUIDE.md** - Hướng dẫn chi tiết từng bước
- 📚 **API_DOCUMENTATION.md** - Tất cả API endpoints
- 📋 **Copilot-Instructions.md** - Thông tin dự án

---

**Chúc bạn thành công! 🚀**
