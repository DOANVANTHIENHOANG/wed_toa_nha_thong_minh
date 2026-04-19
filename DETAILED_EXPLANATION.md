# 📚 HƯỚNG DẪN CHI TIẾT - TẤT CẢ FILE VÀ CÚ PHÁP

Tài liệu này giải thích chi tiết mọi file đã tạo, tác dụng & cú pháp của từng phần code.

---

## 📑 DANH SÁCH TẤT CẢ FILE

### Folder Backend (Node.js)
```
backend/
├── server.js          - Express server + 5 APIs + WebSocket
├── package.json       - Dependencies & scripts
├── .env              - Configuration
└── README.md         - Documentation
```

### Folder Static (Frontend)
```
static/
├── api-client.js     - NEW: Frontend API client
├── main.js           - Unchanged
└── style.css         - Unchanged
```

### Templates (HTML)
```
templates/
├── index.html        - MODIFIED: Added API integration
└── [others]          - Unchanged
```

### Root Documentation
```
├── BACKEND_SETUP.md       - Setup guide
├── INTEGRATION_EXAMPLES.md - Code examples
├── UPGRADE_SUMMARY.md      - Change log
└── ARCHITECTURE.md        - System design
```

---

# 🔍 FILE CHI TIẾT - GIẢI THÍCH CÚ PHÁP

## 1️⃣ `backend/package.json`

### Tác dụng
- Khai báo dependencies (thư viện cần dùng)
- Định nghĩa scripts (lệnh chạy)
- Metadata của project

### Chi tiết từng phần

```json
{
  "name": "smart-energy-backend",
  // ↳ Tên project (cho npm registry)

  "version": "2.0.0",
  // ↳ Phiên bản project (dùng Semantic Versioning)
  // ↳ Major.Minor.Patch (2.0.0 = đổi toàn bộ)

  "description": "Smart Building Energy Management System - Node.js Express Backend",
  // ↳ Mô tả dự án (cho npm search)

  "main": "server.js",
  // ↳ File chính được chạy khi import package này

  "type": "module",
  // ↳ LỰC QUAN TRỌNG! Cho phép dùng ES6 modules
  // ↳ Mà không cần .mjs extension
  // ↳ Giúp dùng: import fs from 'fs'
  // ↳ Thay vì: const fs = require('fs')

  "scripts": {
    "start": "node server.js",
    // ↳ Lệnh: npm start
    // ↳ Chạy: node server.js (production)

    "dev": "node --watch server.js"
    // ↳ Lệnh: npm run dev
    // ↳ Chạy: node với flag --watch
    // ↳ Flag --watch = tự reload khi file thay đổi
    // ↳ Tiện cho development
  },

  "keywords": ["energy", "management", "iot", "analytics"],
  // ↳ Keywords cho npm search

  "author": "Smart Energy Team",
  "license": "MIT",
  // ↳ Metadata về tác giả & license

  "dependencies": {
    "express": "^4.18.2",
    // ↳ express = web framework
    // ↳ ^4.18.2 = có thể cập nhật minor/patch
    // ↳ Tức: 4.18.2, 4.18.3, 4.19.0 được
    // ↳ Nhưng không được 5.0.0 (major change)

    "cors": "^2.8.5",
    // ↳ cors = cho phép cross-origin requests
    // ↳ Mà không bị browser block

    "ws": "^8.14.0",
    // ↳ ws = WebSocket library
    // ↳ Dùng cho real-time communication

    "dotenv": "^16.3.1"
    // ↳ dotenv = Load biến từ .env file
    // ↳ Giúp: process.env.PORT, process.env.NODE_ENV, etc.
  }
}
```

### Lệnh thường dùng
```bash
npm install              # Cài tất cả dependencies từ package.json
npm start                # Chạy: node server.js (production)
npm run dev              # Chạy: node --watch server.js (development)
npm list                 # Hiển thị tất cả packages đã cài
npm update               # Update dependencies mới nhất
npm uninstall express    # Xoá một package
```

---

## 2️⃣ `backend/.env`

### Tác dụng
- Lưu trữ config (không hard-code trong code)
- Giúp ENV khác nhau (dev/prod) có setting khác nhau
- Bảo mật: không commit `.env` lên git

