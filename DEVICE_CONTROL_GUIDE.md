# 🔌 Device Control System - Hướng dẫn triển khai

**Version**: 1.0  
**Ngày cập nhật**: 2026-04-04  
**Thành phần**: Backend (Flask) + Frontend (JavaScript/CSS)

---

## 📋 Tổng quan tính năng

Hệ thống kiểm soát thiết bị thông minh với chỉ báo mức tải dựa trên loại tòa nhà:

| Loại tòa nhà | Mức bình thường | Mức cao | Mức tới hạn |
|---|---|---|---|
| **Chung cư (100 căn)** | 1.5-2 kW | 4-6 kW | >8 kW |
| **Nhà nghỉ (20 phòng)** | 0.2-0.3 kW | 0.5-0.7 kW | >1 kW |
| **Văn phòng (1000 m²)** | 0.8-1.2 kW | 2-3 kW | >4.5 kW |

---

## 🔧 Cấu trúc Backend

### 1. Quy tắc tòa nhà (BUILDING_LOAD_STANDARDS)
```python
BUILDING_LOAD_STANDARDS = {
    'chung_cu': {
        'name': 'Chung cư (100 căn)',
        'normal': {'min': 1.5, 'max': 2.0},
        'high': {'min': 4.0, 'max': 6.0},
        'critical': {'min': 8.0, 'max': float('inf')}
    },
    # ... other building types
}
```

**Vị trí**: `app.py`, dòng ~30

### 2. Hàm kiểm tra mức tải (check_load_status)
```python
def check_load_status(load_value, building_type='van_phong'):
    """
    Kiểm tra mức tiêu thụ điện theo loại tòa nhà
    Return: (status_label, color_code, severity)
    """
```

**Vị trí**: `app.py`, dòng ~305  
**Trả về**:
- `status`: 'idle' | 'normal' | 'high' | 'critical'
- `label`: Nhãn tiếng Việt
- `color`: Mã màu hex
- `severity`: 0-3 (từ thấp đến cao)

### 3. API Endpoints

#### GET `/api/building-type`
Lấy loại tòa nhà hiện tại và danh sách các loại có sẵn

**Response**:
```json
{
  "current_type": "van_phong",
  "name": "Văn phòng (1000 m²)",
  "available_types": {
    "chung_cu": "Chung cư (100 căn)",
    "nha_nghi": "Nhà nghỉ (20 phòng)",
    "van_phong": "Văn phòng (1000 m²)"
  },
  "standards": { ... }
}
```

#### POST `/api/building-type`
Thay đổi loại tòa nhà

**Request**:
```json
{
  "building_type": "chung_cu"
}
```

**Response**:
```json
{
  "success": true,
  "building_type": "chung_cu",
  "name": "Chung cư (100 căn)",
  "message": "Đã thay đổi loại tòa nhà thành Chung cư (100 căn)"
}
```

#### GET `/api/devices/all-status`
Lấy danh sách tất cả thiết bị với trạng thái tải

**Response**:
```json
{
  "building_type": "van_phong",
  "building_name": "Văn phòng (1000 m²)",
  "devices": [
    {
      "id": 1,
      "name": "Sảnh chính",
      "location": "Tầng trệt",
      "code": "CB-GF-01",
      "power": 1.2,
      "status": true,
      "load_status": {
        "status": "normal",
        "label": "Bình thường",
        "color": "#66bb6a",
        "severity": 1
      }
    },
    ...
  ],
  "timestamp": "2026-04-04T10:30:00"
}
```

#### GET `/api/device/<id>/status`
Lấy trạng thái chi tiết của một thiết bị

#### POST `/api/device/<id>/toggle`
Bật/tắt một thiết bị (không cần @require_login)

---

## 🎨 Cấu trúc Frontend

### 1. Component: DeviceControl.js
**Vị trí**: `static/DeviceControl.js`

**Lớp chính**: `DeviceControlManager`

**Phương thức chính**:
- `init()` - Khởi tạo component
- `loadBuildingType()` - Tải loại tòa nhà hiện tại
- `changeBuildingType(newType)` - Thay đổi loại tòa nhà
- `loadAllDevices()` - Tải danh sách thiết bị
- `renderDevices()` - Vẽ bảng thiết bị
- `toggleDevice(deviceId)` - Bật/tắt thiết bị
- `askGeminiAboutDevice(device)` - Gửi câu hỏi AI

### 2. Styling: enhanced-ui.css
**Vị trí**: `static/enhanced-ui.css`

**Các class chính**:
- `.device-control-panel` - Container chính
- `.devices-table` - Bảng thiết bị
- `.load-badge` - Badge chỉ báo mức tải
- `.status-badge` - Badge trạng thái (Bật/Tắt)
- `.critical-alert-modal` - Modal cảnh báo tối hạn
- `.device-toggle-btn` - Nút bật/tắt
- `.ask-gemini-btn` - Nút hỏi Gemini

