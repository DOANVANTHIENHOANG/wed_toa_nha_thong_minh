# 📋 API ĐĂNG KÝ TÀI KHOẢN - Hướng Dẫn Triển khai

## 📌 Tổng Quan

API đăng ký tài khoản đã được triển khai với **xác thực 3 lớp (Strict Matching)**:
- **Backend validation**: Query bảng devices với 3 điều kiện AND bắt buộc (room_code, meter_code, address)
- **Frontend validation**: Kiểm tra password mạnh, fullname viết hoa
- **Form UI**: Dropdown address thay vì input text

---

## 🏗️ Cấu Trúc Database

### Bảng `devices` (25 bản ghi)

```sql
CREATE TABLE devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_name TEXT NOT NULL,              -- "Phòng 101", "Phòng 205", ...
    floor INTEGER NOT NULL,                -- 1, 2, 3, 4, 5
    room_code TEXT UNIQUE,                 -- "CB-L1-1", "CB-L1-2", ...
    meter_code TEXT,                       -- "CT-L1-001", "CT-L1-002", ...
    address TEXT,                          -- "Quận Thanh Khê", "Quận Hải Châu", ...
    power_status TEXT DEFAULT 'OFF',
    current_power REAL DEFAULT 0.0,
    load_status TEXT DEFAULT 'Chờ',
    last_updated DATETIME,
    created_at DATETIME
);
```

### Dữ liệu Mẫu (25 Devices)

| ID | Room Name | Floor | Room Code | Meter Code | Address |
|----|-----------|-------|-----------|-----------|---------|
| 1 | Phòng 101 | 1 | CB-L1-1 | CT-L1-001 | Quận Thanh Khê |
| 2 | Phòng 102 | 1 | CB-L1-2 | CT-L1-002 | Quận Hải Châu |
| 3 | Phòng 103 | 1 | CB-L1-3 | CT-L1-003 | Quận Liên Chiểu |
| 4 | Phòng 104 | 1 | CB-L1-4 | CT-L1-004 | Quận Ngũ Hành Sơn |
| 5 | Phòng 105 | 1 | CB-L1-5 | CT-L1-005 | Quận Sơn Trà |
| 6 | Phòng 201 | 2 | CB-L2-1 | CT-L2-001 | Quận Thanh Khê |
| 7 | Phòng 202 | 2 | CB-L2-2 | CT-L2-002 | Quận Hải Châu |
| ... | ... | ... | ... | ... | ... |
| 25 | Phòng 505 | 5 | CB-L5-5 | CT-L5-005 | Quận Sơn Trà |

**Phân phối 25 devices**: 5 tầng × 5 phòng/tầng, 5 quận × 5 phòng/quận

---

## 🔐 API Endpoints

### 1. POST `/api/auth/register` (Mới)

**Xác thực 3 Lớp Strict Matching**

#### Request Body
```json
{
  "fullname": "Nguyễn Văn Anh",
  "contact": "john@example.com",
  "room_code": "CB-L1-1",
  "meter_code": "CT-L1-001",
  "address": "Quận Thanh Khê",
  "password": "Password123!"
}
```

#### Response Success (201)
```json
{
  "success": true,
  "message": "Đăng ký thành công! Chào mừng Nguyễn Văn Anh",
  "redirect": "/login",
  "data": {
    "username": "nguyen_van_anh",
    "fullname": "Nguyễn Văn Anh",
    "device": "Phòng 101"
  }
}
```

#### Response Error (400)
```json
{
  "error": "Thông tin Mã phòng, Công tơ hoặc Địa chỉ không khớp với dữ liệu tòa nhà. Vui lòng kiểm tra lại!"
}
```

#### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| fullname | Bắt buộc, viết hoa chữ cái đầu | "Họ và tên phải viết hoa chữ cái đầu của mỗi từ" |
| contact | Bắt buộc, email hoặc phone | "Vui lòng điền đầy đủ thông tin" |
| room_code | Query AND bảng devices | "Thông tin không khớp..." |
| meter_code | Query AND bảng devices | "Thông tin không khớp..." |
| address | Query AND bảng devices | "Thông tin không khớp..." |
| password | ≥6 ký tự, chữ hoa, số, ký tự đặc biệt | "Mật khẩu phải chứa..." |

