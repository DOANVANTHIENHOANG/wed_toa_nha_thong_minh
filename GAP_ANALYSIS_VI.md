# 🔍 PHÂN TÍCH KHỈ THIẾU & ĐỀ XUẤT BỔ SUNG - Smart Building Energy Management System

**Ngày phân tích**: 06/04/2026  
**Phiên bản hiện tại**: 2.0 (Flask + Node.js Backend)  
**Mức hoàn thiện**: ~60% (Core features có, Control & Automation chưa)

---

## 📋 MỤC LỤC

1. [Những gì hệ thống đang có](#những-gì-hệ-thống-đang-có)
2. [Những gì còn thiếu (Gap Analysis)](#những-gì-còn-thiếu-gap-analysis)
3. [Đề xuất bổ sung cụ thể](#đề-xuất-bổ-sung-cụ-thể)
4. [Priority & Roadmap](#priority--roadmap)

---

## ✔ Những gì hệ thống đang có

### 🎨 Frontend (Vue đã có)
- ✅ **Login Page**: Xác thực người dùng với role-based access (admin/user)
- ✅ **Dashboard UI**: 
  - Hiển thị công suất thực tế (kW) theo khoảng thời gian
  - Biểu đồ tiêu thụ điện năng (kWh) hàng ngày/tháng
  - Thông tin thiết bị (Sảnh chính, Văn phòng A, Server)
  - Chỉ số môi trường (Nhiệt độ: 24.5°C)
- ✅ **Device Management UI**: Bảng liệt kê thiết bị với trạng thái on/off
- ✅ **Settings Page**: Setup ngưỡng cảnh báo, giá điện
- ✅ **Real-time Updates**: WebSocket connection (Node.js backend)
- ✅ **Chart.js Integration**: Biểu đồ động (kWh, kW, device breakdown)

### 🔧 Backend (Flask - Port 3000)
- ✅ **Authentication**: Login/Register, session management, decorator-based role check
- ✅ **API Endpoints**:
  - `GET /api/stats` - Thống kê năng lượng hôm nay/tháng
  - `GET /api/devices` - Danh sách thiết bị + trạng thái
  - `POST /api/device/<id>/toggle` - Bật/tắt thiết bị (logic được định nghĩa)
  - `GET /api/settings` - Lấy cấu hình hệ thống
  - `POST /api/settings/update` - Cập nhật ngưỡng, giá điện
  - `GET /api/chart-data` - Dữ liệu cho biểu đồ
  - `POST /api/ai-analyze` - Phân tích AI đơn giản
  - `GET /api/analytics/*` - Device breakdown, forecast (LinearRegression), energy hogs
  - `GET /api/optimization/*` - Overload check, ECO mode suggestions

### 🌐 Backend (Node.js - Port 3000) - MỚI
- ✅ **5 APIs chính**:
  - `GET /api/energy/realtime` - Dữ liệu real-time (power, temp)
  - `GET /api/energy/history` - Lịch sử tiêu thụ
  - `GET /api/energy/anomaly` - Phát hiện bất thường (consumption > 1.5x avg)
  - `GET /api/energy/prediction` - Dự báo (linear regression)
  - `GET /api/energy/analytics` - Phân tích tổng hợp
- ✅ **WebSocket**: Real-time data streaming
- ✅ **Utility Functions**: Detect anomalies, predict next value, get peak hours

### 📊 Data Layer
- ✅ **Data Source**: `energy_data.json` (96 samples cho 3 devices/2 ngày)
- ✅ **Data Fields**: timestamp, device_name, location, power_consumption, occupancy
- ✅ **In-memory DB**: users_db, system_data, realtime_data, alert_logs (Python)

### 🚀 Những điều hệ thống HIỂU NGẦM nhưng chưa từng có
- HVAC control (hệ thống máy lạnh)
- Lighting control (hệ thống chiếu sáng)
- Occupancy sensors (cảm biến số lượng người)
- Humidity monitoring (giám sát độ ẩm - chỉ nhiệt độ được show)

---

## ❌ Những gì còn thiếu (Gap Analysis)

### **Lớp 1: IoT & Hardware Integration** (QUAN TRỌNG NHẤT)

| Thành phần | Cấp độ | Lý do thiếu | Tác động |
|-----------|--------|-----------|---------|
| **IoT Sensors** | Cấu trúc | Không có connection từ cảm biến vật lý | Dữ liệu chỉ mock, không reality check |
| **HVAC Control Module** | Điều khiển | Chỉ có thiết bị "Server" nhưng không control (bật/tắt thermostat, điều chỉnh nhiệt độ) | Không thể optimize độ mát |
| **Lighting Control Module** | Điều khiển | Không có end-point để control độ sáng | Dashboard không điều khiển được chiếu sáng |
| **Humidity Sensor** | Sensor | Chỉ có nhiệt độ, không có độ ẩm (tuy mô tả nhắc đến) | Không hiểu môi trường đầy đủ |
| **Occupancy Detection** | Sensor | Dữ liệu có `occupancy` field nhưng không có cảm biến thực tế | Không thể optimize theo dân số thực |

### **Lớp 2: Control & Automation** (QUAN TRỌNG)

| Thành phần | Cấp độ | Lý do thiếu | Tác động |
|-----------|--------|-----------|---------|
| **HVAC Auto Schedule** | Logic | Không có scheduler để bật/tắt HVAC theo giờ | Không thể tiết kiệm năng lượng vào giờ không sử dụng |
| **Lighting Auto Dimming** | Logic | Không có logic điều chỉnh độ sáng theo thời gian/chiếu sáng tự nhiên | Lãng phí điện vào ban ngày |
| **Demand Response** | Logic | Chỉ có "check-overload" nhưng không tự động giảm tải | Chỉ cảnh báo, không xử lý |
| **Setpoint Control** | Điều khiển | Không thể set nhiệt độ mục tiêu (setpoint) cho từng khu vực | HVAC không biết phải duy trì ở nhiệt độ nào |
| **Time-based Scheduling** | Logic | Không có cấu hình lịch chạy (schedule_off: "22:00" chỉ là string) | Không thể tự động tắt vào giờ chỉ định |

### **Lớp 3: Alert & Notification** (TRUNG BÌNH)

| Thành phần | Cấp độ | Lý do thiếu | Tác động |
|-----------|--------|-----------|---------|
| **Real-time Alerts** | Tính năng | Alert logs tồn tại nhưng không push notification | Admin không biết khi overload xảy ra |
| **Alert Persistence** | Lưu trữ | alert_logs chỉ in-memory, reset khi restart | Không có lịch sử cảnh báo |
| **Email/SMS Notifications** | Kênh | Không có integration với email/SMS | Notification chỉ qua web |
| **Alert Severity Levels** | Logic | Không có phân loại mức độ (critical/warning/info) | Không ưu tiên cảnh báo nào quan trọng |
| **Alert Acknowledgement** | Tâm lý | Không tracking xem admin đã biết hay chưa | Có thể miss critical alerts |

### **Lớp 4: Data Persistence & Analytics** (TRUNG BÌNH)

| Thành phần | Cấp độ | Lý do thiếu | Tác động |
|-----------|--------|-----------|---------|
| **Database** | Cơ sở | Chỉ có JSON file + in-memory | Dữ liệu mất khi server restart; không scale |
| **Historical Data Archival** | Lưu trữ | energy_data.json fix 2 ngày | Không có trend analysis dài hạn |
| **Device Logs** | Lưu trữ | Không track khi nào device on/off, ai thay đổi | Không audit trail |
| **User Activity Logs** | Lưu trữ | Không biết user làm gì, setting nào bị change | Không quan sát user behavior |

### **Lớp 5: Advanced Analytics** (CÓ NHƯNG CÓ HẠNCHẾ)

| Thành phần | Cấp độ | Status | Lý do |
|-----------|--------|--------|--------|
| **Forecast** | 50% | Có LinearRegression nhưng chỉ 1 model | Không tuned, accuracy không rõ ràng |
| **Anomaly Detection** | 40% | Có simple 1.5x avg rule | Quá naive, không catch false positives |
| **Demand Peak Shaving** | 0% | Không có | Không thể plan trước peak hours |
| **Predictive Maintenance** | 0% | Không có | Không biết device sẽ fail khi nào |

### **Lớp 6: System Reliability** (CÓ HẠNCHẾ)

| Thành phần | Cấp độ | Status | Lý do |
|-----------|--------|--------|--------|
| **Error Handling** | 60% | API trả về JSON error nhưng không comprehensive | Missing validation, edge cases |
| **Data Validation** | 50% | Có nhưng không strict | Có thể nhập occupancy = -100, temp = 999 |
| **API Rate Limiting** | 0% | Không có | Có thể spam requests |
| **Health Checks** | 0% | Không có | Không biết service đang live hay crash |
| **Backup Strategy** | 0% | Không có | Dữ liệu có thể mất |

---

## ➕ Đề xuất bổ sung cụ thể

### **GIAI ĐOẠN 1: IoT Integration (2 tuần)**

#### 1.1 Backend: Tạo IoT Data Ingestion Layer

**File bổ sung**: `backend/iot-service.js` (Node.js)

```javascript
// backend/iot-service.js - IoT Device Data Handler
import { EventEmitter } from 'events';

class IoTService extends EventEmitter {
  constructor() {
    super();
    this.devices = {};
    this.sensorData = {};
  }

  // Nhận dữ liệu từ sensor (MQTT hoặc HTTP)
  receiveSensorData(deviceId, sensorType, value, timestamp = Date.now()) {
    const key = `${deviceId}:${sensorType}`;
    
    // Validate dữ liệu
    if (!this.validateSensorData(sensorType, value)) {
      console.log(`❌ Invalid ${sensorType} data for device ${deviceId}`);
      return false;
    }
    
    // Lưu vào memory + database
    this.sensorData[key] = { value, timestamp, status: 'active' };
    
    // Emit event cho downstream
    this.emit('sensor-update', { deviceId, sensorType, value, timestamp });
    return true;
  }

  // Validate theo khoảng hợp lý
  validateSensorData(sensorType, value) {
    const validators = {
      'temperature': (v) => v >= 15 && v <= 35,        // 15-35°C reasonable
      'humidity': (v) => v >= 0 && v <= 100,           // 0-100%
      'power': (v) => v >= 0 && v <= 50,               // 0-50kW per device
      'occupancy': (v) => Number.isInteger(v) && v >= 0  // Non-negative integers
    };
    
    const validator = validators[sensorType];
    return validator ? validator(value) : false;
  }

  // Register device
  registerDevice(deviceId, deviceType, location, sensors = []) {
    this.devices[deviceId] = { 
      id: deviceId, 
      type: deviceType,        // 'hvac', 'lighting', 'server', etc
      location, 
      sensors,                 // ['temperature', 'humidity', 'power']
      status: 'online',
      lastSeen: Date.now()
    };
  }

  // Get current sensor reading
  getSensorReading(deviceId, sensorType) {
    const key = `${deviceId}:${sensorType}`;
    return this.sensorData[key];
  }
}

export default new IoTService();
```

**Backend API bổ sung**:
```javascript
// POST /api/iot/ingest - Receive sensor data
app.post('/api/iot/ingest', (req, res) => {
  const { device_id, sensor_type, value, timestamp } = req.body;
  
  const success = iotService.receiveSensorData(device_id, sensor_type, value, timestamp);
  res.json({ success, message: success ? 'Data recorded' : 'Invalid data' });
});

// GET /api/iot/devices - Get all registered devices
app.get('/api/iot/devices', (req, res) => {
  res.json({ devices: iotService.devices });
});

// GET /api/iot/reading/:deviceId/:sensorType
app.get('/api/iot/reading/:deviceId/:sensorType', (req, res) => {
  const { deviceId, sensorType } = req.params;
  const reading = iotService.getSensorReading(deviceId, sensorType);
  res.json({ reading: reading || null });
});
```

#### 1.2 Frontend: Display Real Sensor Data

**Bổ sung vào dashboard.html**:
```html
<!-- Humidity Display (hiện tại chỉ có temperature) -->
<div class="stat-card">
  <i class="fas fa-droplet" style="color: #06b6d4;"></i>
  <div class="stat-info">
    <h3>Độ ẩm</h3>
    <p id="humidity-value">--</p>
    <small>%</small>
  </div>
</div>

<script>
  // Update humidity every 5s
  async function updateEnvironmental() {
    const humidityReading = await energyAPI.getSensorReading('building-1', 'humidity');
    if (humidityReading) {
      document.getElementById('humidity-value').textContent = 
        humidityReading.value.toFixed(1);
    }
  }
  
  setInterval(updateEnvironmental, 3000);
</script>
```

---

### **GIAI ĐOẠN 2: HVAC & Lighting Control** (3 tuần)

#### 2.1 Backend: Control Module

**File bổ sung**: `backend/control-service.js`

```javascript
// backend/control-service.js - HVAC & Lighting Control Logic
class ControlService {
  constructor() {
    this.devices = {};
    this.controlRules = {};
  }

  // HVAC Control Interface
  setHVACSetpoint(deviceId, temperature, mode = 'cool') {
    // mode: 'cool', 'heat', 'auto', 'off'
    const command = {
      device_id: deviceId,
      action: 'set_temperature',
      target_temp: temperature,      // °C
      mode: mode,
      timestamp: new Date().toISOString()
    };
    
    // Send to device via MQTT/HTTP
    this.sendControlCommand(command);
    
    // Log action
    return {
      success: true,
      command: command,
      message: `HVAC set to ${temperature}°C in ${mode} mode`
    };
  }

  // Lighting Control Interface
  setLightingLevel(deviceId, brightness = 100, colorTemp = 'daylight') {
    // brightness: 0-100 (%)
    // colorTemp: 'warm' (2700K), 'neutral' (4000K), 'daylight' (6500K)
    const command = {
      device_id: deviceId,
      action: 'set_brightness',
      brightness: brightness,
      color_temp: colorTemp,
      timestamp: new Date().toISOString()
    };
    
    this.sendControlCommand(command);
    
    return {
      success: true,
      command: command,
      message: `Light set to ${brightness}%`
    };
  }

  // Auto Scheduling (mixin với time-based logic)
  createScheduleRule(deviceId, deviceType, rules = []) {
    // rules: Array of { time: "HH:MM", action: {...}, days: [0-6] }
    // Example:
    // { time: "22:00", action: { type: 'hvac', target_temp: 22, mode: 'auto' }, days: [0,1,2,3,4,5,6] }
    
    this.controlRules[deviceId] = rules;
    
    // Setup cron-like scheduler
    this.scheduleRuleExecution(deviceId);
    
    return { success: true, ruleId: deviceId, ruleCount: rules.length };
  }

  // Demand Response: Automatically reduce load during peak hours
  activateDemandResponse(maxPowerLimit = 15.0) {
    // When current power > threshold, reduce non-critical loads
    console.log(`🚨 Demand Response: Reducing to ${maxPowerLimit}kW`);
    
    // 1. Reduce HVAC to energy-save mode
    this.setHVACSetpoint('hvac-main', 26, 'auto');  // Relax setpoint
    
    // 2. Reduce lighting
    this.setLightingLevel('lighting-main', 75);      // 75% brightness
    
    // 3. Shed non-critical loads
    // (could pause server backups, etc.)
    
    return { success: true, action: 'demand-response-active' };
  }

  // Internal: Send command to device
  async sendControlCommand(command) {
    // Could be MQTT, HTTP, or direct device API
    console.log('📤 Sending control command:', command);
    // await deviceAPI.send(command);
  }

  // Internal: Schedule rule execution
  scheduleRuleExecution(deviceId) {
    // Implementation using node-cron or similar
  }
}

export default new ControlService();
```

**Backend APIs**:
```javascript
// POST /api/hvac/setpoint - Set HVAC target temperature
app.post('/api/hvac/setpoint', (req, res) => {
  const { device_id, temperature, mode } = req.body;
  const result = controlService.setHVACSetpoint(device_id, temperature, mode);
  res.json(result);
});

// POST /api/lighting/brightness - Set lighting level
app.post('/api/lighting/brightness', (req, res) => {
  const { device_id, brightness, color_temp } = req.body;
  const result = controlService.setLightingLevel(device_id, brightness, color_temp);
  res.json(result);
});

// POST /api/schedule/create - Create control schedule
app.post('/api/schedule/create', (req, res) => {
  const { device_id, device_type, rules } = req.body;
  const result = controlService.createScheduleRule(device_id, device_type, rules);
  res.json(result);
});

// POST /api/demandresponse/activate - Activate demand response
app.post('/api/demandresponse/activate', (req, res) => {
  const { max_power_limit } = req.body;
  const result = controlService.activateDemandResponse(max_power_limit);
  res.json(result);
});
```

#### 2.2 Frontend: Control Panel

**Bổ sung vào dashboard.html**:
```html
<!-- HVAC Control Panel -->
<div class="glass-card">
  <h3>🌡️ HVAC Quản lý khí hậu</h3>
  <div class="control-section">
    <label>Nhiệt độ mục tiêu (°C):</label>
    <input type="range" id="hvac-temp" min="18" max="28" value="24" step="0.5">
    <span id="hvac-display">24°C</span>
    
    <label>Chế độ hoạt động:</label>
    <select id="hvac-mode">
      <option value="cool">Làm mát</option>
      <option value="heat">Sưởi ấm</option>
      <option value="auto">Tự động</option>
      <option value="off">Tắt</option>
    </select>
    
    <button onclick="updateHVAC()">Áp dụng</button>
  </div>
</div>

<!-- Lighting Control Panel -->
<div class="glass-card">
  <h3>💡 Chiếu sáng</h3>
  <div class="control-section">
    <label>Độ sáng (%):</label>
    <input type="range" id="lighting-brightness" min="0" max="100" value="80">
    <span id="lighting-display">80%</span>
    
    <label>Màu sắc ánh sáng:</label>
    <select id="lighting-color">
      <option value="warm">Ấm (2700K)</option>
      <option value="neutral">Trung tính (4000K)</option>
      <option value="daylight">Ban ngày (6500K)</option>
    </select>
    
    <button onclick="updateLighting()">Áp dụng</button>
  </div>
</div>

<script>
  // HVAC Update
  document.getElementById('hvac-temp').addEventListener('input', (e) => {
    document.getElementById('hvac-display').textContent = e.target.value + '°C';
  });
  
  async function updateHVAC() {
    const temp = document.getElementById('hvac-temp').value;
    const mode = document.getElementById('hvac-mode').value;
    
    const response = await fetch('http://192.168.1.19:3000/api/hvac/setpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_id: 'hvac-main', temperature: temp, mode: mode })
    });
    
    const result = await response.json();
    alert(result.message);
  }
  
  // Lighting Update
  document.getElementById('lighting-brightness').addEventListener('input', (e) => {
    document.getElementById('lighting-display').textContent = e.target.value + '%';
  });
  
  async function updateLighting() {
    const brightness = document.getElementById('lighting-brightness').value;
    const colorTemp = document.getElementById('lighting-color').value;
    
    const response = await fetch('http://192.168.1.19:3000/api/lighting/brightness', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        device_id: 'lighting-main', 
        brightness: brightness, 
        color_temp: colorTemp 
      })
    });
    
    const result = await response.json();
    alert(result.message);
  }
</script>
```

---

### **GIAI ĐOẠN 3: Alert & Notification System** (2 tuần)

#### 3.1 Backend: Alert Service

**File bổ sung**: `backend/alert-service.js`

```javascript
// backend/alert-service.js - Advanced Alert Management
class AlertService {
  constructor() {
    this.alerts = [];         // In-memory queue (should use database)
    this.alertRules = {};
    this.subscribers = [];    // WebSocket clients
  }

  // Create alert with severity levels
  triggerAlert(alertData) {
    const alert = {
      id: `alert-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      severity: alertData.severity || 'warning',    // 'critical', 'warning', 'info'
      type: alertData.type || 'generic',            // 'overload', 'sensor-fail', 'maintenance'
      title: alertData.title,
      message: alertData.message,
      deviceId: alertData.device_id || null,
      acknowledged: false,
      acknowledgedBy: null,
      acknowledgedAt: null
    };
    
    // Store alert
    this.alerts.push(alert);
    
    // Broadcast to connected clients
    this.broadcastAlert(alert);
    
    // Send notifications based on severity
    if (alert.severity === 'critical') {
      this.sendNotification(alert, 'email');  // Critical → Email + SMS
      this.sendNotification(alert, 'sms');
    } else if (alert.severity === 'warning') {
      this.sendNotification(alert, 'email');  // Warning → Email
    }
    
    // Log to persistent storage
    this.persistAlert(alert);
    
    return alert;
  }

  // Acknowledge alert
  acknowledgeAlert(alertId, userId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = userId;
      alert.acknowledgedAt = new Date().toISOString();
    }
    return alert;
  }

  // Get alerts (with filtering)
  getAlerts(options = {}) {
    let result = this.alerts;
    
    if (options.severity) {
      result = result.filter(a => a.severity === options.severity);
    }
    
    if (options.acknowledged !== undefined) {
      result = result.filter(a => a.acknowledged === options.acknowledged);
    }
    
    if (options.limit) {
      result = result.slice(-options.limit);  // Last N alerts
    }
    
    return result;
  }

  // Define alert rules (trigger on condition)
  createAlertRule(rule) {
    // Example:
    // { condition: 'power > 15', severity: 'warning', message: 'Overload detected' }
    this.alertRules[rule.id] = rule;
    return rule;
  }

  // Check conditions and trigger if needed
  evaluateAlertRules(systemState) {
    Object.values(this.alertRules).forEach(rule => {
      // Simplified condition evaluation (in production, use expression parser)
      if (this.evaluateCondition(rule.condition, systemState)) {
        this.triggerAlert({
          type: 'rule-triggered',
          severity: rule.severity,
          title: rule.title,
          message: rule.message,
          device_id: rule.device_id
        });
      }
    });
  }

  // Internal: Send notification (email/SMS)
  sendNotification(alert, channel) {
    if (channel === 'email') {
      console.log(`✉️  Sending email alert: ${alert.title}`);
      // await emailService.send({...});
    } else if (channel === 'sms') {
      console.log(`📱 Sending SMS alert: ${alert.title}`);
      // await smsService.send({...});
    }
  }

  // Internal: Broadcast to WebSocket clients
  broadcastAlert(alert) {
    this.subscribers.forEach(client => {
      client.send(JSON.stringify({ type: 'alert', data: alert }));
    });
  }

  // Internal: Persist to database
  async persistAlert(alert) {
    // TODO: Save to MongoDB/PostgreSQL
  }

  // Internal: Evaluate condition
  evaluateCondition(condition, state) {
    // Simple evaluation: "power > 15"
    // In production, use safer expression parser (e.g., expr)
    try {
      return eval(`${condition}`);  // Dangerous in production!
    } catch {
      return false;
    }
  }
}