### Chi tiết

```env
# Dòng này là comment

PORT=3000
# Mục đích: Định nghĩa port server chạy
# Cách dùng: const PORT = process.env.PORT || 3000
# Ý nghĩa: PORT từ .env, nếu không có thì default 3000

NODE_ENV=development
# Mục đích: Môi trường (development/production)
# Cách dùng: if (process.env.NODE_ENV === 'production') { ... }
# Ý nghĩa: Server thay đổi hành động dựa trên env

API_TIMEOUT=30000
# Mục đích: Timeout cho API requests (ms)
# Cách dùng: Nếu request > 30000ms (30s) thì return error
# Tại sao: Tránh server bị hang + waste resources

MAX_REQUESTS_PER_MINUTE=100
# Mục đích: Rate limiting (bảo vệ từ ddos)
# Ý nghĩa: Mỗi IP chỉ được 100 requests/phút

ANOMALY_THRESHOLD=1.5
# Mục đích: Ngưỡng phát hiện anomaly
# Cách tính: Nếu power > (average * 1.5) thì là anomaly
# Ví dụ: avg=4.8, ngưỡng=1.5 → phát hiện nếu > 7.2

PREDICTION_CONFIDENCE=0.85
# Mục đích: Độ tin cậy predic (0-1)
# Ý nghĩa: 0.85 = 85% tin cậy prediction

WS_ENABLED=true
# Mục đích: Bật/tắt WebSocket
# Cách dùng: if (process.env.WS_ENABLED === 'true') { enableWS() }

WS_UPDATE_INTERVAL=2000
# Mục đích: Cứ bao lâu gửi update qua WebSocket
# Giá trị: 2000ms = 2 giây
# Ý nghĩa: Browser nhận update mỗi 2 giây
```

### Cách dùng trong code

```javascript
// Method 1: Direct access
const port = process.env.PORT || 3000

// Method 2: Dùng sau khi dotenv.config()
import dotenv from 'dotenv'
dotenv.config()  // ← Load .env vào process.env
const threshold = process.env.ANOMALY_THRESHOLD

// Method 3: Kiểm tra environment
if (process.env.NODE_ENV === 'production') {
  console.log('Running in production mode')
} else {
  console.log('Running in development mode')
}
```

---

## 3️⃣ `backend/server.js` (QUAN TRỌNG!)

Đây là file chính chứa toàn bộ logic. Chia thành 5 phần:

### Phần 1: Import & Setup

```javascript
import express from 'express'
// ↳ Import Express framework
// ↳ "from" = ES6 modules (do "type": "module" trong package.json)

import cors from 'cors'
// ↳ Import CORS middleware
// ↳ Giải quyết problem: browser block cross-origin requests

import { WebSocketServer } from 'ws'
// ↳ Import WebSocket từ library 'ws'
// ↳ Dùng cho real-time communication

import { createServer } from 'http'
// ↳ Import HTTP server (built-in Node.js)
// ↳ Express cần HTTP server để hoạt động
// ↳ WebSocket cũng cần HTTP server

import fs from 'fs/promises'
// ↳ File system promises API (async version)
// ↳ Dùng để read file JSON

import path from 'path'
// ↳ Path manipulation utility
// ↳ Dùng __dirname, path.join(), etc.

import { fileURLToPath } from 'url'
// ↳ Convert import.meta.url thành file path
// ↳ Dùng để lấy __dirname trong ES6 modules

// Create Express app
const app = express()
// ↳ Khởi tạo Express application

const server = createServer(app)
// ↳ Tạo HTTP server từ Express app
// ↳ Cần cho WebSocket hoạt động

const wss = new WebSocketServer({ server })
// ↳ Khởi tạo WebSocket server
// ↳ Gắn vào HTTP server ở trên
// ↳ Bây giờ có thể nhận WebSocket connections

// Middleware
app.use(cors())
// ↳ Enable CORS cho tất cả routes
// ↳ Mà không bị browser block
// ↳ Frontend (port 3000) có thể gọi backend (port 3000)

app.use(express.json())
// ↳ Parse incoming JSON requests
// ↳ Tự động convert JSON string → JavaScript object
// ↳ Giờ req.body là object thay vì string

const PORT = process.env.PORT || 3000
// ↳ Lấy PORT từ .env, nếu không có thì dùng 3000

// Get __dirname (since we use ES6 modules)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
// ↳ Lấy thư mục hiện tại
// ↳ Cần cho path.join() xây dựng file paths
```