---

## 📝 Frontend - Form HTML

### Dropdown Address (Các tùy chọn)
```html
<select id="reg_address_select">
  <option value="">-- Chọn Địa chỉ --</option>
  <option value="Quận Thanh Khê">Quận Thanh Khê</option>
  <option value="Quận Hải Châu">Quận Hải Châu</option>
  <option value="Quận Liên Chiểu">Quận Liên Chiểu</option>
  <option value="Quận Ngũ Hành Sơn">Quận Ngũ Hành Sơn</option>
  <option value="Quận Sơn Trà">Quận Sơn Trà</option>
</select>
```

### JavaScript Validation
```javascript
// 1. Check fullname capitalization
function isNameCapitalized(name) {
    const words = name.trim().split(/\s+/);
    return words.every(word => /^[A-Z]/.test(word));
}

// 2. Check password strength
function isPasswordStrong(password) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasUpperCase && hasNumber && hasSpecialChar;
}

// 3. Get password issues
function getPasswordIssues(password) {
    const issues = [];
    if (!/[A-Z]/.test(password)) {
        issues.push("• Phải chứa ít nhất 1 chữ hoa (A-Z)");
    }
    if (!/[0-9]/.test(password)) {
        issues.push("• Phải chứa ít nhất 1 chữ số (0-9)");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        issues.push("• Phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*...)");
    }
    return issues;
}
```

---

## 🐍 Backend - Python/Flask

### db_helper.py - Hàm Xác thực

```python
def verify_device_credentials(room_code, meter_code, address):
    """
    Xác thực thông tin thiết bị: Query bảng devices với 3 điều kiện AND bắt buộc
    
    Returns:
        dict: Thông tin device nếu tìm thấy đúng 1 bản ghi
        None: Nếu không tìm thấy
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT id, room_name, floor, room_code, meter_code, address
        FROM devices
        WHERE room_code = ? AND meter_code = ? AND address = ?
    ''', (room_code, meter_code, address))

    row = cursor.fetchone()
    conn.close()

    if row:
        return dict(row)
    return None
```

### app.py - API Endpoint

```python
@app.route('/api/auth/register', methods=['POST'])
def api_register():
    """
    API đăng ký tài khoản với xác thực 3 lớp (Strict Matching)
    """
    try:
        data = request.get_json()
        
        # Lấy dữ liệu từ request
        fullname = data.get('fullname', '').strip()
        contact = data.get('contact', '').strip()
        room_code = data.get('room_code', '').strip()
        meter_code = data.get('meter_code', '').strip()
        address = data.get('address', '').strip()
        password = data.get('password', '')
        
        # === VALIDATION LỚP 1: Kiểm tra dữ liệu đầu vào ===
        if not all([fullname, contact, room_code, meter_code, address, password]):
            return jsonify({"error": "Vui lòng điền đầy đủ thông tin!"}), 400
        
        # === VALIDATION LỚP 2: Query DB với 3 điều kiện AND ===
        device = db_helper.verify_device_credentials(room_code, meter_code, address)
        
        if not device:
            return jsonify({
                "error": "Thông tin Mã phòng, Công tơ hoặc Địa chỉ không khớp với dữ liệu tòa nhà. Vui lòng kiểm tra lại!"
            }), 400
        
        # === VALIDATION LỚP 3: Kiểm tra username & password ===
        username = fullname.lower().replace(' ', '_')
        
        if username in users_db:
            return jsonify({"error": "Tên người dùng đã tồn tại!"}), 400
        
        # Password validation (mạnh, có chữ hoa, số, ký tự đặc biệt)
        import re
        if not re.search(r'[A-Z]', password):
            return jsonify({"error": "Mật khẩu phải chứa ít nhất 1 chữ hoa!"}), 400
        # ... (thêm kiểm tra số và ký tự đặc biệt)
        
        # === TẠO TÀI KHOẢN ===
        users_db[username] = {
            'fullname': fullname,
            'email': contact if '@' in contact else '',
            'phone': contact if '@' not in contact else '',
            'password': generate_password_hash(password),
            'device_id': device['id'],
            'room_code': room_code,
            'meter_code': meter_code,
            'address': address,
            'role': 'user',
            'created_at': datetime.now().isoformat()
        }
        
        return jsonify({
            "success": True,
            "message": f"Đăng ký thành công! Chào mừng {fullname}",
            "redirect": "/login",
            "data": {
                "username": username,
                "fullname": fullname,
                "device": device['room_name']
            }
        }), 201
        
    except Exception as e:
        logger.error(f"Register error: {str(e)}")
        return jsonify({"error": f"Lỗi server: {str(e)}"}), 500
```