export default new AlertService();
```

**Backend APIs**:
```javascript
// GET /api/alerts - Get alerts
app.get('/api/alerts', (req, res) => {
  const { severity, acknowledged, limit } = req.query;
  const alerts = alertService.getAlerts({
    severity,
    acknowledged: acknowledged ? JSON.parse(acknowledged) : undefined,
    limit: limit ? parseInt(limit) : 50
  });
  res.json({ alerts, count: alerts.length });
});

// POST /api/alerts/:alertId/acknowledge - Acknowledge alert
app.post('/api/alerts/:alertId/acknowledge', require_login, (req, res) => {
  const { alertId } = req.params;
  const userId = session.username;
  
  const alert = alertService.acknowledgeAlert(alertId, userId);
  res.json({ success: true, alert });
});

// POST /api/alerts/rules/create - Create alert rule
app.post('/api/alerts/rules/create', require_admin, (req, res) => {
  const rule = alertService.createAlertRule(req.body);
  res.json({ success: true, rule });
});
```

#### 3.2 Frontend: Alert Notification UI

**Bổ sung vào dashboard.html**:
```html
<!-- Alert Notification Center -->
<div id="alert-notification" class="notification-panel" style="position: fixed; top: 20px; right: 20px; max-width: 400px; z-index: 1000;">
  <!-- Alerts will be inserted here -->
