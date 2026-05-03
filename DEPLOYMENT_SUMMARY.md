# 🎯 TÓMLỊCH TỀM TRIỂN KHAI - API ĐĂNG KÝ TÀI KHOẢN

## ✅ HOÀN THÀNH

### 1️⃣ Backend
- ✅ Thêm cột `meter_code` và `address` vào bảng `devices`
- ✅ Tạo hàm `verify_device_credentials()` trong `db_helper.py`
- ✅ Tạo API endpoint `/api/auth/register` với xác thực 3 lớp
- ✅ Cấu hình validation password mạnh (chữ hoa, số, ký tự đặc biệt)
- ✅ Khởi tạo database với 25 devices (5 tầng × 5 phòng/tầng)

### 2️⃣ Frontend
- ✅ Cập nhật form HTML: Thay input address thành select dropdown
- ✅ Thêm 5 lựa chọn quận Đà Nẵng trong dropdown
- ✅ Thêm JavaScript validation cho fullname (viết hoa chữ cái đầu)
- ✅ Thêm JavaScript validation cho password (mạnh)
- ✅ Cập nhật fetch API gọi `/api/auth/register` thay vì `/register_api`
- ✅ Cập nhật error messages chi tiết

### 3️⃣ Data
- ✅ 25 devices đầy đủ thông tin: room_code, meter_code, address
- ✅ Dữ liệu phân phối đều: 5 quận × 5 phòng/quận
- ✅ Format mã phòng: `CB-L{floor}-{room}` (VD: CB-L1-1)
- ✅ Format mã công tơ: `CT-L{floor}-{room:03d}` (VD: CT-L1-001)

### 4️⃣ Documentation
- ✅ `API_REGISTER_DOCUMENTATION.md` - Chi tiết API, validation rules
- ✅ `DEVICES_LIST_25.md` - Danh sách 25 devices + test credentials
- ✅ `test_register_api.py` - Script test 7 test cases

---

## 🔄 XÁC THỰC 3 LỚP (Strict Matching)

### Lớp 1: Validation Input
```python
if not all([fullname, contact, room_code, meter_code, address, password]):
    return error: "Vui lòng điền đầy đủ thông tin!"
```

### Lớp 2: Query Database (AND bắt buộc)
```python
device = verify_device_credentials(room_code, meter_code, address)
# SQL: WHERE room_code = ? AND meter_code = ? AND address = ?

if not device:
    return error: "Thông tin Mã phòng, Công tơ hoặc Địa chỉ không khớp..."
```

### Lớp 3: Password Validation
```python
# ✓ Ít nhất 6 ký tự
# ✓ Chứa ít nhất 1 chữ hoa (A-Z)
# ✓ Chứa ít nhất 1 chữ số (0-9)
# ✓ Chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*...)
```

---

## 📡 API ENDPOINT

### POST `/api/auth/register`

**Request:**
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

**Success (201):**
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

**Error (400):**
```json
{
  "error": "Thông tin Mã phòng, Công tơ hoặc Địa chỉ không khớp với dữ liệu tòa nhà. Vui lòng kiểm tra lại!"
}
```

---

## 📝 FILES THAY ĐỔI

| File | Thay đổi | Status |
|------|----------|--------|
| `init_db.py` | +2 cột meter_code, address | ✅ |
| `db_helper.py` | +hàm verify_device_credentials() | ✅ |
| `app.py` | +route /api/auth/register | ✅ |
| `templates/register.html` | +select dropdown, +JS validation | ✅ |
| `test_register_api.py` | NEW - Script test | ✅ |
| `API_REGISTER_DOCUMENTATION.md` | NEW - Docs chi tiết | ✅ |
| `DEVICES_LIST_25.md` | NEW - Danh sách devices | ✅ |

---

## 🚀 KHỞI ĐỘNG VÀ TEST

### 1. Activate Virtual Environment
```bash
. .venv\Scripts\Activate.ps1
```

### 2. Run Flask App
```bash
python app.py
# http://localhost:3000
```

### 3. Test Form Đăng ký
- URL: http://localhost:3000/register
- Nhập thông tin device ID=1:
  - Họ tên: `Nguyễn Văn Anh`
  - Email: `john@example.com`
  - Mã Phòng: `CB-L1-1`
  - Mã Công Tơ: `CT-L1-001`
  - Địa chỉ: `Quận Thanh Khê` (chọn dropdown)
  - Mật khẩu: `Password123!`
- Nhấn "Đăng Ký Ngay"
- ✅ Thấy: "Đăng ký thành công!" → Redirect /login

### 4. Test API với Script
```bash
python test_register_api.py
# Chạy 7 test cases tự động
```

### 5. Test Curl
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

---

## 📊 DATABASE STATS

