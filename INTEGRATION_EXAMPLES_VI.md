# 📊 Ví Dụ Tích Hợp API cho Smart Energy Dashboard

Hướng dẫn này cho thấy cách kết nối các API Node.js Backend với các phần tử frontend của bạn.

## Bắt Đầu Nhanh

### 1. API Client Đã Được Tải
```javascript
// Có sẵn trên toàn cầu như: window.energyAPI
energyAPI.getRealtimeData()
energyAPI.getHistoryData()
energyAPI.getAnomalyData()
energyAPI.getPredictionData()
energyAPI.getAnalyticsData()
```

### 2. Xử Lý Lỗi (Tích Hợp Sẵn)
- Tất cả lỗi được hiển thị dưới dạng cảnh báo không xâm phạm
- Console hiển thị nhật ký lỗi chi tiết
- WebSocket kết nối lại tự động khi ngắt kết nối

---

## Ví Dụ 1: Hiển Thị Công Suất Thực Thời trong Dashboard

**Nơi thêm vào**: Trong phần tử HTML dashboard của bạn

```html
<!-- Cập nhật phần tử (ví dụ) -->
<div id="current-power-display">
  <h2>Công Suất Hiện Tại: <span id="power-value">--</span> kW</h2>
  <p>Nhiệt Độ: <span id="temp-value">--</span> °C</p>
</div>

<script>
  // Tìm nạp và cập nhật mỗi 5 giây
  setInterval(async () => {
    const data = await energyAPI.getRealtimeData();
    if (data) {
      document.getElementById('power-value').textContent = data.current_power;
      document.getElementById('temp-value').textContent = data.temperature;
    }
  }, 3000);
</script>
```

---

## Ví Dụ 2: Hiển Thị Biểu Đồ Phân Tích Thiết Bị

```html
<!-- Thêm vùng chứa biểu đồ -->
<canvas id="device-breakdown-chart" width="400" height="100"></canvas>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
  // Khởi tạo biểu đồ
  const ctx = document.getElementById('device-breakdown-chart').getContext('2d');
  let chart;

  async function updateDeviceChart() {
    const data = await energyAPI.getAnalyticsData();
    if (!data) return;

    const chartData = energyAPI.formatDeviceBreakdown(data.device_breakdown);

    if (chart) {
      chart.destroy();
    }

    chart = new Chart(ctx, {
      type: 'doughnut',
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: 'Phân Tích Tiêu Thụ Thiết Bị' }
        }
      }
    });
  }

  // Cập nhật khi tải và mỗi 10 giây
  updateDeviceChart();
  setInterval(updateDeviceChart, 10000);
</script>
```

---

## Ví Dụ 3: Hiển Thị Top 5 Thiết Bị Tiêu Thụ Nhiều Nhất

```html
<div id="top-devices-list">
  <h3>Các Thiết Bị Tiêu Thụ Năng Lượng Hàng Đầu</h3>
  <ul id="top-devices"></ul>
</div>

<script>
  async function updateTopDevices() {
    const data = await energyAPI.getPredictionData();
    if (!data || !data.top_devices) return;

    const html = data.top_devices.map(device => `
      <li>
        <strong>${device.device}</strong>: ${device.consumption.toFixed(1)} kWh
        <div style="width: 100%; background: #e0e0e0; height: 4px;"></div>
        <div style="width: ${(device.consumption / 200) * 100}%; background: #3b82f6; height: 4px;"></div>
      </li>
    `).join('');

    document.getElementById('top-devices').innerHTML = html;
  }

  // Cập nhật khi tải trang
  updateTopDevices();
  
  // Tự động cập nhật mỗi 15 giây
  setInterval(updateTopDevices, 15000);
</script>
```

---

## Ví Dụ 4: Hiển Thị Cảnh Báo Bất Thường

```html
<div id="anomaly-alerts">
  <h3>⚠️ Phát Hiện Bất Thường</h3>
  <div id="anomaly-list"></div>
</div>

<script>
  async function updateAnomalies() {
    const data = await energyAPI.getAnomalyData(1.5);
    if (!data || data.anomaly_count === 0) {
      document.getElementById('anomaly-list').innerHTML = '✅ Không phát hiện bất thường';
      return;
    }

    const html = `
      <p style="color: #ef4444;">Tìm thấy ${data.anomaly_count} bất thường (${data.anomaly_percentage}%)</p>
      <ul>
        ${data.anomalies.slice(0, 5).map(a => `
          <li style="background: rgba(239, 68, 68, 0.1); padding: 8px; margin: 4px 0; border-radius: 4px;">
            <strong>${a.severity.toUpperCase()}</strong> - ${a.device}
            <br/>Tiêu thụ: ${a.consumption.toFixed(2)} kWh (bình quân: ${a.average.toFixed(2)})
            <br/>Thời gian: ${a.timestamp}
          </li>
        `).join('')}
      </ul>
    `;
    document.getElementById('anomaly-list').innerHTML = html;
  }

  updateAnomalies();
  setInterval(updateAnomalies, 30000); // Kiểm tra mỗi 30 giây
</script>
```

