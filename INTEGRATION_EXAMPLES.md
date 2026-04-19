# 📊 API Integration Examples for Smart Energy Dashboard

This guide shows how to connect the Node.js Backend APIs to your frontend elements.

## Quick Start

### 1. The API Client is Already Loaded
```javascript
// Available globally as: window.energyAPI
energyAPI.getRealtimeData()
energyAPI.getHistoryData()
energyAPI.getAnomalyData()
energyAPI.getPredictionData()
energyAPI.getAnalyticsData()
```

### 2. Error Handling (Built-in)
- All errors are displayed as non-intrusive alerts
- Console shows detailed error logs
- WebSocket auto-reconnects on disconnect

---

## Example 1: Display Real-time Power in Dashboard

**Where to add this**: In your dashboard HTML element

```html
<!-- Updated element (example) -->
<div id="current-power-display">
  <h2>Current Power: <span id="power-value">--</span> kW</h2>
  <p>Temperature: <span id="temp-value">--</span> °C</p>
</div>

<script>
  // Fetch and update every 5 seconds
  setInterval(async () => {
    const data = await energyAPI.getRealtimeData();
    if (data) {
      document.getElementById('power-value').textContent = data.current_power;
      document.getElementById('temp-value').textContent = data.temperature;
    }
  }, 5000);
</script>
```

---

## Example 2: Show Device Breakdown Chart

```html
<!-- Add chart container -->
<canvas id="device-breakdown-chart" width="400" height="100"></canvas>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
  // Initialize chart
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
          title: { display: true, text: 'Device Consumption Breakdown' }
        }
      }
    });
  }

  // Update on load and every 10 seconds
  updateDeviceChart();
  setInterval(updateDeviceChart, 10000);
</script>
```

---

## Example 3: Display Top 5 Energy Hogs

```html
<div id="top-devices-list">
  <h3>Top Energy Consumers</h3>
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

  // Update on page load
  updateTopDevices();
  
  // Auto-update every 15 seconds
  setInterval(updateTopDevices, 15000);
</script>
```

---

## Example 4: Show Anomaly Alerts

```html
<div id="anomaly-alerts">
  <h3>⚠️ Anomalies Detected</h3>
  <div id="anomaly-list"></div>
</div>

<script>
  async function updateAnomalies() {
    const data = await energyAPI.getAnomalyData(1.5);
    if (!data || data.anomaly_count === 0) {
      document.getElementById('anomaly-list').innerHTML = '✅ No anomalies detected';
      return;
    }

    const html = `
      <p style="color: #ef4444;">Found ${data.anomaly_count} anomalies (${data.anomaly_percentage}%)</p>
      <ul>
        ${data.anomalies.slice(0, 5).map(a => `
          <li style="background: rgba(239, 68, 68, 0.1); padding: 8px; margin: 4px 0; border-radius: 4px;">
            <strong>${a.severity.toUpperCase()}</strong> - ${a.device}
            <br/>Consumption: ${a.consumption.toFixed(2)} kWh (avg: ${a.average.toFixed(2)})
            <br/>Time: ${a.timestamp}
          </li>
        `).join('')}
      </ul>
    `;
    document.getElementById('anomaly-list').innerHTML = html;
  }

  updateAnomalies();
  setInterval(updateAnomalies, 30000); // Check every 30 seconds
</script>
```

---

## Example 5: Real-time WebSocket Updates

```html
<div id="realtime-status">
  <p>WebSocket Status: <span id="ws-status">Connecting...</span></p>
  <p>Last Update: <span id="last-update">--</span></p>
</div>

<script>
  // Custom WebSocket callback
  energyAPI.connectWebSocket((message) => {
    if (message.type === 'connected') {
      document.getElementById('ws-status').textContent = '🟢 Connected';
    }
    
    if (message.type === 'realtime' && message.data) {
      document.getElementById('ws-status').textContent = '🟢 Live';
      document.getElementById('last-update').textContent = new Date().toLocaleTimeString();
      
      // Update your UI with real-time data
      console.log('Live update:', message.data);
    }
  });
</script>
```

---

## Example 6: Daily Consumption Chart

```html
<canvas id="daily-consumption-chart"></canvas>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
  async function updateConsumptionChart() {
    const data = await energyAPI.getHistoryData(7); // Last 7 days
    if (!data) return;

    const chartData = energyAPI.formatChartData(data.daily_consumption);
    
    const ctx = document.getElementById('daily-consumption-chart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Daily Consumption (Last 7 Days)' }
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

## Example 7: Peak Hours & Predictions

```html
<div id="peak-and-prediction">
  <h3>⚡ Peak Hours</h3>
  <ul id="peak-list"></ul>

  <h3>🔮 Next Prediction</h3>
  <p id="prediction"></p>
