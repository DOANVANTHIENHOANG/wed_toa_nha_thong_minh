# 🤖 Hướng dẫn Kiểm tra Nút "Hỏi Gemini" - Phiên bản đã sửa

**Ngày cập nhật**: 2026-04-04  
**Trạng thái**: ✅ FIXED - Đã sửa lỗi JSON.stringify và event listener

---

## 📋 Tóm tắt các sửa chữa

### Vấn đề trước đây (Đã sửa ✅)
1. **JSON.stringify trong HTML attribute** → Gây lỗi parsing
2. **Event listener không attach đúng thời điểm** → Chậm hoặc không hoạt động
3. **Signature function mismatch** → Modal không gọi đúng function

### Các sửa chữa đã áp dụng
1. ✅ **DeviceControl.js - Modal button**: Loại bỏ JSON.stringify, gọi đơn giản `openGeminiForDevice('${device.id}')`
2. ✅ **DeviceControl.js - Function**: Viết lại `openGeminiForDevice(deviceId)` chỉ nhận deviceId
3. ✅ **GeminiAnalysis.js - Event listener**: Attach immediately + retry logic

---

## 🧪 HƯỚNG DẪN KIỂM TRA

### **Bước 1: Reload trang (F5 hoặc Ctrl+R)**
```
⚠️ QUAN TRỌNG: Phải reload để tải code đã sửa
```

### **Bước 2: Mở DevTools (F12) để theo dõi logs**
```
F12 → Console tab → Giữ nguyên trong quá trình test
```

### **Bước 3: Tìm device có 🔴 RED status (tới hạn)**

Tiêu chí:
- Power ≥ 2.0 kW (vượt threshold mặc định)
- Status: 🔴 Tới hạn (Critical)
- Ví dụ: **Phòng 202** (3.17 kW, Tầng 2)

**Cách tìm:**
1. Bấm tab "⚙️ Thiết bị & Tải"
2. Scroll qua các Phòng
3. Tìm Phòng có 🔴 RED status (điều kiện: Power > 2.0 kW)

---

## 🎬 CÁC BƯỚC KIỂM TRA (Chi tiết)

### **Test Case 1: Mở Modal Cảnh báo**

**Hành động:**
- Bấm vào Phòng 🔴 (ví dụ: Phòng 202)
- Tìm nút ⚠️ hoặc symbol cảnh báo
- Bấm để mở Modal

**Kỳ vọng:**
- Modal xuất hiện: "CẢNH BÁO TỚI HẠN - [Tên Phòng]"
- Có 2 nút: "❌ Đóng" và "🤖 Hỏi Gemini"
- Không có lỗi trong console

**Logs dự kiến:**
```
Không có log (vì chưa click Hỏi Gemini)
```

---

### **Test Case 2: Click nút "🤖 Hỏi Gemini" (CHÍNH)**

**Hành động:**
```
1. Modal đang mở
2. Bấm nút "🤖 Hỏi Gemini"
3. Giữ nguyên DevTools → Console mở
```

**Kỳ vọng:**

#### **A. Console Logs (Thứ tự xuất hiện)**
```javascript
// 1️⃣ Log từ openGeminiForDevice()
"🔄 Opening Gemini for device: phong_202"
{id: "phong_202", name: "Phòng 202", power: 3.17, ...}

// 2️⃣ Log: Gemini tab element found
"🤖 Clicking Gemini tab to trigger analysis..."

// 3️⃣ Log từ event listener
"🔄 Gemini tab clicked, initializing..."

// 4️⃣ Log từ initGeminiChat()
"📱 initGeminiChat() - currentAlertDevice:"
{id: "phong_202", name: "Phòng 202", floor: 2, ...}

// 5️⃣ Final log
"✅ Processing alert for: Phòng 202"
```

#### **B. UI Changes (visual)**
```
NGAY LẬP TỨC:
- ✅ Modal ĐÓNG (biến mất)
- ✅ Tab "🤖 Gemini" ĐƯỢC CHỌN (chuyển sang tab này)
- ✅ Hiển thị: "🤖 Đang kết nối với hệ thống Phòng 202..."
- ✅ Hiện spinner (vòng tròn quay)

SAU 1.5 GIÂY:
- ✅ Spinner biến mất
- ✅ Hiển thị ADVISORY (Lời khuyên từ AI):
  • 🔍 Nguyên nhân: [Text nguyên nhân]
  • ⚠️ Rủi ro: [Text rủi ro]
  • ✅ Giải pháp: Giảm phụ tải 50% → ...
  • Nút "✅ Áp dụng" (xanh lá)
```

---

### **Test Case 3: Click nút "✅ Áp dụng" (Optional - nếu advisory xuất hiện)**

**Hành động:**
```
1. Advisory hiển thị
2. Bấm "✅ Áp dụng"
```

**Kỳ vọng:**
```
NGAY LẬP TỨC:
- ✅ Toast notification: "🔧 Đang thực hiện cấu hình lại..."

SAU 2 GIÂY:
- ✅ Toast: "✅ Đã cấu hình. Power giảm từ 3.17 → 1.59 kW"
- ✅ Advisory biến mất, quay lại "Đang chờ..."
- ✅ Tab "⚙️ Thiết bị & Tải" UPDATE:
  • Phòng 202: 🟢 NORMAL (không còn 🔴 RED)
  • Power: 1.59 kW (nửa của 3.17)
  • Có icon ⚙️ cạnh status
- ✅ Auto-chuyển sang tab "⚙️ Thiết bị & Tải"
```

---

## 🐛 NẾUCÓ LỖI - DEBUGGING GUIDE

### **Triệu chứng 1: "Không có gì xảy ra khi click nút"**

**Kiểm tra:**
1. Mở DevTools (F12)
2. Xem Console có logs: `"🔄 Opening Gemini for device:"` không?