---

## 🧪 Testing

### Test Script

Chạy script test để kiểm tra API:

```bash
python test_register_api.py
```

**Test Cases:**
1. ✓ Đăng ký thành công (thông tin khớp)
2. ✗ Mã phòng sai
3. ✗ Mã công tơ sai
4. ✗ Địa chỉ sai
5. ✗ Mật khẩu không có chữ hoa
6. ✗ Mật khẩu không có chữ số
7. ✗ Mật khẩu không có ký tự đặc biệt

### Manual Testing

#### Test 1: Đăng ký thành công
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Nguyễn Văn Anh",
    "contact": "john@example.com",
    "room_code": "CB-L1-1",
    "meter_code": "CT-L1-001",
    "address": "Quận Thanh Khê",
    "password": "Password123!"
  }'
```

#### Test 2: Thất bại - Mã phòng sai
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Trần Thị Bình",
    "contact": "jane@example.com",
    "room_code": "WRONG-CODE",
    "meter_code": "CT-L1-001",
    "address": "Quận Thanh Khê",
    "password": "Password123!"
  }'
```

---

## 📂 Files Modified/Created

### Modified Files
- ✅ `init_db.py` - Thêm cột meter_code, address vào bảng devices
- ✅ `db_helper.py` - Thêm hàm verify_device_credentials()
- ✅ `app.py` - Thêm route /api/auth/register
- ✅ `templates/register.html` - Thay input address thành select dropdown, thêm validation JS

### New Files
- ✅ `test_register_api.py` - Script test API

---

## ⚠️ Lưu ý Quan trọng

1. **Không làm hỏng các hàm AI và Dashboard**
   - Tất cả các hàm AI (Gemini, ml_predictor) vẫn giữ nguyên
   - Các route /dashboard, /api/analytics/* vẫn hoạt động bình thường
   - Chỉ thêm route mới `/api/auth/register`, không sửa `/register_api`

2. **Xác thực 3 lớp bắt buộc**
   - Backend kiểm tra: room_code AND meter_code AND address
   - Nếu sai 1 trong 3 thì trả lỗi 400
   - Frontend kiểm tra: fullname capitalization, password strength

3. **Database đã được khởi tạo**
   - 25 devices với thông tin đầy đủ
   - Bảng devices có cột meter_code, address
   - Dữ liệu đã được phân phối cho 5 quận

4. **Form UI cập nhật**
   - Dropdown address thay vì input text
   - Validation real-time trên frontend
   - Error messages chi tiết cho mỗi lỗi

---

## 🚀 Khởi Động Hệ Thống

```bash
# Activate virtual environment
. .venv\Scripts\Activate.ps1

# Run app (Port 3000)
python app.py

# Truy cập form đăng ký
# http://localhost:3000/register
```

---

## 📞 Support

Nếu gặp lỗi:
1. Kiểm tra database: `smart_energy.db` có 25 devices không
2. Kiểm tra app.py import db_helper đúng không
3. Kiểm tra port 3000 không bị occupied
4. Xem logs trong terminal khi chạy app.py

---

**Generated**: 2026-04-22  
**Version**: 1.0 - API Register with 3-Level Strict Matching