</div>

<!-- Alert History Modal -->
<div id="alert-history-modal" class="modal" style="display: none;">
  <div class="modal-content">
    <h3>Lịch sử cảnh báo</h3>
    <table id="alert-history-table">
      <thead>
        <tr>
          <th>Thời gian</th>
          <th>Mức độ</th>
          <th>Nội dung</th>
          <th>Trạng thái</th>
        </tr>
      </thead>
      <tbody id="alert-history-body"></tbody>
    </table>
  </div>
</div>

<script>
  // WebSocket connection for real-time alerts
  const ws = new WebSocket('ws://192.168.1.19:3000');
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'alert') {
      displayAlert(data.data);
    }
  };
  
  function displayAlert(alert) {
    const notificationDiv = document.getElementById('alert-notification');
    
    // Determine color based on severity
    const colorClass = {
      'critical': 'alert-critical',     // Red
      'warning': 'alert-warning',        // Orange
      'info': 'alert-info'               // Blue
    }[alert.severity];
    
    const alertElement = document.createElement('div');
    alertElement.className = `alert-item ${colorClass}`;
    alertElement.innerHTML = `
      <div class="alert-header">
        <strong>${alert.title}</strong>
        <span class="alert-time">${new Date(alert.timestamp).toLocaleTimeString('vi-VN')}</span>
      </div>
      <div class="alert-body">${alert.message}</div>
      <div class="alert-actions">
        <button onclick="acknowledgeAlert('${alert.id}')">Đã biết</button>
        <button onclick="dismissAlert(this)">Đóng</button>
      </div>
    `;
    
    notificationDiv.insertBefore(alertElement, notificationDiv.firstChild);
    
    // Auto-dismiss after 10 seconds for info alerts
    if (alert.severity === 'info') {
      setTimeout(() => alertElement.remove(), 10000);
    }
  }
  
  async function acknowledgeAlert(alertId) {
    const response = await fetch(`http://192.168.1.19:3000/api/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      alert('Đã xác nhận cảnh báo');
    }
  }
  
  function dismissAlert(element) {
    element.parentElement.remove();
  }

  // CSS for notifications
  const style = document.createElement('style');
  style.textContent = `
    .alert-item {
      background: rgba(239, 68, 68, 0.1);
      border-left: 4px solid #ef4444;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 8px;
      color: white;
    }
    .alert-critical { border-left-color: #dc2626; }
    .alert-warning { 
      background: rgba(245, 158, 11, 0.1);
      border-left-color: #f59e0b;
    }
    .alert-info {
      background: rgba(59, 130, 246, 0.1);
      border-left-color: #3b82f6;
    }
    .alert-actions { margin-top: 10px; display: flex; gap: 10px; }
    .alert-actions button { 
      padding: 6px 12px; 
      border: none; 
      background: rgba(255,255,255,0.1); 
      color: white; 
      border-radius: 4px; 
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);
</script>
```

---

### **GIAI ĐOẠN 4: Data Persistence** (2 tuần)

#### 4.1 Database Schema (MongoDB ví dụ)

```javascript
// backend/models/schemas.js - Database Schema Definitions

// Energy readings collection
const energyReadingSchema = {
  timestamp: Date,
  device_id: String,      // 'hvac-main', 'lighting-main', etc.
  device_name: String,
  location: String,
  power_consumption: Number,  // kW
  temperature: Number,        // °C
  humidity: Number,          // %
  occupancy: Number
};

// Device configuration collection
const deviceConfigSchema = {
  device_id: String,
  device_type: String,       // 'hvac', 'lighting', 'sensor', 'server'
  name: String,
  location: String,
  status: String,            // 'active', 'inactive', 'fault'
  setpoint: Number,          // For HVAC: target temp
  mode: String,              // For HVAC: 'cool', 'heat', 'auto'
  sensitivity: Number        // For sensors
};

// Control rules collection
const controlRuleSchema = {
  rule_id: String,
  device_id: String,
  rule_type: String,        // 'schedule', 'threshold', 'occupancy'
  active: Boolean,
  schedule: [{
    time: String,           // "HH:MM"
    action: Object,         // { type: 'hvac', target_temp: 24 }
    days: Array             // [1,2,3,4,5] = Mon-Fri
  }],
  created_at: Date,
  created_by: String       // admin user
};

// Alert logs collection
const alertLogSchema = {
  alert_id: String,
  timestamp: Date,
  severity: String,         // 'critical', 'warning', 'info'
  type: String,            // 'overload', 'sensor-fail', etc.
  title: String,
  message: String,
  device_id: String,
  acknowledged: Boolean,
  acknowledged_by: String,
  acknowledged_at: Date
};

// User activity logs collection
const activityLogSchema = {
  user_id: String,
  action: String,          // 'login', 'hvac-update', 'rule-create', etc.
  resource: String,        // 'device', 'rule', 'setting'
  resource_id: String,
  changes: Object,         // What was changed
  timestamp: Date
};
```

#### 4.2 Backend: Database Integration

```javascript
// backend/db-service.js - Database Operations
import mongoose from 'mongoose';

class DatabaseService {
  async connect(mongoURI) {
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
  }

  // Save energy reading
  async saveEnergyReading(data) {
    const reading = new EnergyReading(data);
    return await reading.save();
  }

  // Get historical data (for forecasting)
  async getHistoricalData(deviceId, startDate, endDate) {
    return await EnergyReading.find({
      device_id: deviceId,
      timestamp: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: 1 });
  }

  // Get active control rules
  async getActiveRules(deviceId = null) {
    const filter = { active: true };
    if (deviceId) filter.device_id = deviceId;
    return await ControlRule.find(filter);
  }

  // Save alert
  async saveAlert(alertData) {
    const alert = new AlertLog(alertData);
    return await alert.save();
  }

  // Log user activity
  async logActivity(userId, action, resource, resourceId, changes) {
    const log = new ActivityLog({
      user_id: userId,
      action,
      resource,
      resource_id: resourceId,
      changes,
      timestamp: new Date()
    });
    return await log.save();
  }
}

export default new DatabaseService();
```

**Migration path từ JSON → MongoDB**:
```javascript
// backend/scripts/migrate-to-db.js - One-time migration script
async function migrateEnergyData() {
  const jsonData = require('../data/energy_data.json');
  
  for (const record of jsonData.data) {
    await dbService.saveEnergyReading({
      timestamp: new Date(record.timestamp),
      device_id: record.device_name.toLowerCase().replace(' ', '-'),
      device_name: record.device_name,
      location: record.location,
      power_consumption: record.power_consumption,
      occupancy: record.occupancy
    });
  }
  
  console.log(`✅ Migrated ${jsonData.data.length} records to MongoDB`);
}

// Run: node migrate-to-db.js
```

---

### **GIAI ĐOẠN 5: Advanced Analytics** (3 tuần)

#### 5.1 Backend: Enhanced Analytics

```javascript
// backend/analytics-advanced.js - Advanced ML & Analytics

class AdvancedAnalytics {
  // 1. Demand Peak Shaving Prediction
  predictPeakHours(historicalData) {
    // Analyze consumption patterns
    const hourlyPatterns = this.getHourlyAverages(historicalData);
    
    // Find top 3 peak hours
    const peaks = Object.entries(hourlyPatterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => ({ hour: entry[0], avgLoad: entry[1] }));
    
    return {
      peak_hours: peaks,
      recommendation: `Pre-cool to 22°C before ${peaks[0].hour}:00 to save energy during peak`
    };
  }

  // 2. Predictive Device Maintenance
  detectDeviceStress(deviceHistoricalData) {
    // Check for trending up in power consumption (indicates wear)
    const trend = this.calculateTrend(deviceHistoricalData);
    
    if (trend.slope > 0.05) {
      return {
        device_stress_level: 'high',
        power_increase_rate: trend.slope,
        prediction: 'Device may fail in 30-45 days',
        recommendation: 'Schedule maintenance inspection'
      };
    }
    
    return { device_stress_level: 'normal' };
  }

  // 3. Energy Efficiency Score
  calculateEfficiencyScore(deviceData, occupancyData) {
    // Energy per person per hour
    const energyPerOccupant = this.getAvgEnergyPerOccupant(deviceData, occupancyData);
    
    // Benchmark (kWh per person-hour)
    const benchmark = { 'hvac': 0.15, 'lighting': 0.05, 'office': 0.20 };
    
    const score = Math.max(0, 100 - ((energyPerOccupant / benchmark) * 100));
    
    return {
      efficiency_score: Math.round(score),
      benchmark: benchmark,
      message: score > 80 ? '✅ Excellent' : score > 60 ? '⚠️ Average' : '❌ Poor',
      recommendation: 'Consider LED upgrade' if score < 60
    };
  }

  // 4. Cost Optimization Recommendations
  getCostOptimizations(historicalData, costPerKwh) {
    const recommendations = [];
    
    // Check if peak hour rates apply
    if (this.hasPeakHourRatings()) {
      recommendations.push({
        type: 'shift-load',
        savings_percent: 15,
        text: 'Shift 30% of daytime loads to off-peak hours to reduce peak charges'
      });
    }
    
    // Check occupancy vs lighting
    const occupancyVsLighting = this.analyzeOccupancyVsLighting(historicalData);
    if (occupancyVsLighting.inefficiency > 20) {
      recommendations.push({
        type: 'occupancy-sensing',
        savings_percent: 12,
        text: 'Install occupancy sensors for 12% lighting reduction'
      });
    }
    
    // HVAC tuning
    recommendations.push({
      type: 'hvac-tune',
      savings_percent: 10,
      text: 'Raise setpoint by 1°C in summer = 10% HVAC savings'
    });
    
    return recommendations;
  }

  // Helper methods
  getHourlyAverages(data) { /* ... */ }
  calculateTrend(data) { /* ... */ }
  getAvgEnergyPerOccupant(data, occupancy) { /* ... */ }
  analyzeOccupancyVsLighting(data) { /* ... */ }
  hasPeakHourRatings() { /* ... */ }
}

export default new AdvancedAnalytics();
```

**APIs**:
```javascript
// GET /api/analytics/peak-prediction
app.get('/api/analytics/peak-prediction', async (req, res) => {
  const data = await dbService.getHistoricalData(null, startDate, endDate);
  const prediction = advancedAnalytics.predictPeakHours(data);
  res.json(prediction);
});

// GET /api/device/:deviceId/maintenance
app.get('/api/device/:deviceId/maintenance', async (req, res) => {
  const data = await dbService.getHistoricalData(req.params.deviceId, startDate, endDate);
  const stress = advancedAnalytics.detectDeviceStress(data);
  res.json(stress);
});

// GET /api/analytics/efficiency-score
app.get('/api/analytics/efficiency-score', async (req, res) => {
  const energyData = await dbService.getHistoricalData(null, startDate, endDate);
  const occupancyData = await dbService.getOccupancyData(startDate, endDate);
  const score = advancedAnalytics.calculateEfficiencyScore(energyData, occupancyData);
  res.json(score);
});
```

#### 5.2 Frontend: Display Advanced Insights

```html
<!-- Advanced Analytics Dashboard Tab -->
<div id="analytics-tab" class="tab-content">
  <!-- Efficiency Score Card -->
  <div class="glass-card">
    <h3>🎯 Điểm hiệu suất năng lượng</h3>
    <div id="efficiency-score-display" style="font-size: 48px; font-weight: bold; text-align: center; margin: 20px 0;">
      --/100
    </div>
    <p id="efficiency-message" style="text-align: center;"></p>
  </div>

  <!-- Cost Optimization Recommendations -->
  <div class="glass-card">
    <h3>💰 Khuyến nghị tiết kiệm chi phí</h3>
    <div id="optimization-recommendations"></div>
  </div>

  <!-- Maintenance Alerts -->
  <div class="glass-card">
    <h3>🔧 Cảnh báo bảo trì</h3>
    <div id="maintenance-alerts"></div>
  </div>

 <!-- Peak Hour Prediction -->
  <div class="glass-card">
    <h3>📊 Dự báo giờ cao điểm</h3>
    <div id="peak-hours-display"></div>
  </div>
</div>

<script>
  async function updateAdvancedAnalytics() {
    // Efficiency Score
    const efficiencyRes = await fetch('http://192.168.1.19:3000/api/analytics/efficiency-score');
    const efficiency = await efficiencyRes.json();
    document.getElementById('efficiency-score-display').textContent = `${efficiency.efficiency_score}/100`;
    document.getElementById('efficiency-message').textContent = efficiency.message;

    // Cost Optimizations
    const optRes = await fetch('http://192.168.1.19:3000/api/analytics/cost-optimizations');
    const optimizations = await optRes.json();
    const optHTML = optimizations.recommendations
      .map(r => `<div><strong>${r.text}</strong> - ${r.savings_percent}% tiết kiệm</div>`)
      .join('');
    document.getElementById('optimization-recommendations').innerHTML = optHTML;

    // Maintenance Alerts
    const mainRes = await fetch('http://192.168.1.19:3000/api/device/hvac-main/maintenance');
    const maintenance = await mainRes.json();
    const mainHTML = maintenance.device_stress_level === 'high'
      ? `<p style="color: #ef4444;">⚠️ ${maintenance.prediction}</p><p>${maintenance.recommendation}</p>`
      : `<p style="color: #10b981;">✅ Thiết bị hoạt động bình thường</p>`;
    document.getElementById('maintenance-alerts').innerHTML = mainHTML;

    // Peak Hours
    const peakRes = await fetch('http://192.168.1.19:3000/api/analytics/peak-prediction');
    const peaks = await peakRes.json();
    const peakHTML = peaks.peak_hours
      .map(p => `<p>Giờ ${p.hour}: ${p.avgLoad} kW</p>`)
      .join('');
    document.getElementById('peak-hours-display').innerHTML = 
      `<p><strong>Khuyến nghị:</strong> ${peaks.recommendation}</p>${peakHTML}`;
  }

  setInterval(updateAdvancedAnalytics, 60000);  // Update mỗi phút
  updateAdvancedAnalytics();  // Initial load
</script>
```

---

## 🎯 Priority & Roadmap

### ✅ **MỨC ĐỘ HOÀN THÀNH HIỆN TẠI: 60%**

```
HOÀN THÀNH (60%)
├── ✅ Authentication & Role Management
├── ✅ Real-time Dashboard UI
├── ✅ Energy Monitoring (kWh, kW)
├── ✅ Device Status & Toggle
├── ✅ Basic Analytics (device breakdown, forecast)
├── ✅ Settings Management
├── ✅ Mobile Responsive
└── ✅ WebSocket Real-time Updates

CÒN THIẾU (40%)
├── ❌ IoT Sensor Integration
├── ❌ HVAC Auto Control
├── ❌ Lighting Smart Control
├── ❌ Advanced Alert System
├── ❌ Database Persistence
├── ❌ Predictive Maintenance
├── ❌ Demand Response
├── ❌ Activity Logging
└── ❌ Email/SMS Notifications
```

### 📅 **RECOMMENDED TIMELINE**

| Phase | Component | Effort | Timeline | Benefit |
|-------|-----------|--------|----------|---------|
| **1** | IoT Integration | 2 weeks | Week 1-2 | Real sensor data (vs mock) |
| **2** | HVAC & Lighting Control | 3 weeks | Week 3-5 | Actual savings, automation |
| **3** | Alert System | 2 weeks | Week 6-7 | Proactive management |
| **4** | Database Persistence | 2 weeks | Week 8-9 | Reliable data, audit trail |
| **5** | Advanced Analytics | 3 weeks | Week 10-12 | Predictive insights, ROI |
| **6** | Deployment & Testing | 2 weeks | Week 13-14 | Production ready |
|  | **TOTAL** | **14 weeks** | **~3.5 months** | **Fully operational system** |

---

## 💡 **IMPLEMENTATION GUIDELINES**

### ✅ Những gì KHÔNG thay đổi
- Flask authentication & session management (hoàn toàn để nguyên)
- Existing API endpoints (thêm mới, không delete old)
- Dashboard UI structure (chỉ expand, không refactor)
- Database JSON file (compatible với old code)

### ➕ Những gì THÊM
- Node.js backend (port 3000) - song song với Flask
- MongoDB (port 27017) - optional cho persistent storage
- New API routes `/api/iot/*`, `/api/hvac/*`, `/api/lighting/*`, etc.
- New frontend components (HVAC panel, lighting control, alerts)
- Control service & IoT service modules

### 🔄 Integration Points
1. **Frontend** gọi **Node.js APIs** (new) + **Flask APIs** (old)
2. **Node.js** đọc dữ liệu từ **JSON** hoặc **MongoDB**
3. **Flask** vẫn handle authentication, session
4. **WebSocket** broadcast từ Node.js → Frontend

---

## 🚀 **NEXT STEPS**

1. **Phase 1 priority**: Setup IoT service (`iot-service.js`) + MongoDB
2. **Phase 2 priority**: Implement HVAC & Lighting control modules
3. **Phase 3 priority**: Deploy alerting system with WebSocket broadcasting
4. **Validation**: Test mỗi phase với mock IoT data trước khi connect real sensors

**KHÔNG nên** đợi hết toàn bộ 14 tuần - có thể deploy từng phase, gain value từ sớm. 

---

**End of Gap Analysis**  
*For implementation details, see individual phase sections above.*