**Nếu KHÔNG có logs:**
```
✗ Button onclick không được gọi
✗ Có thể: Code cũ chưa reload, hoặc modal HTML sai

→ FIX: F5 reload page hoàn toàn
→ Xóa cache: Ctrl+Shift+Delete → Clear Cache
```

**Nếu CÓ logs nhưng tab không switch:**
```
✗ Gemini tab element không tìm được

→ Kiểm tra console: Có log "❌ Gemini tab not found"?
→ FIX: Kiểm tra HTML dashboard có định danh đúng:
   <li data-tab="ai"> ... 🤖 Gemini</li>
```

---

### **Triệu chứng 2: "Tab switch nhưng không hiển thị 'Đang kết nối...'"**

**Kiểm tra:**
1. Xem Console có: `"🔄 Gemini tab clicked, initializing..."` không?
2. Xem có: `"📱 initGeminiChat() - currentAlertDevice:"` không?

**Nếu KHÔNG có logs:**
```
✗ Event listener không attach
✗ DOM element chưa ready khi attach listener

→ FIX: Hard reload: Ctrl+Shift+R (clear cache + reload)
→ Kiểm tra: document.querySelector('[data-tab="ai"]') 
   trong console → phải return <li> element
```

**Nếu CÓ logs nhưng content không xuất hiện:**
```
✗ div id="ai-response" không tìm được

→ Kiểm tra: Gemini tab content container có ID đúng không?
→ Xem DevTools → Elements → tìm <div id="ai-response">
```

---

### **Triệu chứng 3: "Advisory xuất hiện nhưng nút 'Áp dụng' không hoạt động"**

**Kiểm tra:**
1. Bấm nút "✅ Áp dụng"
2. Xem Console có: `"⚡ Applying fix..."` không?

**Nếu KHÔNG có logs:**
```
✗ Button onclick của nút Áp dụng sai

→ Kiểm tra: DevTools → Inspector nút button
   <button onclick="window.applyAIFix(...)" ...>
   → Phải là 'window.applyAIFix' hoặc đúng function reference
```

**Nếu CÓ logs nhưng device không update:**
```
✗ Device database không cập nhật

→ Kiểm tra: deviceDatabase.updateDevice() có tồn tại?
→ Xem: window.deviceDatabase trong console
```

---

## ✅ SUCCESS CHECKLIST

Sau khi hoàn thành test, để ✅ tất cả:

```
✅ Reload page không bị lỗi
✅ Tìm được device có 🔴 RED status
✅ Click ⚠️ mở Modal (Modal xuất hiện: CẢNH BÁO)
✅ Console log: "🔄 Opening Gemini for device: [ID]"
✅ Modal đóng sau click nút "🤖 Hỏi Gemini"
✅ Console log: "🤖 Clicking Gemini tab..."
✅ Console log: "🔄 Gemini tab clicked, initializing..."
✅ Console log: "📱 initGeminiChat()..."
✅ Tab "🤖 Gemini" ĐƯỢC CHỌN (highlight)
✅ Hiển thị: "🤖 Đang kết nối với hệ thống [Phòng]..."
✅ Spinner xuất hiện (vòng tròn quay)
✅ Sau 1.5 giây: Spinner biến mất
✅ Advisory xuất hiện với 3 phần: Nguyên nhân/Rủi ro/Giải pháp
✅ Click "✅ Áp dụng" → Toast: "🔧 Đang thực hiện..."
✅ Sau 2 giây → Toast: "✅ Đã cấu hình"
✅ Device row update: 🔴 → 🟢, Power giảm 50%
✅ Auto-switch sang tab "⚙️ Thiết bị & Tải"
```

---

## 🧠 THÔNG TIN TECHNICAL

### **Luồng hoạt động (End-to-End Flow)**

```javascript
1. User click "🤖 Hỏi Gemini" in Modal
   ↓
2. Modal button onclick → deviceUI.openGeminiForDevice('phong_202')
   ↓
3. openGeminiForDevice():
   - Get device từ database
   - Set window.currentAlertDevice = device
   - Click Gemini tab
   ↓
4. Gemini tab click event listener (attached by GeminiAnalysis.js)
   ↓
5. Event listener → initGeminiChat()
   ↓
6. initGeminiChat():
   - Check window.currentAlertDevice (có giá trị)
   - Call showConnecting(device)
   - Show "🤖 Đang kết nối..."
   - After 1.5s: Call generateAnalysis(device)
   ↓
7. generateAnalysis():
   - Create advisory HTML
   - Color code by severity
   - Add "✅ Áp dụng" button
   - Insert into #ai-response div
   ↓
8. Click "✅ Áp dụng"
   ↓
9. applyAIFix():
   - Calculate new power (50% reduction for critical)
   - Update device in database
   - Update device row in UI
   - Show success toast
   - Auto-navigate back to Thiết bị tab
```

### **Key Global Variables**

```javascript
window.currentAlertDevice     // Device object from modal
window.geminiInitialized      // Flag untuk tracking
deviceDatabase                // Device data provider
deviceUI                      // DeviceControl instance
```

### **Event Listeners Attached**

```javascript
[data-tab="ai"] → click → initGeminiChat()
.apply-ai-fix → click → applyAIFix()
```

---

## 📞 ĐIỀU cần biết

- **Reload sau sửa lỗi**: Bắt buộc (mới code chỉ load khi reload)
- **Console logs**: Giúp track từng bước, dùng để debug
- **Test lần 2**: Có thể test với device khác (cùng lần reload)
- **Toast notifications**: Xuất hiện bottom-right, auto-dismiss sau 4 giây

---

**Hỏi nếu có: Bất kỳ lỗi hoặc câu hỏi nào, check console logs và report error message chính xác.**
