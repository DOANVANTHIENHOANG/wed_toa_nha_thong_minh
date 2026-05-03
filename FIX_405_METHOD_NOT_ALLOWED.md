# ✅ FIX: Lỗi 405 Method Not Allowed

## 🔴 **Vấn Đề**
- Khi nhấn nút submit ở trang Đăng ký (/register), trình duyệt bị chuyển hướng sang trang trắng
- HTTP Status: **405 Method Not Allowed**
- Nguyên nhân: Form gửi POST request đến `/register`, nhưng route chỉ chấp nhận GET

---

## ✅ **Giải Pháp**

### **1️⃣ PHẦN 1: Backend (app.py)**

**Vấn đề cũ:**
```python
@app.route('/register')
def register_page():
    return render_template('register.html')
    # ❌ Chỉ chấp nhận GET, POST gây lỗi 405
```

**Fix mới:**
```python
@app.route('/register', methods=['GET', 'POST'])  # ✅ Thêm POST
def register_page():
    """
    GET: Hiển thị form đăng ký
    POST: Xử lý dữ liệu từ form đăng ký
    """
    if request.method == 'GET':
        # Trả về giao diện form đăng ký
        return render_template('register.html')
    
    elif request.method == 'POST':
        # Xử lý form submission
        try:
            data = request.get_json() or request.form
            
            # ... xác thực 3 lớp (tương tự /api/auth/register) ...
            
            # Nếu thành công trả về JSON
            return jsonify({
                "success": True,
                "message": "Đăng ký thành công!",
                "redirect": "/login",
                "data": {...}
            }), 201
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
```

**Chi tiết:**
- ✅ Route chấp nhận `GET` và `POST`
- ✅ GET: render form (return HTML)
- ✅ POST: xử lý data (return JSON)
- ✅ Validation 3 lớp: input + database + password

---

### **2️⃣ PHẦN 2: Frontend (templates/register.html)**

**Vấn đề cũ:**
- Form gọi `onsubmit="doRegister(event)"` ✅ (đúng)
- JavaScript có `event.preventDefault()` ✅ (đúng)
- Nhưng fetch gọi `/api/auth/register` ❌ (có thể gây nhầm lẫn)

**Fix mới:**

#### A. HTML Form Tag
```html
<!-- TRƯỚC -->
<form id="register-form" onsubmit="doRegister(event)" autocomplete="off">

<!-- SAU -->
<form id="register-form" onsubmit="doRegister(event)" autocomplete="off" novalidate>
```
✅ Thêm `novalidate` để bỏ qua validation mặc định của HTML5 (dùng validation custom)

#### B. Dropdown Address (Visible)
```html
<!-- TRƯỚC: Dropdown bị ẩn (display: none) -->
<div class="form-group" id="address-dropdown-wrapper" style="display: none;">
  <select id="reg_address_select" ...>...</select>
</div>

<!-- SAU: Dropdown hiển thị -->
<div class="form-group">
  <select id="reg_address_select" ...>...</select>
</div>
```
✅ Loại bỏ `display: none` để dropdown address hiển thị

#### C. JavaScript Fetch URL
```javascript
// TRƯỚC
fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({...})
})

// SAU
fetch('/register', {  // ✅ Gọi /register thay vì /api/auth/register
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        fullname: fullname,
        contact: contact,
        meter_code: meter_id,
        room_code: room_code,
        address: address,
        password: password
    })
})
```

#### D. Đặc tính JavaScript (GIỮ NGUYÊN)
```javascript
✅ event.preventDefault() - Chặn submit mặc định
✅ fetch() - Gửi POST request (không reload trang)
✅ Validation client-side trước khi gửi
✅ window.location.href = '/login' - Redirect sau thành công
```

---

## 🔄 **Luồng Hoạt Động (Sau Fix)**