### Giải thích Middleware

**Middleware** = Function chạy giữa request nhận & response gửi

```javascript
// Flow:
Request nhận
    ↓
cors() middleware → Thêm CORS headers
    ↓
express.json() middleware → Parse JSON body
    ↓
Routes (APIs) xử lý
    ↓
Response gửi
```

---

### Phần 2: Data Models

```javascript
let systemState = {
  // Object quản lý trạng thái toàn bộ hệ thống
  // "let" chứ không "const" = có thể thay đổi después

  devices: {
    // Danh sách devices
    '1': { 
      id: 1,                 // Unique ID
      name: 'Sảnh chính',   // Tên thiết bị (Vietnamese)
      location: 'Tầng trệt', // Vị trí
      code: 'CB-GF-01',     // Mã thiết bị
      power: 1.2,           // Power hiện tại (kW)
      status: true          // Bật/tắt
    },
    '2': { ... },
    '3': { ... }
  },

  realtime: {
    // Data real-time hiện tại
    current_pwr: 1.8,         // Total power (kW)
    temp: 24.5,               // Temperature (°C)
    timestamp: new Date(),    // Thời gian update
    history: [1.2, 1.9, ...]  // Lịch sử 8 readings gần nhất
  },

  settings: {
    // Cài đặt hệ thống
    threshold: 5.0,      // Ngưỡng alert (kW)
    price_per_kwh: 2500, // Giá điện (₫/kWh)
    schedule_off: '22:00'// Lịch tắt (HH:MM)
  }
}
```

**Tại sao dùng object:**
- Dễ access: `systemState.devices['1'].power`
- Dễ update: `systemState.devices['1'].power = 2.5`
- Dễ serialize: có thể convert sang JSON

---

### Phần 3: Helper Functions (Utility)

```javascript
// Hàm 1: Load dữ liệu từ JSON file
async function loadEnergyData() {
  // "async" = function này có thể chứa "await"
  
  try {
    // Xây dựng path của data file
    const dataPath = path.join(__dirname, '../data/energy_data.json')
    // ↳ __dirname = thư mục chứa server.js
    // ↳ '../data/energy_data.json' = đi lên 1 tầng rồi vào data folder
    
    // Đọc file
    const data = await fs.readFile(dataPath, 'utf-8')
    // ↳ "await" = chờ file đọc xong
    // ↳ 'utf-8' = encoding (hỗ trợ Vietnamese)
    // ↳ data = string (nội dung file)
    
    // Parse JSON string thành object
    return JSON.parse(data).data || []
    // ↳ JSON.parse() = convert string → object
    // ↳ .data = lấy property "data" (vì JSON có structure đó)
    // ↳ || [] = nếu .data không tồn tại, return []
    
  } catch (error) {
    // Nếu xảy ra lỗi (file không tồn tại, etc.)
    console.error('Error loading energy data:', error.message)
    return []  // Return empty array as fallback
  }
}
```

**Tại sao async/await:**
- File I/O là non-blocking operation
- Không cần chờ (còn handle requests khác)
- `await` = "chờ tới khi file đọc xong"

---

```javascript
// Hàm 2: Tính toán daily consumption
function calculateDailyConsumption(data, deviceName) {
  // "data" = array records
  // "deviceName" = tên device cần lọc

  return data
    // Lấy tất cả records
    
    .filter(d => d.device_name === deviceName)
    // ↳ Chỉ lấy records của device này
    // ↳ "filter" = trả về array mới có items đúng điều kiện
    
    .reduce((sum, d) => sum + d.power_consumption, 0)
    // ↳ Cộng tất cả power_consumption
    // ↳ "reduce" = biến array thành 1 giá trị
    // ↳ sum = accumulated value (bắt đầu = 0)
    // ↳ d = current item
    // ↳ sum + d.power_consumption = cộng dồn
}

// Ví dụ:
// data = [
//   { device_name: 'Server', power_consumption: 4.8 },
//   { device_name: 'Server', power_consumption: 5.1 },
//   { device_name: 'Office', power_consumption: 2.5 }
// ]
// calculateDailyConsumption(data, 'Server')
// → filter: [4.8, 5.1]
// → reduce: 4.8 + 5.1 = 9.9
```