---

## Ví Dụ 5: Cập Nhật WebSocket Thực Thời

```html
<div id="realtime-status">
  <p>Trạng Thái WebSocket: <span id="ws-status">Đang kết nối...</span></p>
  <p>Cập Nhật Lần Cuối: <span id="last-update">--</span></p>
</div>

<script>
  // Callback WebSocket tùy chỉnh
  energyAPI.connectWebSocket((message) => {
    if (message.type === 'connected') {
      document.getElementById('ws-status').textContent = '🟢 Đã Kết Nối';
    }
    
    if (message.type === 'realtime' && message.data) {
      document.getElementById('ws-status').textContent = '🟢 Trực Tiếp';
      document.getElementById('last-update').textContent = new Date().toLocaleTimeString();
      
      // Cập nhật giao diện người dùng của bạn dengan dữ liệu thực thời
      console.log('Cập nhật trực tiếp:', message.data);
    }
  });
</script>
```

---

## Ví Dụ 6: Biểu Đồ Tiêu Thụ Hàng Ngày

```html
<canvas id="daily-consumption-chart"></canvas>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
  async function updateConsumptionChart() {
    const data = await energyAPI.getHistoryData(7); // 7 ngày gần đây
    if (!data) return;

    const chartData = energyAPI.formatChartData(data.daily_consumption);
    
    const ctx = document.getElementById('daily-consumption-chart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Tiêu Thụ Hàng Ngày (7 Ngày Gần Đây)' }
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'kWh' } }
        }
      }
    });
  }

  updateConsumptionChart();
</script>
```

---

## Ví Dụ 7: Giờ Cao Điểm & Dự Đoán

```html
<div id="peak-and-prediction">
  <h3>⚡ Giờ Cao Điểm</h3>
  <ul id="peak-list"></ul>

  <h3>🔮 Dự Đoán Tiếp Theo</h3>
  <p id="prediction"></p>
</div>

<script>
  async function updatePredictions() {
    const data = await energyAPI.getPredictionData();
    if (!data) return;

    // Giờ cao điểm
    const peakHtml = data.peak_hours.map(p => `
      <li>Giờ ${p.hour}:00 - ${p.consumption.toFixed(1)} kWh</li>
    `).join('');
    document.getElementById('peak-list').innerHTML = peakHtml;

    // Dự đoán
    const pred = parseFloat(data.predicted_next_consumption);
    document.getElementById('prediction').innerHTML = `
      Dự đoán tiêu thụ giờ tiếp theo: <strong>${pred.toFixed(2)} kWh</strong>
      (Độ tin cậy: ${(data.forecast_confidence * 100).toFixed(0)}%)
    `;
  }

  updatePredictions();
  setInterval(updatePredictions, 60000); // Mỗi phút
</script>
```

---

## Ví Dụ 8: Xử Lý Lỗi với Thông Báo Tùy Chỉnh

```javascript
// Xử lý các lỗi cụ thể một cách linh hoạt
async function safeAPICall(apiMethod, fallback = null) {
  try {
    const result = await apiMethod();
    if (!result) {
      console.warn('API trả về null, sử dụng dự phòng');
      return fallback;
    }
    return result;
  } catch (error) {
    console.error('Lỗi API:', error);
    // Hiển thị thông báo tùy chỉnh cho người dùng
    alert(`⚠️ Không thể tìm nạp dữ liệu: ${error.message}`);
    return fallback;
  }
}

// Sử dụng
const data = await safeAPICall(
  () => energyAPI.getRealtimeData(),
  { current_power: 0, temperature: 0 }
);
```

---

## Tham Chiếu API

### `energyAPI.getRealtimeData()`
Trả về công suất hiện tại, nhiệt độ, trạng thái thiết bị
```javascript
{
  current_power: "8.5",
  temperature: 24.5,
  devices: [...],
  timestamp: "2026-04-04T10:30:00Z",
  history: [1.2, 1.9, 2.5, ...]
}
```

### `energyAPI.getHistoryData(days, device)`
Trả về dữ liệu tiêu thụ hàng ngày
```javascript
{
  daily_consumption: { "2026-04-04": 8.5, "2026-04-03": 8.2 },
  total_consumption: 240.8,
  device: "Sảnh chính"
}
```