```
1. User mở /register
   ↓
2. Backend: GET /register 
   ↓ (render HTML form)
   ← 200 OK - Form page loaded

3. User điền thông tin + click "Đăng Ký Ngay"
   ↓
4. JavaScript: onsubmit="doRegister(event)"
   ├─ event.preventDefault() ✅ (chặn reload)
   ├─ Validation client-side (fullname, password, etc.)
   ├─ fetch('/register', { method: 'POST', ...}) ✅
   ↓
5. Backend: POST /register
   ├─ Nhận JSON data
   ├─ Validation 3 lớp (input + database + password)
   ├─ Tạo user (hash password, save vào users_db)
   ↓ (if success)
   ← 201 Created + JSON response
   
6. Frontend: JavaScript xử lý response
   ├─ data.success === true
   ├─ showError('✓ Đăng ký thành công!', 'success')
   ├─ setTimeout 1.5s
   ├─ window.location.href = '/login' ✅
   ↓
7. User redirect tới /login page ✅
```

---

## 🧪 **Cách Test**

### **Test 1: Manual - Browser Form**
1. Truy cập: http://localhost:3000/register
2. Điền thông tin device hợp lệ:
   - Họ tên: `Nguyễn Văn Anh`
   - Email: `john@example.com`
   - Mã Phòng: `CB-L1-1`
   - Mã Công Tơ: `CT-L1-001`
   - Địa chỉ: `Quận Thanh Khê` (dropdown)
   - Mật khẩu: `Password123!`
3. Click "Đăng Ký Ngay"
4. ✅ Kết quả mong đợi:
   - Thông báo: "✓ Đăng ký thành công! Đang chuyển hướng..."
   - Redirect đến: /login (KHÔNG phải lỗi 405)

### **Test 2: Script PowerShell (Windows)**
```bash
# Chạy trong terminal
. test_405_fix.bat

# Output:
# [TEST 1] GET request: ✅ Status 200
# [TEST 2] POST request: ✅ Status 201 hoặc 400 (KHÔNG 405)
```

### **Test 3: Curl Command**
```bash
# GET request
curl -v http://localhost:3000/register

# POST request
curl -v -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Nguyễn Văn Anh",
    "contact": "john@example.com",
    "room_code": "CB-L1-1",
    "meter_code": "CT-L1-001",
    "address": "Quận Thanh Khê",
    "password": "Password123!"
  }'

# Kết quả: HTTP/1.1 200/201/400 (KHÔNG 405) ✅
```

---

## 📝 **Files Modified**

| File | Changes |
|------|---------|
| `app.py` | ✅ Route `/register` - methods=['GET', 'POST'] + POST handler |
| `templates/register.html` | ✅ Thêm `novalidate` vào form tag |
| `templates/register.html` | ✅ Dropdown address hiển thị (remove `display: none`) |
| `templates/register.html` | ✅ Fetch URL: `/register` thay vì `/api/auth/register` |

---

## 🔍 **Debug Checklist**

Nếu lỗi 405 vẫn xuất hiện:

- [ ] Kiểm tra app.py - route `/register` có `methods=['GET', 'POST']` chưa?
- [ ] Kiểm tra HTML - form có `onsubmit="doRegister(event)"` chưa?
- [ ] Kiểm tra JavaScript - có `event.preventDefault()` chưa?
- [ ] Kiểm tra fetch URL - gọi `/register` hay `/api/auth/register`?
- [ ] Kiểm tra browser DevTools (F12) - Network tab xem request/response
- [ ] Kiểm tra Flask debug logs - có error gì không?
- [ ] Restart Flask app (Ctrl+C + `python app.py`)

---

## 📚 **HTTP Status Codes**

| Status | Meaning | Khi xảy ra |
|--------|---------|-----------|
| 200 | OK | GET /register thành công |
| 201 | Created | POST /register + đăng ký thành công |
| 400 | Bad Request | POST /register + validation lỗi (data không khớp) |
| 405 | ❌ Method Not Allowed | POST đến route chỉ chấp nhận GET |
| 500 | Internal Error | Backend exception |

**After fix:** ❌ 405 không còn xuất hiện

---

## ✨ **Summary**

| Vấn đề | Giải pháp | Status |
|--------|----------|--------|
| Route /register không chấp nhận POST | Thêm `methods=['GET', 'POST']` | ✅ Fixed |
| Form không chặn submit mặc định | Đã có `event.preventDefault()` | ✅ OK |
| Dropdown address ẩn | Loại bỏ `display: none` | ✅ Fixed |
| Fetch gọi sai URL | Sửa thành `/register` | ✅ Fixed |
| Không render form page | Thêm GET handler | ✅ Fixed |

---

**Generated**: 2026-04-23  
**Status**: ✅ Ready to Test