---

```javascript
// Hàm 3: Phát hiện anomaly
function detectAnomalies(data, threshold = 1.5) {
  // "threshold" = ngưỡng multiplier (default 1.5)

  // Bước 1: Tính average
  const avg = data.reduce((sum, d) => sum + d.power_consumption, 0) / data.length
  // ↳ Tổng / số items = average

  // Bước 2: Lọc anomalies
  return data
    .filter(d => d.power_consumption > avg * threshold)
    // ↳ Chỉ lấy records > avg * 1.5
    // ↳ Tức: 50% cao hơn bình thường
    
    .map(d => ({  // Map = transform mỗi item
      timestamp: d.timestamp,
      device: d.device_name,
      consumption: d.power_consumption,
      average: avg,
      severity: d.power_consumption > avg * 2 ? 'high' : 'medium'
      // ↳ Ternary operator: điều kiện ? giá trị đúng : giá trị sai
      // ↳ Nếu > avg * 2 = "high", nếu không = "medium"
    }))
}
```

---

```javascript
// Hàm 4: Linear Regression Prediction
function predictNextValue(powerHistory) {
  // Linear regression = y = mx + b
  // m = slope (độ dốc)
  // b = intercept (điểm giao)

  const n = powerHistory.length
  if (n < 2) return powerHistory[n - 1] || 0
  // ↳ Nếu dữ liệu < 2 points, không thể predict

  // Tạo array x (0, 1, 2, ...)
  const x = Array.from({ length: n }, (_, i) => i)
  
  // y = powerHistory (đã có)
  const y = powerHistory

  // Tính các tổng cần thiết
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  
  // sumXY = x[0]*y[0] + x[1]*y[1] + ...
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  
  // sumXX = x[0]² + x[1]² + ...
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)

  // Công thức linear regression
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Predict point tiếp theo (at index n)
  return slope * n + intercept
}

// Ví dụ:
// powerHistory = [1.2, 1.9, 2.5, 1.8, 2.2, 1.6, 1.9, 2.1]
// n = 8
// Dự đoán x=8: slope*8 + intercept
```

---

### Phần 4: API Routes

```javascript
// Route: GET /api/energy/realtime
app.get('/api/energy/realtime', (req, res) => {
  // "app.get" = HTTP GET request
  // "/api/energy/realtime" = endpoint path
  // "(req, res) => {...}" = callback function
  
  // Tính total power từ tất cả devices (đang bật)
  const totalPower = Object.values(systemState.devices)
    // ↳ Object.values() = lấy value từ object
    // ↳ { '1': {...}, '2': {...} } → [{...}, {...}]
    
    .filter(d => d.status)  // Chỉ lấy devices đang bật
    .reduce((sum, d) => sum + d.power, 0)  // Cộng tất cả power

  // Gửi response
  res.json({
    // ↳ res.json() = set header Content-Type: application/json
    // ↳                + stringify object + send
    
    status: 'success',
    data: {
      current_power: totalPower.toFixed(2),
      // ↳ toFixed(2) = làm tròn 2 chữ số thập phân
      // ↳ 1.8234 → "1.82"
      
      temperature: systemState.realtime.temp,
      devices: Object.values(systemState.devices),
      timestamp: new Date(),
      history: systemState.realtime.history
    }
  })
})
```

**Flow:**
```
Client gửi: GET http://192.168.1.19:3000/api/energy/realtime
    ↓
Express match route (GET + path đúng)
    ↓
Callback chạy:
  - Tính totalPower
  - Prepare response object
    ↓
res.json() → stringify + send JSON
    ↓
Client nhận response
```

---