</div>

<script>
  async function updatePredictions() {
    const data = await energyAPI.getPredictionData();
    if (!data) return;

    // Peak hours
    const peakHtml = data.peak_hours.map(p => `
      <li>Hour ${p.hour}:00 - ${p.consumption.toFixed(1)} kWh</li>
    `).join('');
    document.getElementById('peak-list').innerHTML = peakHtml;

    // Prediction
    const pred = parseFloat(data.predicted_next_consumption);
    document.getElementById('prediction').innerHTML = `
      Next hour predicted consumption: <strong>${pred.toFixed(2)} kWh</strong>
      (Confidence: ${(data.forecast_confidence * 100).toFixed(0)}%)
    `;
  }

  updatePredictions();
  setInterval(updatePredictions, 60000); // Every minute
</script>
```

---

## Example 8: Error Handling with Custom Messages

```javascript
// Handle specific errors gracefully
async function safeAPICall(apiMethod, fallback = null) {
  try {
    const result = await apiMethod();
    if (!result) {
      console.warn('API returned null, using fallback');
      return fallback;
    }
    return result;
  } catch (error) {
    console.error('API Error:', error);
    // Show custom message to user
    alert(`⚠️ Failed to fetch data: ${error.message}`);
    return fallback;
  }
}

// Usage
const data = await safeAPICall(
  () => energyAPI.getRealtimeData(),
  { current_power: 0, temperature: 0 }
);
```

---

## API Reference

### `energyAPI.getRealtimeData()`
Returns current power, temperature, device status
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
Returns daily consumption data
```javascript
{
  daily_consumption: { "2026-04-04": 8.5, "2026-04-03": 8.2 },
  total_consumption: 240.8,
  device: "Sảnh chính"
}
```

### `energyAPI.getAnomalyData(threshold)`
Returns detected anomalies
```javascript
{
  total_records: 120,
  anomaly_count: 5,
  anomaly_percentage: "4.17",
  anomalies: [...]
}
```

### `energyAPI.getPredictionData()`
Returns predictions and analytics
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
Returns comprehensive analytics
```javascript
{
  daily_all: 348.2,
  peak_hours: [...],
  top_devices: [...],
  device_breakdown: [...]
}
```

---

## WebSocket Real-time Updates

```javascript
// Auto-connects on page load in api-client.js
// Subscribe to updates with custom handler

energyAPI.connectWebSocket((message) => {
  if (message.type === 'realtime') {
    console.log('Live data:', message.data);
    // Update your dashboard here
  }
});

// Disconnect when done
energyAPI.disconnectWebSocket();
```

---

## Tips & Best Practices

1. **Debounce Updates**: Don't fetch every second
   ```javascript
   // Good - every 10 seconds
   setInterval(fetchData, 10000);
   ```

2. **Cache Results**: Store temporarily if same call repeated
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

3. **Error Boundaries**: Wrap in try-catch
   ```javascript
   try {
     const data = await energyAPI.getRealtimeData();
   } catch (error) {
     console.error('Failed to get data:', error);
   }
   ```

4. **Conditional Rendering**: Only show if data exists
   ```javascript
   if (data && data.length > 0) {
     // Display data
   } else {
     // Show loading/empty state
   }
   ```

---

## Testing in Browser Console

Open your dashboard and press **F12** → **Console** tab

```javascript
// Test APIs directly
await energyAPI.getRealtimeData()
await energyAPI.getAnalyticsData()
await energyAPI.getPredictionData()
await energyAPI.getAnomalyData()
await energyAPI.getHistoryData(7)

// Check WebSocket
energyAPI.wsConnection
energyAPI.wsConnection.readyState // 1 = OPEN

// Format data for charts
energyAPI.formatChartData({...})
energyAPI.formatDeviceBreakdown([...])
```

---

## Troubleshooting Integration

**Q: API returns null?**
- Check backend is running: `curl http://192.168.1.19:3000/health`
- Check console for errors: F12 → Console
- Verify data file exists: `data/energy_data.json`

**Q: Data not updating?**
- Increase interval: `setInterval(fetch, 20000)` instead of 5000
- Check WebSocket: `energyAPI.wsConnection` in console
- Look for network errors in Network tab (F12)

**Q: Chart not displaying?**
- Include Chart.js library before your code
- Check console for chart.js errors
- Verify `canvas` element exists before creating chart

---

## Next Steps

1. ✅ Start backend: `cd backend && npm run dev`
2. ✅ Open dashboard: `http://192.168.1.19:3000`
3. ✅ Open F12 console and test APIs
4. ✅ Add one example from above to your HTML
5. ✅ Expand with more integrations

**Happy coding! 🚀**
