# 📋 ACTION ITEMS - Hệ thống Smart Building Energy Management

🎯 **Mức hoàn thiện hiện tại**: 60% (Core monitoring có, Control & Automation chưa)

---

## 🔴 CRITICAL (Bắt buộc - Tuần 1-4)

### 1️⃣ IoT Data Ingestion Layer
**Trạng thái**: ❌ Không có  
**Tác động**: Dữ liệu hiện tại chỉ mock, không từ sensor thực  
**Chi tiết**: 
- [ ] Tạo `backend/iot-service.js` (receive, validate, store sensor data)
- [ ] API: `POST /api/iot/ingest` - Nhận dữ liệu từ cảm biến
- [ ] API: `GET /api/iot/reading/:deviceId/:sensorType` - Lấy reading hiện tại
- [ ] Add humidity sensor display (giờ chỉ có temperature)
- [ ] Validate dữ liệu: temperature (15-35°C), humidity (0-100%), power (0-50kW)

**Code skeleton** ở `GAP_ANALYSIS_VI.md` → Section 2.1

---

### 2️⃣ HVAC Auto Control
**Trạng thái**: ❌ Không có  
**Tác động**: Không thể tự động điều chỉnh nhiệt độ, lãng phí năng lượng  
**Chi tiết**:
- [ ] Tạo `backend/control-service.js` (control logic)
- [ ] API: `POST /api/hvac/setpoint` - Set target temperature
- [ ] API: `POST /api/hvac/mode` - Set mode (cool/heat/auto/off)
- [ ] Frontend: Add HVAC control panel (temperature slider, mode selector)
- [ ] Schedule support: Chạy HVAC theo lịch (6:00-22:00)

**Code skeleton** ở `GAP_ANALYSIS_VI.md` → Section 2.2.1

---

### 3️⃣ Lighting Control
**Trạng thái**: ❌ Không có  
**Tác động**: Không điều khiển được độ sáng, tiêu tốn điện ban ngày  
**Chi tiết**:
- [ ] Backend: Add lighting dimming logic
- [ ] API: `POST /api/lighting/brightness` - Set brightness (0-100%)
- [ ] API: `POST /api/lighting/color` - Set color temp (warm/neutral/daylight)
- [ ] Frontend: Add lighting control panel
- [ ] Occupancy-aware dimming: Tự động tắt khi room empty

**Code skeleton** ở `GAP_ANALYSIS_VI.md` → Section 2.2.1

---

## 🟡 HIGH (Quan trọng - Tuần 5-9)

### 4️⃣ Advanced Alert System
**Trạng thái**: ⚠️ Có alert_logs nhưng không notification  
**Tác động**: Admin không nhận được cảnh báo overload real-time  
**Chi tiết**:
- [ ] Tạo `backend/alert-service.js`
- [ ] API: `GET /api/alerts` - Danh sách alerts
- [ ] API: `POST /api/alerts/:id/acknowledge` - Xác nhận alert
- [ ] API: `POST /api/alerts/rules/create` - Tạo alert rule
- [ ] Alert severity levels: critical (red), warning (orange), info (blue)
- [ ] Frontend: Alert notification panel + history modal
- [ ] WebSocket broadcast: Real-time alert notifications
- [ ] Email integration (optional): Send critical alerts via email

**Code skeleton** ở `GAP_ANALYSIS_VI.md` → Section 3.1 & 3.2

---

### 5️⃣ Database Persistence (MongoDB)
**Trạng thái**: ⚠️ Có JSON file nhưng không persistent db  
**Tác động**: Dữ liệu mất khi restart; không scale; không audit trail  
**Chi tiết**:
- [ ] Setup MongoDB Atlas hoặc local MongoDB
- [ ] Tạo schemas: energy_reading, device_config, control_rule, alert_log, activity_log
- [ ] Migrate energy_data.json → MongoDB
- [ ] Update backend APIs để save → MongoDB thay JSON
- [ ] Connection pool, error handling, backup strategy

**Database schemas** ở `GAP_ANALYSIS_VI.md` → Section 4.1

---

### 6️⃣ Control Scheduling
**Trạng thái**: ❌ Không có  
**Tác động**: Không tự động bật/tắt thiết bị theo giờ  
**Chi tiết**:
- [ ] API: `POST /api/schedule/create` - Tạo schedule rule
- [ ] Support: Time-based (08:00-18:00), occupancy-based, temperature-based
- [ ] Example: "Bật HVAC lúc 7:00, tắt lúc 22:00 hàng ngày"
- [ ] Persist schedules → MongoDB
- [ ] Cron-like execution engine

---

## 🟢 MEDIUM (Nâng cao - Tuần 10-14)