```javascript
// Route: GET /api/energy/history
app.get('/api/energy/history', async (req, res) => {
  // "async" = function có thể chứa await
  
  try {
    // Lấy data từ JSON file
    const data = await loadEnergyData()
    
    // Lấy query parameters từ URL
    const { days = 30, device } = req.query
    // ↳ req.query = ?days=30&device=Sảnh%20chính
    // ↳ days = 30 (default)
    // ↳ device = 'Sảnh chính' (nếu có)

    // Lọc dữ liệu nếu có device parameter
    let filtered = data
    if (device) {
      filtered = filtered.filter(d => d.device_name === device)
    }

    // Tính daily consumption
    const dailyConsumption = {}
    filtered.forEach(d => {
      const date = new Date(d.timestamp).toISOString().split('T')[0]
      // ↳ "2026-04-04T10:30:00Z".split('T')[0] = "2026-04-04"
      
      dailyConsumption[date] = (dailyConsumption[date] || 0) + d.power_consumption
      // ↳ Accumulate: cộng từng ngày
    })

    // Gửi response
    res.json({
      status: 'success',
      data: {
        daily_consumption: dailyConsumption,
        total_consumption: Object.values(dailyConsumption).reduce((a, b) => a + b, 0),
        device: device || 'all'
      }
    })

  } catch (error) {
    // Error handling
    res.status(500).json({
      error: 'Failed to fetch history',
      details: error.message
    })
  }
})
```

**Cú pháp URL:**
```
GET /api/energy/history
GET /api/energy/history?days=7
GET /api/energy/history?days=7&device=Server
GET /api/energy/history?device=Sảnh%20chính
```

---

### Phần 5: WebSocket Real-time

```javascript
wss.on('connection', (ws) => {
  // "connection" event = client kết nối WebSocket
  // "ws" = WebSocket connection object
  
  console.log('✅ WebSocket client connected')

  // Gửi welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to real-time updates'
  }))
  // ↳ ws.send() = gửi message qua WebSocket
  // ↳ JSON.stringify() = convert object → string

  // Setup interval gửi updates mỗi 2 giây
  const interval = setInterval(() => {
    // Math.random() = số từ 0 đến 1
    const randomPower = (Math.random() * 8 + 1.2).toFixed(2)
    // ↳ Math.random() * 8 = 0 đến 8
    // ↳ + 1.2 = 1.2 đến 9.2
    // ↳ toFixed(2) = làm tròn 2 chữ số

    const randomTemp = (23 + Math.random() * 3).toFixed(1)
    // ↳ 23 đến 26°C

    // Gửi update
    ws.send(JSON.stringify({
      type: 'realtime',
      data: {
        current_power: randomPower,
        temperature: randomTemp,
        timestamp: new Date()
      }
    }))
  }, 2000)  // Mỗi 2000ms (2 giây)

  // Khi client disconnects
  ws.on('close', () => {
    clearInterval(interval)  // Dừng gửi updates
    console.log('❌ WebSocket client disconnected')
  })

  // Nếu xảy ra lỗi
  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
  })
})
```

**Flow WebSocket:**
```
Client: ws.connect('ws://192.168.1.19:3000')
    ↓
Server: wss.on('connection') → Client connected
    ↓
Server gửi welcome message → Client nhận
    ↓
Mỗi 2 giây: Server gửi realtime data
    ↓
Client nhận → Update UI
    ↓
Client close → Server stop gửi
```

---

### Phần 6: Server Start

```javascript
server.listen(PORT, () => {
  // "server.listen(PORT, callback)"
  // = Chạy server trên cổng PORT
  // = Khi startup xong, chạy callback

  console.log(`🚀 Smart Energy Backend running on http://localhost:${PORT}`)
  // ↳ Template string: `...${variable}...`
  // ↳ Dễ đọc hơn: 'url: ' + PORT + '...'

  console.log(`📊 APIs:`)
  console.log(`   GET /api/energy/realtime`)
  console.log(`   GET /api/energy/history`)
  console.log(`   GET /api/energy/anomaly`)
  console.log(`   GET /api/energy/prediction`)
  console.log(`   GET /api/energy/analytics`)
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`)
})
```

