import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// ===== IMPORT NEW SERVICES =====
import iotService from './iot-service.js';
import controlService from './control-service.js';
import alertService from './alert-service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
// WebSocketServer is already imported from 'ws' at the top
const wss = new WebSocketServer({ server });

// ===== MIDDLEWARE =====
app.use(cors());  // Allow cross-origin requests
app.use(express.json());  // Parse JSON requests

const PORT = process.env.PORT || 3000;  // Server port

// ===== DATA MODELS =====
let systemState = {
  devices: {
    '1': { id: 1, name: 'Sảnh chính', location: 'Tầng trệt', code: 'CB-GF-01', power: 1.2, status: true },
    '2': { id: 2, name: 'Văn phòng A', location: 'Tầng 01', code: 'CB-L1-02', power: 2.5, status: true },
    '3': { id: 3, name: 'Server', location: 'Tầng 02', code: 'CB-L2-03', power: 4.8, status: true },
  },
  realtime: {
    current_pwr: 1.8,
    temp: 24.5,
    timestamp: new Date(),
    history: [1.2, 1.9, 2.5, 1.8, 2.2, 1.6, 1.9, 2.1]
  },
  settings: {
    threshold: 5.0,
    price_per_kwh: 2500,
    schedule_off: '22:00'
  }
};

// ===== UTILITY FUNCTIONS =====

// Load energy data from JSON file
async function loadEnergyData() {
  try {
    const dataPath = path.join(__dirname, '../data/energy_data.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(data).data || [];
  } catch (error) {
    console.error('Error loading energy data:', error.message);
    return [];
  }
}

// Calculate daily consumption
function calculateDailyConsumption(data, deviceName) {
  return data
    .filter(d => d.device_name === deviceName)
    .reduce((sum, d) => sum + d.power_consumption, 0);
}

// Detect anomalies (if consumption > 1.5x average)
function detectAnomalies(data, threshold = 1.5) {
  const avg = data.reduce((sum, d) => sum + d.power_consumption, 0) / data.length;
  return data.filter(d => d.power_consumption > avg * threshold)
    .map(d => ({
      timestamp: d.timestamp,
      device: d.device_name,
      consumption: d.power_consumption,
      average: avg,
      severity: d.power_consumption > avg * 2 ? 'high' : 'medium'
    }));
}

// Simple linear regression prediction
function predictNextValue(powerHistory) {
  const n = powerHistory.length;
  if (n < 2) return powerHistory[n - 1] || 0;

  const x = Array.from({ length: n }, (_, i) => i);
  const y = powerHistory;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return intercept + slope * n;
}

// Get peak consumption hours
function getPeakHours(data) {
  const hourlyData = {};
  data.forEach(d => {
    const hour = new Date(d.timestamp).getHours();
    hourlyData[hour] = (hourlyData[hour] || 0) + d.power_consumption;
  });

  return Object.entries(hourlyData)
    .map(([hour, consumption]) => ({ hour: parseInt(hour), consumption }))
    .sort((a, b) => b.consumption - a.consumption)
    .slice(0, 3);
}

// Get top consuming devices
function getTopDevices(data) {
  const deviceConsumption = {};
  data.forEach(d => {
    deviceConsumption[d.device_name] = (deviceConsumption[d.device_name] || 0) + d.power_consumption;
  });

  return Object.entries(deviceConsumption)
    .map(([device, consumption]) => ({ device, consumption }))
    .sort((a, b) => b.consumption - a.consumption)
    .slice(0, 5);
}

// ===== API ENDPOINTS =====

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Smart Energy Backend is running' });
});

// ✅ API 1: Real-time Energy Data
app.get('/api/energy/realtime', (req, res) => {
  const totalPower = Object.values(systemState.devices)
    .filter(d => d.status)
    .reduce((sum, d) => sum + d.power, 0);

  res.json({
    status: 'success',
    data: {
      current_power: totalPower.toFixed(2),
      temperature: systemState.realtime.temp,
      devices: Object.values(systemState.devices),
      timestamp: new Date(),
      history: systemState.realtime.history
    }
  });
});

