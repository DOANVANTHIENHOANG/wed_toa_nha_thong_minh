# 📊 Danh Sách 25 Devices - Chi Tiết

## Thông tin các thiết bị/phòng trong hệ thống

| ID | Room Name | Floor | Room Code | Meter Code | Address | Status |
|----|-----------|-------|-----------|-----------|---------|--------|
| 1 | Phòng 101 | 1 | CB-L1-1 | CT-L1-001 | Quận Thanh Khê | Random |
| 2 | Phòng 102 | 1 | CB-L1-2 | CT-L1-002 | Quận Hải Châu | Random |
| 3 | Phòng 103 | 1 | CB-L1-3 | CT-L1-003 | Quận Liên Chiểu | Random |
| 4 | Phòng 104 | 1 | CB-L1-4 | CT-L1-004 | Quận Ngũ Hành Sơn | Random |
| 5 | Phòng 105 | 1 | CB-L1-5 | CT-L1-005 | Quận Sơn Trà | Random |
| 6 | Phòng 201 | 2 | CB-L2-1 | CT-L2-001 | Quận Thanh Khê | Random |
| 7 | Phòng 202 | 2 | CB-L2-2 | CT-L2-002 | Quận Hải Châu | Random |
| 8 | Phòng 203 | 2 | CB-L2-3 | CT-L2-003 | Quận Liên Chiểu | Random |
| 9 | Phòng 204 | 2 | CB-L2-4 | CT-L2-004 | Quận Ngũ Hành Sơn | Random |
| 10 | Phòng 205 | 2 | CB-L2-5 | CT-L2-005 | Quận Sơn Trà | Random |
| 11 | Phòng 301 | 3 | CB-L3-1 | CT-L3-001 | Quận Thanh Khê | Random |
| 12 | Phòng 302 | 3 | CB-L3-2 | CT-L3-002 | Quận Hải Châu | Random |
| 13 | Phòng 303 | 3 | CB-L3-3 | CT-L3-003 | Quận Liên Chiểu | Random |
| 14 | Phòng 304 | 3 | CB-L3-4 | CT-L3-004 | Quận Ngũ Hành Sơn | Random |
| 15 | Phòng 305 | 3 | CB-L3-5 | CT-L3-005 | Quận Sơn Trà | Random |
| 16 | Phòng 401 | 4 | CB-L4-1 | CT-L4-001 | Quận Thanh Khê | Random |
| 17 | Phòng 402 | 4 | CB-L4-2 | CT-L4-002 | Quận Hải Châu | Random |
| 18 | Phòng 403 | 4 | CB-L4-3 | CT-L4-003 | Quận Liên Chiểu | Random |
| 19 | Phòng 404 | 4 | CB-L4-4 | CT-L4-004 | Quận Ngũ Hành Sơn | Random |
| 20 | Phòng 405 | 4 | CB-L4-5 | CT-L4-005 | Quận Sơn Trà | Random |
| 21 | Phòng 501 | 5 | CB-L5-1 | CT-L5-001 | Quận Thanh Khê | Random |
| 22 | Phòng 502 | 5 | CB-L5-2 | CT-L5-002 | Quận Hải Châu | Random |
| 23 | Phòng 503 | 5 | CB-L5-3 | CT-L5-003 | Quận Liên Chiểu | Random |
| 24 | Phòng 504 | 5 | CB-L5-4 | CT-L5-004 | Quận Ngũ Hành Sơn | Random |
| 25 | Phòng 505 | 5 | CB-L5-5 | CT-L5-005 | Quận Sơn Trà | Random |

---

## 📝 Test Credentials (Đăng ký thành công)

Bạn có thể sử dụng thông tin của bất kỳ device nào từ bảng trên để đăng ký tài khoản thành công.

### Ví dụ 1: Đăng ký Device ID=1
```
Họ và tên: Nguyễn Văn Anh
Email: john@example.com
Mã Phòng: CB-L1-1
Mã Công Tơ: CT-L1-001
Địa chỉ: Quận Thanh Khê
Mật khẩu: Password123!
```

### Ví dụ 2: Đăng ký Device ID=10
```
Họ và tên: Trần Thị Bình
Email: jane@example.com
Mã Phòng: CB-L2-5
Mã Công Tơ: CT-L2-005
Địa chỉ: Quận Sơn Trà
Mật khẩu: SecurePass123@
```

### Ví dụ 3: Đăng ký Device ID=25
```
Họ và tên: Lê Minh Chiến
Email: chien@example.com
Mã Phòng: CB-L5-5
Mã Công Tơ: CT-L5-005
Địa chỉ: Quận Sơn Trà
Mật khẩu: MyPassword123#
```

---

## ⚙️ Validation Rules