---

## 4️⃣ `static/api-client.js`

### Tác dụng
- Frontend library để call APIs
- Handle errors & retries
- Manage WebSocket
- Format data cho charts

### Chi tiết

```javascript
// ===== CONFIGURATION =====
const API_BASE = 'http://192.168.1.19:3000/api'
// ↳ Base URL của backend APIs
// ↳ Prefix cho tất cả API calls

const WS_URL = 'ws://192.168.1.19:3000'
// ↳ WebSocket URL

// Class API Client
class EnergyAPIClient {
  constructor() {
    this.wsConnection = null
    // ↳ Store WebSocket connection
    
    this.requestTimeout = 30000
    // ↳ Timeout 30 giây cho API requests
    
    console.log('🔌 Energy API Client initialized')
  }

  // ===== CORE METHOD: Send API Request =====
  async _request(endpoint, options = {}) {
    // "_request" = private method (dùng nội bộ)
    // "endpoint" = '/energy/realtime'
    // "options" = thêm config (headers, etc.)
    
    const url = `${API_BASE}${endpoint}`
    // ↳ Tạo full URL: 'http://192.168.1.19:3000/api/energy/realtime'
    
    try {
      // Gửi fetch request
      const response = await fetch(url, {
        ...options,
        // ↳ Spread operator: gộp options vào
        
        headers: {
          'Content-Type': 'application/json',
          // ↳ Báo server: tôi gửi JSON
          
          ...options.headers  // Gộp thêm headers từ options
        },
        timeout: this.requestTimeout
      })

      // Kiểm tra response status
      if (!response.ok) {
        // ↳ response.ok = status 200-299
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Parse JSON response
      return await response.json()
      
    } catch (error) {
      console.error(`❌ API Error [${endpoint}]:`, error)
      this._showErrorAlert(error.message)
      throw error
    }
  }

  // ===== ERROR DISPLAY =====
  _showErrorAlert(message) {
    // Tạo alert element (không thay đổi HTML structure)
    const alert = document.createElement('div')
    alert.className = 'api-error-alert'
    
    // Thêm styling + tạo alert
    alert.innerHTML = `
      <style>
        .api-error-alert {
          position: fixed;
          top: 100px;
          right: 20px;
          background: rgba(239, 68, 68, 0.9);
          /* ↳ Red color với transparency */
          
          color: white;
          padding: 12px 16px;
          border-radius: 4px;
          font-size: 14px;
          z-index: 10000;
          /* ↳ z-index cao = hiển thị trên tất cả */
          
          animation: slideIn 0.3s ease;
        }
      </style>
      ⚠️ ${message}
    `
    
    // Thêm vào DOM
    document.body.appendChild(alert)
    
    // Tự động xoá sau 4 giây
    setTimeout(() => {
      alert.classList.add('closing')
      setTimeout(() => alert.remove(), 300)
    }, 4000)
  }

  // ===== PUBLIC APIs =====
  async getRealtimeData() {
    try {
      const result = await this._request('/energy/realtime')
      console.log('📊 Realtime data:', result.data)
      return result.data
    } catch (error) {
      return null  // Return null on error
    }
  }

  async getAnalyticsData() {
    try {
      const result = await this._request('/energy/analytics')
      console.log('📊 Analytics data:', result.data)
      return result.data
    } catch (error) {
      return null
    }
  }

  // ... (các method khác tương tự)

  // ===== WEBSOCKET =====
  connectWebSocket(onMessageCallback) {
    try {
      this.wsConnection = new WebSocket(WS_URL)
      // ↳ Tạo WebSocket connection

      this.wsConnection.onopen = () => {
        console.log('🔴 WebSocket connected')
        // ↳ Event: WebSocket mở thành công
      }

      this.wsConnection.onmessage = (event) => {
        // ↳ Event: Nhận message từ server
        
        const message = JSON.parse(event.data)
        // ↳ event.data = JSON string
        // ↳ JSON.parse() = convert → object
        
        console.log('💫 WebSocket message:', message)
        
        if (onMessageCallback) {
          onMessageCallback(message)
          // ↳ Gọi callback function (nếu có)
        }
      }

      this.wsConnection.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        this._showErrorAlert('Real-time connection error')
      }

      this.wsConnection.onclose = () => {
        console.log('⚫ WebSocket disconnected')
        
        // Auto-reconnect sau 3 giây
        setTimeout(() => this.connectWebSocket(onMessageCallback), 3000)
      }

    } catch (error) {
      console.error('❌ WebSocket connection failed:', error)
    }
  }
}

// ===== SINGLETON INSTANCE =====
const energyAPI = new EnergyAPIClient()
// ↳ Tạo 1 instance duy nhất
// ↳ Mục đích: reuse connection, manage state

// ===== AUTO START =====
window.addEventListener('DOMContentLoaded', () => {
  // ↳ Khi DOM load xong (HTML ready)
  
  console.log('🎯 Smart Energy Dashboard loaded - APIs ready')
  
  // Auto connect WebSocket
  setTimeout(() => {
    energyAPI.connectWebSocket((message) => {
      if (message.type === 'realtime' && message.data) {
        console.log('⚡ Real-time update:', message.data)
      }
    })
  }, 500)
})

// ===== EXPORT GLOBAL =====
window.energyAPI = energyAPI
// ↳ Để frontend code có thể dùng: energyAPI.getRealtimeData()
```