// ✅ API 2: Historical Energy Data
app.get('/api/energy/history', async (req, res) => {
  try {
    const data = await loadEnergyData();
    const { days = 30, device } = req.query;

    let filtered = data;
    if (device) {
      filtered = filtered.filter(d => d.device_name === device);
    }

    const dailyConsumption = {};
    filtered.forEach(d => {
      const date = new Date(d.timestamp).toISOString().split('T')[0];
      dailyConsumption[date] = (dailyConsumption[date] || 0) + d.power_consumption;
    });

    res.json({
      status: 'success',
      data: {
        daily_consumption: dailyConsumption,
        total_consumption: Object.values(dailyConsumption).reduce((a, b) => a + b, 0),
        device: device || 'all'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error: could not fetch history', details: error.message });
  }
});

// ✅ API 3: Anomaly Detection
app.get('/api/energy/anomaly', async (req, res) => {
  try {
    const data = await loadEnergyData();
    const { threshold = 1.5 } = req.query;

    const anomalies = detectAnomalies(data, parseFloat(threshold));
    const stats = {
      total_records: data.length,
      anomaly_count: anomalies.length,
      anomaly_percentage: ((anomalies.length / data.length) * 100).toFixed(2),
      anomalies: anomalies.slice(0, 10) // Return top 10
    };

    res.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    res.status(500).json({ error: 'Error: could not detect anomalies', details: error.message });
  }
});

// ✅ API 4: Consumption Prediction
app.get('/api/energy/prediction', async (req, res) => {
  try {
    const data = await loadEnergyData();
    const powerHistory = data.map(d => d.power_consumption);

    const nextValue = predictNextValue(powerHistory);
    const peakHours = getPeakHours(data);
    const topDevices = getTopDevices(data);

    res.json({
      status: 'success',
      data: {
        predicted_next_consumption: nextValue.toFixed(2),
        peak_hours: peakHours,
        top_devices: topDevices,
        forecast_confidence: 0.85,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error: could not create prediction', details: error.message });
  }
});

// ✅ API 5: Dashboard Analytics
app.get('/api/energy/analytics', async (req, res) => {
  try {
    const data = await loadEnergyData();

    res.json({
      status: 'success',
      data: {
        daily_all: calculateDailyConsumption(data, 'Sảnh chính') + 
                   calculateDailyConsumption(data, 'Văn phòng A') + 
                   calculateDailyConsumption(data, 'Server'),
        peak_hours: getPeakHours(data),
        top_devices: getTopDevices(data),
        device_breakdown: [
          { device: 'Sảnh chính', consumption: calculateDailyConsumption(data, 'Sảnh chính') },
          { device: 'Văn phòng A', consumption: calculateDailyConsumption(data, 'Văn phòng A') },
          { device: 'Server', consumption: calculateDailyConsumption(data, 'Server') }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error: could not fetch analytics', details: error.message });
  }
});

// ===== WEBSOCKET: REAL-TIME UPDATES =====

// ===== IoT SERVICE APIs (Phase 1) =====

/**
 * POST /api/iot/ingest - Receive sensor data from IoT devices
 */
app.post('/api/iot/ingest', (req, res) => {
  const { device_id, sensor_type, value, timestamp } = req.body;

  if (!device_id || !sensor_type || value === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: device_id, sensor_type, value'
    });
  }

  const result = iotService.receiveSensorData(device_id, sensor_type, value, timestamp);

  if (result.success) {
    // Evaluate alert rules
    const systemState = {
      power: systemState.realtime.current_pwr,
      temperature: result.data.value,
      device: device_id
    };
    alertService.evaluateAlertRules(systemState);
  }

  res.status(result.success ? 200 : 400).json(result);
});

/**
 * GET /api/iot/devices - Get all registered IoT devices
 */
app.get('/api/iot/devices', (req, res) => {
  res.json({
    success: true,
    data: iotService.getAllDevices(),
    count: Object.keys(iotService.devices).length
  });
});

/**
 * GET /api/iot/reading/:deviceId/:sensorType - Get current sensor reading
 */
app.get('/api/iot/reading/:deviceId/:sensorType', (req, res) => {
  const { deviceId, sensorType } = req.params;
  const reading = iotService.getSensorReading(deviceId, sensorType);

  res.json({
    success: reading !== null,
    data: reading,
    message: reading ? 'Reading found' : 'No reading available'
  });
});

/**
 * GET /api/iot/readings/:deviceId - Get all readings for a device
 */
app.get('/api/iot/readings/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const readings = iotService.getDeviceReadings(deviceId);

  res.json({
    success: true,
    device_id: deviceId,
    data: readings,
    timestamp: new Date()
  });
});

/**
 * GET /api/iot/history/:deviceId/:sensorType - Get sensor history
 */
app.get('/api/iot/history/:deviceId/:sensorType', (req, res) => {
  const { deviceId, sensorType } = req.params;
  const { limit = 50 } = req.query;
  const history = iotService.getSensorHistory(deviceId, sensorType, parseInt(limit));

  res.json({
    success: true,
    device_id: deviceId,
    sensor_type: sensorType,
    data: history,
    count: history.length
  });
});

/**
 * GET /api/iot/anomaly/:deviceId/:sensorType - Detect anomalies
 */
app.get('/api/iot/anomaly/:deviceId/:sensorType', (req, res) => {
  const { deviceId, sensorType } = req.params;
  const { threshold = 2 } = req.query;

  const anomaly = iotService.detectAnomaly(deviceId, sensorType, parseFloat(threshold));

  res.json({
    success: true,
    device_id: deviceId,
    sensor_type: sensorType,
    data: anomaly
  });
});

/**
 * GET /api/iot/status - Get all device statuses
 */
app.get('/api/iot/status', (req, res) => {
  const { timeoutSeconds = 60 } = req.query;
  const statuses = iotService.getAllDeviceStatuses(parseInt(timeoutSeconds));

  res.json({
    success: true,
    data: statuses,
    timestamp: new Date()
  });
});

// ===== CONTROL SERVICE APIs (Phase 2) =====

/**
 * POST /api/hvac/setpoint - Set HVAC target temperature
 */
app.post('/api/hvac/setpoint', (req, res) => {
  const { device_id, temperature, mode } = req.body;

  if (!device_id || temperature === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: device_id, temperature'
    });
  }

  const result = controlService.setHVACSetpoint(
    device_id,
    parseFloat(temperature),
    mode || 'cool'
  );

  res.status(result.success ? 200 : 400).json(result);
});

/**
 * GET /api/hvac/status/:deviceId - Get HVAC status
 */
app.get('/api/hvac/status/:deviceId', (req, res) => {
  const status = controlService.getHVACStatus(req.params.deviceId);
  res.json({ success: true, data: status });
});

/**
 * POST /api/lighting/brightness - Set lighting brightness
 */
app.post('/api/lighting/brightness', (req, res) => {
  const { device_id, brightness, color_temp } = req.body;

  if (!device_id) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: device_id'
    });
  }

  const result = controlService.setLightingLevel(
    device_id,
    brightness || 80,
    color_temp || 'daylight'
  );

  res.status(result.success ? 200 : 400).json(result);
});

/**
 * GET /api/lighting/status/:deviceId - Get lighting status
 */
app.get('/api/lighting/status/:deviceId', (req, res) => {
  const status = controlService.getLightingStatus(req.params.deviceId);
  res.json({ success: true, data: status });
});

/**
 * POST /api/schedule/create - Create control schedule
 */
app.post('/api/schedule/create', (req, res) => {
  const result = controlService.createScheduleRule(req.body);
  res.status(result.success ? 200 : 400).json(result);
});

/**
 * GET /api/schedule/rules - Get all scheduled rules
 */
app.get('/api/schedule/rules', (req, res) => {
  res.json({
    success: true,
    data: controlService.getAllRules(),
    count: controlService.getAllRules().length
  });
});

/**
 * POST /api/occupancy/control - Auto-control based on occupancy
 */
app.post('/api/occupancy/control', (req, res) => {
  const { zone_id, occupancy } = req.body;

  if (!zone_id || occupancy === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: zone_id, occupancy'
    });
  }

  const result = controlService.occupancyBasedControl(zone_id, occupancy);
  res.json(result);
});