### 7️⃣ Advanced Analytics
**Trạng thái**: ⚠️ Có LinearRegression forecast nhưng basic  
**Chi tiết**:
- [ ] Peak hour prediction: Dự báo khi nào sẽ tải cao
- [ ] Device maintenance: Detect device degradation (power trending up)
- [ ] Efficiency score: Năng lượng/người/giờ → score 0-100
- [ ] Cost optimization recommendations: "Shift load to off-peak = 15% savings"

**Code skeleton** ở `GAP_ANALYSIS_VI.md` → Section 5.1

---

### 8️⃣ Demand Response
**Trạng thái**: ❌ Không có  
**Chi tiết**:
- [ ] Trigger khi power > threshold
- [ ] Auto-action: Raise HVAC setpoint → 26°C, dim lighting → 75%
- [ ] Notify admin khi demand response active

---

### 9️⃣ User Activity Logging
**Trạng thái**: ❌ Không có  
**Chi tiết**:
- [ ] Log mỗi action: login, hvac-update, rule-create, alert-acknowledge
- [ ] Track: WHO did WHAT on WHICH resource
- [ ] Audit trail: Trace mọi thay đổi

---

## ✅ VALIDATION CHECKLIST

<details>
<summary>🔍 Before deploying each phase</summary>

**Phase 1 (IoT)**:
- [ ] `POST /api/iot/ingest` nhận dữ liệu mock từ Postman
- [ ] Data validation hoạt động (reject invalid values)
- [ ] Humidity field hiển thị trên dashboard
- [ ] WebSocket broadcast sensor updates

**Phase 2 (HVAC/Lighting)**:
- [ ] HVAC setpoint slider on dashboard
- [ ] `POST /api/hvac/setpoint` command được ghi log
- [ ] Lighting brightness slider + color selector
- [ ] Verify control commands không crash backend

**Phase 3 (Alerts)**:
- [ ] Alert notification popup hiển thị
- [ ] WebSocket connection stable (auto-reconnect)
- [ ] Alert history table load dữ liệu
- [ ] Acknowledge button works

**Phase 4 (Database)**:
- [ ] MongoDB connection successful
- [ ] Energy readings save → DB automatically
- [ ] Queries return data from DB (not JSON file)
- [ ] Migration script runs without errors

**Phase 5 (Analytics)**:
- [ ] Peak hour prediction returns data
- [ ] Efficiency score calculates correctly
- [ ] Cost optimizations list populated
- [ ] Maintenance alerts trigger properly

</details>

---

## 📊 PRIORITY MATRIX

```
         HIGH EFFORT
              ↑
              │ Database (4)
              │ Analytics (7)
              │
Impact        │  Alert System (4)  HVAC Control (2)
              │  Lighting (3)
              │
              │  IoT Integration (1)
              │
              ↓ Schedule (6)
         LOW EFFORT
         
Priority: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9
```

---

## 🎯 PHASING RECOMMENDATION

| Phase | Timeline | Components | Deliverable |
|-------|----------|-----------|-------------|
| **Phase 1** | Wk 1-2 | #1 IoT + #5 Schedule | Real sensor data flowing |
| **Phase 2** | Wk 3-5 | #2 HVAC + #3 Lighting | Manual + auto control |
| **Phase 3** | Wk 6-7 | #4 Alerts | Real-time notifications |
| **Phase 4** | Wk 8-9 | #5 Database | Persistent data |
| **Phase 5** | Wk 10-12 | #7 Analytics + #8 DR | Predictive insights |
| **Phase 6** | Wk 13-14 | #9 Logging + QA | Production deployment |

---

## 🚀 QUICK START

1. **Ngay hôm nay**:
   ```bash
   # Clone IoT service template từ GAP_ANALYSIS_VI.md
   # Create backend/iot-service.js
   # Add API endpoints
   ```

2. **Ngày mai**:
   ```bash
   # Test IoT ingest với Postman
   # Add humidity display to dashboard
   ```

3. **Tuần 1**:
   - [ ] IoT service 100% working
   - [ ] HVAC control module started
   - [ ] Frontend panels added

---

## 📞 NOTES

- ✅ **THIỆU KHÔNG VIẾT LẠI**: Tất cả thêm BÊN CẠNH code hiện tại, không touch Flask auth, existing APIs
- ✅ **BACKWARD COMPATIBLE**: Old APIs still work, new ones coexist
- ✅ **OPTIONAL MONGODB**: Có thể start với JSON, migrate → DB sau
- ✅ **MODULAR**: Từng phase độc lập, có thể deploy riêng lẻ

---

**Created**: 06/04/2026  
**Last Updated**: 06/04/2026  
**Status**: Ready for Phase 1 Implementation