---

## 5️⃣ `templates/index.html` - Phần Modified

### Tác dụng
- Thêm API client vào UI
- Kết nối frontend với backend

### Code added (cuối file, trước `</body>`):

```html
<!-- ✅ ADD THIS: Import Node.js Express Backend API Client -->
<script src="{{ url_for('static', filename='api-client.js') }}"></script>
<!-- ↳ Load api-client.js từ static folder
     ↳ {{ url_for(...) }} = Flask template syntax
     ↳ Tạo correct URL path -->

<script>
  // ✅ ADD THIS: Example usage
  console.log('🚀 Smart Energy Dashboard with Node.js Backend Integration')
  // ↳ Debug message (xem trong F12 console)
  
  // Fetch real-time data on page load
  energyAPI.getRealtimeData().then(data => {
    // ↳ .then() = async promise handler
    // ↳ Khi getRealtimeData() return, chạy callback này
    
    if (data) {
      console.log('📊 Current Power:', data.current_power, 'kW')
      console.log('🌡️ Temperature:', data.temperature, '°C')
    }
  })

  // Get latest analytics data
  energyAPI.getAnalyticsData().then(data => {
    if (data) {
      console.log('📈 Daily Consumption:', data.daily_all, 'kWh')
      console.log('🔝 Top Devices:', data.top_devices)
    }
  })
</script>
```

**Flow khi page load:**
```
HTML load
    ↓
DOMContentLoaded event chạy
    ↓
api-client.js chạy:
  - Tạo energyAPIClient instance
  - window.energyAPI = instance
  - Auto connect WebSocket
    ↓
Script block chạy:
  - Fetch real-time data
  - Fetch analytics data
  - Log kết quả
```

---

## 🎓 CÁC KHÁI NIỆM QUAN TRỌNG

### 1. **async/await**
```javascript
// Thay vì callback:
fetch(url).then(res => res.json()).then(data => console.log(data))

// Dùng async/await (sạch hơn):
async function getData() {
  const res = await fetch(url)
  const data = await res.json()
  console.log(data)
}
```

### 2. **Promise**
```javascript
// Promise = "hứa hẹn" sẽ return value sau
const promise = fetch(url)
// promise.then() = khi xong, thực hiện này
// promise.catch() = nếu error, thực hiện này
```

### 3. **REST API**
```
GET /api/energy/realtime
├─ GET = lấy data (không thay đổi)
├─ /api = endpoint group
├─ /energy = resource
└─ /realtime = action

POST /api/energy/settings
├─ POST = gửi data (thay đổi server state)
└─ response = thường return created data
```

### 4. **WebSocket vs REST**
```
REST (HTTP)
├─ Client initiate request → Server respond
├─ Stateless (mỗi request độc lập)
└─ Dùng khi: Client cần data theo demand

WebSocket
├─ Client & Server handshake → persistent connection
├─ Server có thể push data mà không có request
└─ Dùng khi: Real-time updates cần
```