/**
 * POST /api/demandresponse/activate - Activate demand response
 */
app.post('/api/demandresponse/activate', (req, res) => {
  const { max_power_limit } = req.body;

  // Trigger alert
  alertService.triggerAlert({
    severity: 'warning',
    type: 'demand-response',
    title: 'Demand Response Activated',
    message: `System reduced to ${max_power_limit || 15}kW`,
    metadata: { maxPower: max_power_limit }
  });

  const result = controlService.activateDemandResponse(max_power_limit);
  res.json(result);
});

/**
 * POST /api/demandresponse/deactivate - Deactivate demand response
 */
app.post('/api/demandresponse/deactivate', (req, res) => {
  const result = controlService.deactivateDemandResponse();

  alertService.triggerAlert({
    severity: 'info',
    type: 'demand-response',
    title: 'Demand Response Deactivated',
    message: 'System returned to normal operation'
  });

  res.json(result);
});

// ===== ALERT SERVICE APIs (Phase 3) =====

/**
 * GET /api/alerts - Get alerts
 */
app.get('/api/alerts', (req, res) => {
  const { severity, acknowledged, type, limit } = req.query;

  const alerts = alertService.getAllAlerts({
    severity,
    acknowledged: acknowledged ? JSON.parse(acknowledged) : undefined,
    type,
    limit: limit ? parseInt(limit) : 50
  });

  res.json({
    success: true,
    data: alerts,
    count: alerts.length,
    stats: alertService.getStats()
  });
});