- **Database**: `smart_energy.db`
- **Bảng devices**: 25 rows
- **Cột mới**: meter_code, address
- **Tầng**: 1-5 (5 phòng/tầng)
- **Quận**: 5 quận Đà Nẵng (5 phòng/quận)

### Query Test Devices
```sql
-- Lấy device ID=1
SELECT * FROM devices WHERE id = 1;

-- Lấy tất cả device theo quận
SELECT * FROM devices WHERE address = 'Quận Thanh Khê';

-- Kiểm tra device hợp lệ
SELECT * FROM devices 
WHERE room_code = 'CB-L1-1' 
  AND meter_code = 'CT-L1-001' 
  AND address = 'Quận Thanh Khê';
```

---

## ⚠️ IMPORTANT NOTES

1. **Không sửa các hàm AI, Dashboard**
   - Tất cả Gemini AI service giữ nguyên
   - Tất cả routes analytics/* giữ nguyên
   - Chỉ thêm route mới `/api/auth/register`

2. **Dropdown Address bắt buộc**
   - Frontend: Không cho phép nhập text, phải chọn dropdown
   - Backend: Kiểm tra chính xác match với devices.address
   - 5 lựa chọn: Quận Thanh Khê, Hải Châu, Liên Chiểu, Ngũ Hành Sơn, Sơn Trà

3. **Password Policy**
   - ≥6 ký tự (không less than)
   - Mandatory: [A-Z] + [0-9] + [!@#$%^&*...]
   - Frontend check real-time
   - Backend check xác nhận

4. **Fullname Capitalization**
   - Mỗi từ phải viết hoa chữ cái đầu
   - "Nguyễn Văn Anh" ✅
   - "nguyễn văn anh" ❌
   - "NGUYỄN VĂN ANH" ❌ (nhưng vẫn qua backend check)

5. **Username Generation**
   - From fullname: lowercase + replace space with underscore
   - "Nguyễn Văn Anh" → "nguyen_van_anh"

---

## 🧪 TEST CASES (7 cases)

Chạy: `python test_register_api.py`

| # | Test | Expected | Status |
|---|------|----------|--------|
| 1 | ✓ Thông tin khớp | 201 Success | ✅ |
| 2 | ✗ room_code sai | 400 Error | ✅ |
| 3 | ✗ meter_code sai | 400 Error | ✅ |
| 4 | ✗ address sai | 400 Error | ✅ |
| 5 | ✗ Mật khẩu: No uppercase | 400 Error | ✅ |
| 6 | ✗ Mật khẩu: No number | 400 Error | ✅ |
| 7 | ✗ Mật khẩu: No special char | 400 Error | ✅ |

---

## 📞 TROUBLESHOOTING

### Lỗi: "Kết nối API thất bại"
- ✓ Kiểm tra Flask app đang chạy
- ✓ Kiểm tra port 3000 không bị occupied
- ✓ Kiểm tra CORS config trong app.py

### Lỗi: "Thông tin không khớp"
- ✓ Kiểm tra room_code chính xác (case-sensitive)
- ✓ Kiểm tra meter_code chính xác
- ✓ Kiểm tra address chọn từ dropdown (đúng giá trị)
- ✓ Kiểm tra database có 25 devices không

### Lỗi: "Mật khẩu không mạnh"
- ✓ Kiểm tra ≥ 6 ký tự
- ✓ Kiểm tra có [A-Z] (chữ hoa)
- ✓ Kiểm tra có [0-9] (chữ số)
- ✓ Kiểm tra có [!@#$%^&*...]

### Lỗi: "Họ tên không hợp lệ"
- ✓ Viết hoa chữ cái đầu mỗi từ
- ✓ Ví dụ: "Nguyễn Văn Anh", "Trần Thị Bình"
- ✓ Không dấu cách thừa

---

## 📚 REFERENCE DOCS

1. **API_REGISTER_DOCUMENTATION.md** - Chi tiết API, validation rules, source code
2. **DEVICES_LIST_25.md** - Danh sách 25 devices, test credentials
3. **test_register_api.py** - Script test tự động

---

## ✨ SUMMARY

| Đặc tính | Chi tiết |
|---------|----------|
| API Endpoint | `POST /api/auth/register` |
| Xác thực | 3 lớp strict matching (room_code + meter_code + address) |
| Database | 25 devices với meter_code, address |
| Form UI | Dropdown address (5 quận Đà Nẵng) |
| Validation | Fullname capitalized + Password strong |
| Frontend | HTML/JS form validation |
| Backend | Python/Flask + SQLite |
| Test Coverage | 7 test cases |
| Status | ✅ Ready for production |

---

**Generated**: 2026-04-22  
**Version**: 1.0 Final  
**Ready**: ✅ Yes