### `energyAPI.getAnomalyData(threshold)`
Trả về các bất thường được phát hiện
```javascript
{
  total_records: 120,
  anomaly_count: 5,
  anomaly_percentage: "4.17",
  anomalies: [...]
}
```

### `energyAPI.getPredictionData()`
Trả về dự đoán và phân tích
```javascript
{
  predicted_next_consumption: "8.2",
  peak_hours: [...],
  top_devices: [...],
  forecast_confidence: 0.85,
  timestamp: "2026-04-04T10:30:00Z"
}
```

### `energyAPI.getAnalyticsData()`
Trả về phân tích toàn diện
```javascript
{
  daily_all: 348.2,
  peak_hours: [...],
  top_devices: [...],
  device_breakdown: [...]
}
```

---

## Cập Nhật WebSocket Thực Thời

```javascript
// Kết nối tự động khi tải trang trong api-client.js
// Đăng ký cập nhật với trình xử lý tùy chỉnh

energyAPI.connectWebSocket((message) => {
  if (message.type === 'realtime') {
    console.log('Dữ liệu trực tiếp:', message.data);
    // Cập nhật dashboard của bạn ở đây
  }
});

// Ngắt kết nối khi hoàn tất
energyAPI.disconnectWebSocket();
```

---

## Mẹo & Thực Hành Tốt Nhất

1. **Giảm Thiểu Cập Nhật**: Không tìm nạp mỗi giây
   ```javascript
   // Tốt - mỗi 10 giây
   setInterval(fetchData, 10000);
   ```

2. **Bộ Nhớ Đệm Kết Quả**: Lưu trữ tạm thời nếu cùng một lệnh gọi lặp lại
   ```javascript
   let cachedData = null;
   let cacheTime = 0;
   
   async function getCachedData() {
    if (Date.now() - cacheTime < 5000 && cachedData) {
      return cachedData;
    }
    cachedData = await energyAPI.getAnalyticsData();
    cacheTime = Date.now();
    return cachedData;
   }
   ```

3. **Ranh Giới Lỗi**: Bao quanh bằng try-catch
   ```javascript
   try {
     const data = await energyAPI.getRealtimeData();
   } catch (error) {
     console.error('Không thể lấy dữ liệu:', error);
   }
   ```

4. **Kết Xuất Có Điều Kiện**: Chỉ hiển thị nếu dữ liệu tồn tại
   ```javascript
   if (data && data.length > 0) {
     // Hiển thị dữ liệu
   } else {
     // Hiển thị trạng thái tải/trống
   }
   ```

---

## Kiểm Tra trong Console Trình Duyệt

Mở dashboard của bạn và nhấn **F12** → Tab **Console**

```javascript
// Kiểm tra API trực tiếp
await energyAPI.getRealtimeData()
await energyAPI.getAnalyticsData()
await energyAPI.getPredictionData()
await energyAPI.getAnomalyData()
await energyAPI.getHistoryData(7)

// Kiểm tra WebSocket
energyAPI.wsConnection
energyAPI.wsConnection.readyState // 1 = OPEN

// Định dạng dữ liệu cho biểu đồ
energyAPI.formatChartData({...})
energyAPI.formatDeviceBreakdown([...])
```

---

## Gỡ Lỗi Tích Hợp

**Q: API trả về null?**
- Kiểm tra backend đang chạy: `curl http://192.168.1.19:3000/health`
- Kiểm tra console cho lỗi: F12 → Console
- Xác minh tệp dữ liệu tồn tại: `data/energy_data.json`

**Q: Dữ liệu không cập nhật?**
- Tăng khoảng thời gian: `setInterval(fetch, 20000)` thay vì 5000
- Kiểm tra WebSocket: `energyAPI.wsConnection` trong console
- Tìm kiếm lỗi mạng trong tab Network (F12)

**Q: Biểu đồ không hiển thị?**
- Bao gồm thư viện Chart.js trước mã của bạn
- Kiểm tra console cho lỗi chart.js
- Xác minh phần tử `canvas` tồn tại trước khi tạo biểu đồ

---

## Các Bước Tiếp Theo

1. ✅ Khởi động backend: `cd backend && npm run dev`
2. ✅ Mở dashboard: `http://192.168.1.19:3000`
3. ✅ Mở console F12 và kiểm tra API
4. ✅ Thêm một ví dụ từ trên vào HTML của bạn
5. ✅ Mở rộng với thêm các tích hợp

**Chúc bạn lập trình vui vẻ! 🚀**