/**
 * GET /api/alerts/active - Get active (unacknowledged) alerts
 */
app.get('/api/alerts/active', (req, res) => {
  const { severity } = req.query;
  const alerts = alertService.getActiveAlerts(severity);

  res.json({
    success: true,
    data: alerts,
    count: alerts.length
  });
});

/**
 * POST /api/alerts/:alertId/acknowledge - Acknowledge alert
 */
app.post('/api/alerts/:alertId/acknowledge', (req, res) => {
  const { alertId } = req.params;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: user_id'
    });
  }

  const result = alertService.acknowledgeAlert(alertId, user_id);
  res.status(result.success ? 200 : 400).json(result);
});

/**
 * POST /api/alerts/:alertId/resolve - Resolve alert
 */
app.post('/api/alerts/:alertId/resolve', (req, res) => {
  const { alertId } = req.params;
  const result = alertService.resolveAlert(alertId);

  res.status(result.success ? 200 : 400).json(result);
});

/**
 * POST /api/alerts/rules/create - Create alert rule
 */
app.post('/api/alerts/rules/create', (req, res) => {
  const result = alertService.createAlertRule(req.body);
  res.status(result.success ? 200 : 400).json(result);
});

/**
 * GET /api/alerts/rules - Get all alert rules
 */
app.get('/api/alerts/rules', (req, res) => {
  const rules = alertService.getAlertRules();

  res.json({
    success: true,
    data: rules,
    count: rules.length
  });
});

/**
 * POST /api/alerts/trigger - Manually trigger alert (for testing)
 */
app.post('/api/alerts/trigger', (req, res) => {
  const alert = alertService.triggerAlert(req.body);

  res.json({
    success: true,
    alert: alert,
    message: 'Alert triggered'
  });
});

/**
 * GET /api/alerts/stats - Get alert statistics
 */
app.get('/api/alerts/stats', (req, res) => {
  const stats = alertService.getStats();

  res.json({
    success: true,
    data: stats
  });
});

// ===== WEBSOCKET: REAL-TIME UPDATES =====