### 3. Màu sắc quy tắc

| Mức | Màu | Hex | Ý nghĩa |
|---|---|---|---|
| Chờ | Xám | #95959d | Thiết bị không hoạt động |
| Bình thường | Xanh lá | #66bb6a | Hoạt động bình thường |
| Cao | Cam | #ffa726 | Công suất cao, cần chú ý |
| Tới hạn | Đỏ | #ff6b6b | ⚠️ Vượt quá ngưỡng, cảnh báo |

---

## 📱 Tích hợp HTML

### 1. Thêm vào dashboard.html

**CSS**:
```html
<link rel="stylesheet" href="{{ url_for('static', filename='enhanced-ui.css') }}">
```

**Container**:
```html
<div id="device-control-container">
    <!-- DeviceControl component sẽ được chèn ở đây -->
</div>
```

**Script**:
```html
<script src="{{ url_for('static', filename='DeviceControl.js') }}"></script>
```

### 2. Cách sử dụng (Đã tích hợp)

Khi trang tải, DeviceControl.js tự động:
1. Tìm kiếm `#device-control-container`
2. Tạo giao diện bảng thiết bị
3. Tải danh sách thiết bị từ API
4. Cập nhật mức tải dựa trên loại tòa nhà
5. Bắt đầu polling (cập nhật mỗi 5 giây)

---

## 🚀 Các tính năng chính

### 1️⃣ Bộ lọc loại tòa nhà
- Dropdown để chọn loại tòa nhà
- Tự động cập nhật mức tải tất cả thiết bị
- Lưu lựa chọn trên backend

### 2️⃣ Bảng thiết bị
| Cột | Nội dung | Ghi chú |
|---|---|---|
| Thiết bị | Tên thiết bị | Từ system_data |
| Vị trí | Vị trí vật lý | Ví dụ: "Tầng trệt" |
| Mã | Mã thiết bị | Ví dụ: "CB-GF-01" |
| Công suất | Công suất hiện tại (kW) | Cập nhật theo dự liệu |
| Trạng thái | Bật/Tắt | Badge xanh/đỏ |
| Mức tải | Idle/Normal/High/Critical | Badge màu + animation |
| Điều khiển | Nút bật/tắt + Hỏi Gemini | |

### 3️⃣ Badge chỉ báo mức tải
- **Hiệu ứng**: Xung động (pulse) liên tục
- **Mức tối hạn**: Xung động nhanh (critical pulse)
- **Phản ứng**: Cập nhật realtime khi công suất thay đổi

### 4️⃣ Cảnh báo tải tói hạn
- Modal popup tự động nổi lên khi severity = 3
- Cho phép hỏi Gemini ngay từ cảnh báo
- Nút "Đã hiểu" để đóng

### 5️⃣ Tích hợp Gemini AI
- Nút "💬" bên cạnh mỗi thiết bị
- Gửi thông tin thiết bị đến tab "Phân tích Gemini"
- Ngữ cảnh tự động: tên, mã, công suất, mức tải

### 6️⃣ Cập nhật realtime
- Polling mỗi 5 giây
- Cập nhật qua `/api/devices/all-status`
- Hiệu ứng fade-in mượt mà

---

## 🔒 Quyền truy cập

| Endpoint | Yêu cầu Auth | Ghi chú |
|---|---|---|
| `/api/device/<id>/toggle` | ❌ Không | Public, dùng trong demo |
| `/api/device/<id>/status` | ✅ Có | @require_login |
| `/api/devices/all-status` | ✅ Có | @require_login |
| `/api/building-type` (GET/POST) | ✅ Có | @require_login |

---

## ⚡ Hiệu suất & Tối ưu hóa

### 1. Polling Interval
- **Hiện tại**: 5 giây
- **Điều chỉnh**: Thay đổi `startPolling()` trong DeviceControl.js

### 2. CSS Animation
- **Pulse normal**: 2 giây / chu kỳ
- **Pulse critical**: 0.5 giây / chu kỳ
- **Transition**: 0.3 giây

### 3. DOM Optimization
- Sử dụng `innerHTML` một lần cho toàn bộ bảng
- Event delegation cho nút điều khiển
- Không tạo lại DOM nếu dữ liệu không thay đổi (có thể thêm)

---

## 🧪 Kiểm tra chức năng

### 1. Kiểm tra Backend

```bash
# Kiểm tra endpoint GET
curl http://192.168.1.19:3000/api/building-type

# Kiểm tra endpoint POST
curl -X POST http://192.168.1.19:3000/api/building-type \
  -H "Content-Type: application/json" \
  -d '{"building_type": "chung_cu"}'

# Kiểm tra endpoint danh sách thiết bị
curl http://192.168.1.19:3000/api/devices/all-status

# Kiểm tra toggle
curl -X POST http://192.168.1.19:3000/api/device/1/toggle
```