### 5. **Middleware**
```javascript
app.use(cors())
// ↳ Middleware: Function chạy cho TẤT CẢ requests
// ↳ Trước route handler

app.use(express.json())
// ↳ Parse JSON body cho tất cả requests

app.get('/api/realtime', (req, res) => {
  // ↳ Route handler: chỉ chạy khi GET /api/realtime
})
```

### 6. **Error Handling Pattern**
```javascript
try {
  // Code có thể throw error
  const data = await loadData()
} catch (error) {
  // Handle error
  console.error('Error:', error.message)
  return null
}
```

### 7. **Arrow Functions**
```javascript
// Traditional function
function add(a, b) {
  return a + b
}

// Arrow function (ES6)
const add = (a, b) => a + b
// ↳ (params) => body
// ↳ Nếu single line & return = không cần {}
```

### 8. **Template Literals**
```javascript
// Traditional
const msg = 'Hello ' + name + ', age ' + age

// Template literal (ES6)
const msg = `Hello ${name}, age ${age}`
// ↳ Dùng backticks: `...`
// ↳ Biến trong ${...}
```

---

## 🔧 LỰC CHẠY HỆ THỐNG

### Khi User Mở Dashboard

```
1. Browser mở: http://192.168.1.19:3000
   ↓
2. Flask serve index.html
   ↓
3. HTML load → parse CSS → run JavaScript
   ↓
4. Script load: api-client.js
   ↓
5. DOMContentLoaded event
   ↓
6. API Client auto connect WebSocket
   ↓
7. Fetch realtime & analytics data
   ↓
8. Log data → User mở F12 console xem results
```

### Khi User Gọi API

```
Frontend: await energyAPI.getRealtimeData()
    ↓
api-client.js:
  1. Tạo URL: http://192.168.1.19:3000/api/energy/realtime
  2. Gửi fetch request
    ↓
Backend (server.js):
  1. Express match route: GET /api/energy/realtime
  2. Callback chạy
  3. Tính total power từ systemState
  4. res.json({...}) gửi response
    ↓
Frontend nhận response:
  1. response.ok? Yes → JSON.parse()
  2. Return data
  3. .then() callback run
    ↓
User code xử lý data
```

---

## 📋 CHECKLIST: LỰC XÂY DỰNG WEB MỚI

Nếu muốn tạo web tương tự:

- [ ] Cách setup Node.js + Express
- [ ] Cách tạo package.json & cài dependencies
- [ ] Cách viết routes (GET, POST, etc.)
- [ ] Cách load & process data (JSON/Database)
- [ ] Cách return JSON responses
- [ ] Cách handle errors (try-catch)
- [ ] Cách setup CORS
- [ ] Cách setup WebSocket
- [ ] Cách create frontend API client
- [ ] Cách integrate frontend với backend
- [ ] Cách format data cho charts
- [ ] Cách handle real-time updates

---

## 🎯 SUMMARY: CÁC FILE LÀM NÃO

```
backend/
├── package.json          → npm dependencies + scripts
├── .env                  → Có configuration
├── server.js             → Express app + routes + WebSocket

static/
├── api-client.js         → Frontend client call APIs

templates/
├── index.html            → Added 2 scripts

Documentation/
├── BACKEND_SETUP.md      → Setup steps
├── INTEGRATION_EXAMPLES.md → Code examples
├── ARCHITECTURE.md       → System design
└── UPGRADE_SUMMARY.md    → Changes log
```

Mỗi file có **1 trách nhiệm chính**:
- **package.json** = Dependencies
- **.env** = Configuration
- **server.js** = Backend logic
- **api-client.js** = Frontend connection
- **index.html** = Load client + example

---

**Bây giờ bạn hiểu mỗi file, mỗi cú pháp làm gì!** 🎓

Khi build web mới, follow pattern này:
1. Setup package.json + install dependencies
2. Tạo .env cho configuration
3. Write server.js với routes
4. Create api-client.js cho frontend
5. Integrate vào HTML
6. Test từng API

**Good luck! 🚀**