// Subscribe alert service to WebSocket broadcasts
wss.on('connection', (ws) => {
  console.log('✅ WebSocket client connected');

  // Subscribe to alerts
  alertService.subscribe(ws);

  // Send initial data
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to real-time updates',
    timestamp: new Date().toISOString()
  }));

  // Send initial alerts stats
  alertService.broadcastStats();

  // Subscribe to IoT sensor updates
  iotService.on('sensor-update', (data) => {
    ws.send(JSON.stringify({
      type: 'sensor-update',
      data: data,
      timestamp: new Date().toISOString()
    }));
  });

  // Simulate real-time data updates every 5 seconds
  const interval = setInterval(() => {
    const randomPower = (Math.random() * 8 + 1.2).toFixed(2);
    const randomTemp = (23 + Math.random() * 3).toFixed(1);
    const randomHumidity = (40 + Math.random() * 30).toFixed(1);

    // Broadcast to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {  // WebSocket.OPEN
        client.send(JSON.stringify({
          type: 'realtime',
          data: {
            current_power: randomPower,
            temperature: randomTemp,
            humidity: randomHumidity,
            timestamp: new Date().toISOString()
          }
        }));
      }
    });

    // Update system state
    systemState.realtime.current_pwr = parseFloat(randomPower);
    systemState.realtime.temp = parseFloat(randomTemp);
  }, 5000);

  ws.on('close', () => {
    clearInterval(interval);
    alertService.unsubscribe(ws);
    console.log('❌ WebSocket client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// ===== INITIALIZATION =====

// Initialize IoT Devices with sensors
function initializeIOTDevices() {
  // Register HVAC system
  iotService.registerDevice('hvac-main', 'hvac', 'Tòa nhà', ['temperature', 'humidity', 'power']);

  // Register Lighting system
  iotService.registerDevice('lighting-main', 'lighting', 'Tòa nhà', ['power']);

  // Register Environmental sensors
  iotService.registerDevice('env-sensor-1', 'sensor', 'Tầng 01', ['temperature', 'humidity', 'co2']);
  iotService.registerDevice('env-sensor-2', 'sensor', 'Tầng 02', ['temperature', 'humidity', 'co2']);

  // Insert initial mock data
  iotService.receiveSensorData('hvac-main', 'temperature', 24.5);
  iotService.receiveSensorData('hvac-main', 'humidity', 45.2);
  iotService.receiveSensorData('hvac-main', 'power', 3.5);
  iotService.receiveSensorData('lighting-main', 'power', 1.8);
  iotService.receiveSensorData('env-sensor-1', 'temperature', 24.0);
  iotService.receiveSensorData('env-sensor-1', 'humidity', 48.0);
  iotService.receiveSensorData('env-sensor-1', 'co2', 520);

  console.log('✅ IoT Devices initialized');
}

// Initialize Control Rules
function initializeControlRules() {
  controlService.createScheduleRule({
    id: 'rule-hvac-morning',
    device_id: 'hvac-main',
    triggers: [
      { type: 'time', time: '06:00', days: [1, 2, 3, 4, 5] }  // Weekdays at 6 AM
    ],
    actions: [
      { type: 'hvac', device_id: 'hvac-main', target_temp: 24, mode: 'cool' }
    ]
  });

  controlService.createScheduleRule({
    id: 'rule-hvac-evening',
    device_id: 'hvac-main',
    triggers: [
      { type: 'time', time: '22:00', days: [0, 1, 2, 3, 4, 5, 6] }  // Every day at 10 PM
    ],
    actions: [
      { type: 'hvac', device_id: 'hvac-main', target_temp: 26, mode: 'auto' }
    ]
  });

  console.log('✅ Control Rules initialized');
}

// Initialize Alert Rules
function initializeAlertRules() {
  alertService.createAlertRule({
    id: 'rule-overload',
    title: 'Overload Detected',
    message: 'System power exceeds threshold',
    condition: 'power > 15',
    severity: 'critical',
    type: 'overload',
    device_id: null
  });

  alertService.createAlertRule({
    id: 'rule-high-temp',
    title: 'High Temperature',
    message: 'Temperature exceeds 28°C',
    condition: 'temperature > 28',
    severity: 'warning',
    type: 'temperature',
    device_id: null
  });

  alertService.createAlertRule({
    id: 'rule-high-co2',
    title: 'High CO2 Level',
    message: 'CO2 exceeds 1000ppm',
    condition: 'co2 > 1000',
    severity: 'warning',
    type: 'air-quality',
    device_id: null
  });

  console.log('✅ Alert Rules initialized');
}

// Run initialization
initializeIOTDevices();
initializeControlRules();
initializeAlertRules();

// ===== ERROR HANDLERS =====
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.path });
});

app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// ===== SERVER STARTUP =====
server.listen(PORT, () => {
  console.log(`\n🚀 Smart Energy Backend running on http://localhost:${PORT}`);
  console.log(`\n📊 NEW APIs (Phase 1-3):`);
  console.log(`   IoT Sensors:`);
  console.log(`       POST /api/iot/ingest - Receive sensor data`);
  console.log(`       GET /api/iot/devices - List devices`);
  console.log(`       GET /api/iot/reading/:deviceId/:sensorType - Get reading`);
  console.log(`       GET /api/iot/status - Device statuses`);
  console.log(`   HVAC Control:`);
  console.log(`       POST /api/hvac/setpoint - Set temperature`);
  console.log(`       GET /api/hvac/status/:deviceId - Get status`);
  console.log(`   Lighting Control:`);
  console.log(`       POST /api/lighting/brightness - Set brightness`);
  console.log(`       GET /api/lighting/status/:deviceId - Get status`);
  console.log(`   Scheduling:`);
  console.log(`       POST /api/schedule/create - Create schedule`);
  console.log(`       GET /api/schedule/rules - List rules`);
  console.log(`   Alerts:`);
  console.log(`       GET /api/alerts - Get alerts`);
  console.log(`       POST /api/alerts/:alertId/acknowledge - Acknowledge`);
  console.log(`       GET /api/alerts/active - Active alerts`);
  console.log(`\n🔌 WebSocket: ws://localhost:${PORT}`);
  console.log();
});