### 2. Kiểm tra Frontend

1. Mở Dashboard
2. Click vào tab "Thiết bị & Tải"
3. Kiểm tra:
   - ✓ Bảng thiết bị hiển thị
   - ✓ Dropdown loại tòa nhà hoạt động
   - ✓ Badge mức tải hiển thị đúng màu (phụ thuộc loại tòa nhà)
   - ✓ Nút bật/tắt hoạt động
   - ✓ Nút Hỏi Gemini (💬) gửi tin nhắn đến AI tab

### 3. Kiểm tra Cảnh báo

1. Tìm thiết bị có công suất cao
2. Thay đổi loại tòa nhà thành "Nhà nghỉ" (ngưỡng tới hạn = 1 kW)
3. Nếu công suất > 1 kW → Modal cảnh báo nhảy lên
4. Click "Hỏi Gemini" để gửi dữ liệu AI

---

## 📊 Ví dụ dữ liệu

### Thiết bị mẫu (system_data)
```python
'devices': {
    '1': {
        'id': 1,
        'name': 'Sảnh chính',
        'location': 'Tầng trệt',
        'code': 'CB-GF-01',
        'power': 1.2,
        'status': True
    },
    '2': {
        'id': 2,
        'name': 'Văn phòng A',
        'location': 'Tầng 01',
        'code': 'CB-L1-02',
        'power': 2.5,
        'status': True
    },
    '3': {
        'id': 3,
        'name': 'Server',
        'location': 'Tầng 02',
        'code': 'CB-L2-03',
        'power': 4.8,
        'status': True
    }
}
```

### Kịch bản 1: Loại tòa nhà = Văn phòng
- **Thiết bị 1**: 1.2 kW → Bình thường (🟢 Normal)
- **Thiết bị 2**: 2.5 kW → Cao (🟠 High)
- **Thiết bị 3**: 4.8 kW → Tới hạn (🔴 Critical) → **Cảnh báo!**

### Kịch bản 2: Loại tòa nhà = Nhà nghỉ
- **Thiết bị 1**: 1.2 kW → Tới hạn (🔴 Critical) → **Cảnh báo!**
- **Thiết bị 2**: 2.5 kW → Tới hạn (🔴 Critical) → **Cảnh báo!**
- **Thiết bị 3**: 4.8 kW → Tới hạn (🔴 Critical) → **Cảnh báo!**

---

## 🐛 Gỡ lỗi

### Vấn đề: Bảng thiết bị không hiển thị

1. **Kiểm tra Console** (F12)
   - Có lỗi JavaScript không?
   - API có trả về lỗi không?

2. **Kiểm tra API**
   ```javascript
   fetch('/api/devices/all-status')
     .then(r => r.json())
     .then(data => console.log(data))
   ```

3. **Kiểm tra Login**
   - @require_login decorator yêu cầu đăng nhập
   - Đảm bảo session có username

### Vấn đề: Màu sắc không đúng

- Kiểm tra `BUILDING_LOAD_STANDARDS` trong app.py
- Kiểm tra giá trị công suất (power) của thiết bị
- Kiểm tra loại tòa nhà hiện tại (`building_type`)

### Vấn đề: Nút Gemini không hoạt động

- GeminiAnalysisManager có được tải không?
- Check: `window.geminiManager` trong Console
- Cần tab "Phân tích Gemini" được mở sẵn

---

## 📋 Danh sách tệp thay đổi

| Tệp | Loại thay đổi | Ghi chú |
|---|---|---|
| `app.py` | Cập nhật | +70 dòng (building_types, hàm kiểm tra, endpoints) |
| `static/DeviceControl.js` | Tạo mới | Component quản lý thiết bị (330 dòng) |
| `static/enhanced-ui.css` | Cập nhật | +180 dòng CSS cho device control |
| `templates/dashboard.html` | Cập nhật | +2 dòng (CSS link + Script link + container) |

---

## 🔄 Phát triển tiếp theo

- [ ] Lưu trạng thái thiết bị vào database (persistent)
- [ ] Thêm chi tiết tiêu thụ điện theo thiết bị
- [ ] Biểu đồ lịch sử công suất theo thiết bị
- [ ] Tính năng nhóm thiết bị
- [ ] Cấu hình ngưỡng cảnh báo per device
- [ ] Export danh sách thiết bị (CSV/PDF)
- [ ] API webhook để tích hợp hệ thống bên ngoài

---

**Hết**

*Tài liệu này là tài liệu hướng dẫn cho hệ thống Device Control V1.0*