### 1. Họ và tên (fullname)
- ✅ Bắt buộc nhập
- ✅ Phải viết hoa chữ cái đầu của mỗi từ
- ✅ Ví dụ hợp lệ: "Nguyễn Văn Anh", "Trần Thị Bình", "Lê Minh Chiến"
- ❌ Ví dụ không hợp lệ: "nguyễn văn anh", "NGUYỄN VĂN ANH"

### 2. Email/Phone (contact)
- ✅ Bắt buộc nhập
- ✅ Có thể là email hoặc số điện thoại
- ✅ Ví dụ: "john@example.com" hoặc "0901234567"

### 3. Mã Phòng (room_code)
- ✅ Bắt buộc nhập
- ✅ Phải khớp chính xác với cột room_code trong devices table
- ✅ Ví dụ: "CB-L1-1", "CB-L2-5", "CB-L5-5"

### 4. Mã Công Tơ (meter_code)
- ✅ Bắt buộc nhập
- ✅ Phải khớp chính xác với cột meter_code trong devices table
- ✅ Ví dụ: "CT-L1-001", "CT-L2-005", "CT-L5-005"

### 5. Địa chỉ (address)
- ✅ Bắt buộc chọn từ dropdown
- ✅ Phải khớp chính xác với cột address trong devices table
- ✅ Các lựa chọn: 
  - Quận Thanh Khê
  - Quận Hải Châu
  - Quận Liên Chiểu
  - Quận Ngũ Hành Sơn
  - Quận Sơn Trà

### 6. Mật khẩu (password)
- ✅ Bắt buộc nhập
- ✅ Tối thiểu 6 ký tự
- ✅ Phải chứa ít nhất 1 chữ hoa (A-Z)
- ✅ Phải chứa ít nhất 1 chữ số (0-9)
- ✅ Phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*...)
- ✅ Ví dụ hợp lệ: "Password123!", "SecurePass123@", "MyPassword123#"
- ❌ Ví dụ không hợp lệ: "password123!", "Password123", "PASSWORD123"

---

## 🔄 Test Flow

### Flow thành công
1. Truy cập http://localhost:3000/register
2. Nhập thông tin từ một device hợp lệ
3. Chọn địa chỉ từ dropdown
4. Nhập mật khẩu mạnh
5. Nhấn "Đăng Ký Ngay"
6. ✅ Thấy thông báo "Đăng ký thành công!"
7. Chuyển hướng tới trang login

### Flow thất bại - Sai mã phòng
1. Nhập "WRONG-CODE" vào Mã Phòng
2. Nhập đúng Mã Công Tơ và Địa chỉ
3. Nhấn "Đăng Ký Ngay"
4. ❌ Thấy lỗi: "Thông tin Mã phòng, Công tơ hoặc Địa chỉ không khớp..."

### Flow thất bại - Password yếu
1. Nhập "password123" (không có chữ hoa) vào Mật khẩu
2. Nhấn "Đăng Ký Ngay"
3. ❌ Thấy lỗi: "Mật khẩu phải chứa ít nhất 1 chữ hoa (A-Z)"

---

## 📊 Phân phối Dữ liệu

### Theo Tầng
- Tầng 1 (L1): 5 phòng (ID 1-5)
- Tầng 2 (L2): 5 phòng (ID 6-10)
- Tầng 3 (L3): 5 phòng (ID 11-15)
- Tầng 4 (L4): 5 phòng (ID 16-20)
- Tầng 5 (L5): 5 phòng (ID 21-25)

### Theo Quận
- Quận Thanh Khê: 5 phòng (ID 1, 6, 11, 16, 21)
- Quận Hải Châu: 5 phòng (ID 2, 7, 12, 17, 22)
- Quận Liên Chiểu: 5 phòng (ID 3, 8, 13, 18, 23)
- Quận Ngũ Hành Sơn: 5 phòng (ID 4, 9, 14, 19, 24)
- Quận Sơn Trà: 5 phòng (ID 5, 10, 15, 20, 25)

---

## 🔍 Cách Kiểm tra Device Hợp lệ

Query trực tiếp database:
```sql
SELECT id, room_name, room_code, meter_code, address 
FROM devices 
WHERE id = 1;

-- Kết quả:
-- | 1 | Phòng 101 | CB-L1-1 | CT-L1-001 | Quận Thanh Khê |
```

Hoặc dùng Python:
```python
import sqlite3

conn = sqlite3.connect('smart_energy.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

cursor.execute('SELECT * FROM devices WHERE id = ?', (1,))
device = cursor.fetchone()

print(f"Room Code: {device['room_code']}")
print(f"Meter Code: {device['meter_code']}")
print(f"Address: {device['address']}")

conn.close()
```

---

**Generated**: 2026-04-22  
**Total Devices**: 25  
**Database**: smart_energy.db
