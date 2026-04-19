// backend/iot-service.js - IoT Sensor Data Handler & Validator

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class IoTService extends EventEmitter {
  constructor() {
    super();
    this.devices = {};           // Registered IoT devices
    this.sensorData = {};        // Current sensor readings
    this.sensorHistory = {};     // Historical readings (optional)
    this.alerts = [];            // Local alert queue

    // === PHẦN BỔ SUNG: TỰ ĐỘNG CHẠY DỮ LIỆU GIẢ LẬP ===
    // 1. Đăng ký sẵn 1 thiết bị để Dashboard tìm thấy ngay
    const defaultId = 'hvac-01';
    this.registerDevice(defaultId, 'hvac', 'Tầng 1 - Phòng khách', ['temperature', 'humidity', 'power']);

    // 2. Tạo vòng lặp cập nhật số liệu mỗi 3 giây để biểu đồ "chạy"
    setInterval(() => {
        const now = Date.now();
        // Sinh số ngẫu nhiên hợp lệ theo validator bên dưới
        const mockTemp = 24 + Math.random() * 4; 
        const mockHum = 50 + Math.random() * 10;
        const mockPwr = 1.5 + Math.random() * 2;

        this.receiveSensorData(defaultId, 'temperature', mockTemp, now);
        this.receiveSensorData(defaultId, 'humidity', mockHum, now);
        this.receiveSensorData(defaultId, 'power', mockPwr, now);
    }, 3000);
    // === HẾT PHẦN BỔ SUNG ===
  }

  // ===== DEVICE MANAGEMENT =====

  /**
   * Register a new device
   * @param {string} deviceId - Unique device identifier
   * @param {string} deviceType - Type: 'hvac', 'lighting', 'sensor', 'server'
   * @param {string} location - Physical location e.g., "Tầng 01"
   * @param {array} sensors - Supported sensors e.g., ['temperature', 'humidity']
   */
  registerDevice(deviceId, deviceType, location, sensors = []) {
    this.devices[deviceId] = {
      id: deviceId,
      type: deviceType,
      location: location,
      sensors: sensors,
      status: 'online',
      lastSeen: new Date(),
      registeredAt: new Date()
    };

    console.log(`✅ Device registered: ${deviceId} (${deviceType}) at ${location}`);
    return this.devices[deviceId];
  }

  /**
   * Unregister device
   */
  unregisterDevice(deviceId) {
    if (delete this.devices[deviceId]) {
      console.log(`❌ Device unregistered: ${deviceId}`);
      return true;
    }
    return false;
  }

  /**
   * Get all registered devices
   */
  getAllDevices() {
    return Object.values(this.devices);
  }

  /**
   * Get device details
   */
  getDevice(deviceId) {
    return this.devices[deviceId] || null;
  }

  // ===== SENSOR DATA HANDLING =====

  /**
   * Receive sensor data from IoT device
   * @param {string} deviceId - Device sending data
   * @param {string} sensorType - Type of sensor
   * @param {number} value - Sensor reading value
   * @param {number} timestamp - Unix timestamp (optional, defaults to now)
   */
  receiveSensorData(deviceId, sensorType, value, timestamp = Date.now()) {
    // 1. Validate device exists
    const device = this.devices[deviceId];
    if (!device) {
      console.warn(`⚠️  Device not found: ${deviceId}`);
      return { success: false, error: 'Device not registered' };
    }

    // 2. Validate sensor is supported by device
    if (!device.sensors.includes(sensorType)) {
      console.warn(`⚠️  Sensor ${sensorType} not supported by device ${deviceId}`);
      return { success: false, error: 'Sensor not supported' };
    }

    // 3. Validate data value
    const validation = this.validateSensorData(sensorType, value);
    if (!validation.valid) {
      console.warn(`⚠️  Invalid ${sensorType} data: ${value} - ${validation.error}`);
      return { success: false, error: validation.error };
    }

    // 4. Store data
    const key = `${deviceId}:${sensorType}`;
    this.sensorData[key] = {
      deviceId,
      sensorType,
      value: parseFloat(value),
      timestamp: new Date(timestamp),
      status: 'active'
    };

    // 5. Update device last seen
    device.lastSeen = new Date();

    // 6. Keep history (last 100 readings per sensor)
    if (!this.sensorHistory[key]) {
      this.sensorHistory[key] = [];
    }
    this.sensorHistory[key].push({
      value: parseFloat(value),
      timestamp: new Date(timestamp)
    });
    if (this.sensorHistory[key].length > 100) {
      this.sensorHistory[key].shift();
    }

    // 7. Emit event
    this.emit('sensor-update', {
      deviceId,
      sensorType,
      value: parseFloat(value),
      timestamp,
      device: device
    });

    // Tạm thời comment log này lại để tránh trôi màn hình console, cần thì bạn mở ra
    // console.log(`📊 [${deviceId}] ${sensorType}: ${value}`); 
    return { success: true, data: this.sensorData[key] };
  }

  /**
   * Get current sensor reading
   */
  getSensorReading(deviceId, sensorType) {
    const key = `${deviceId}:${sensorType}`;
    return this.sensorData[key] || null;
  }

  /**
   * Get all current readings for a device
   */
  getDeviceReadings(deviceId) {
    const readings = {};
    Object.entries(this.sensorData).forEach(([key, value]) => {
      if (key.startsWith(deviceId)) {
        const sensorType = key.split(':')[1];
        readings[sensorType] = value;
      }
    });
    return readings;
  }

  /**
   * Get sensor history (for trending/analytics)
   */
  getSensorHistory(deviceId, sensorType, limit = 50) {
    const key = `${deviceId}:${sensorType}`;
    const history = this.sensorHistory[key] || [];
    return history.slice(-limit);
  }

  /**
   * Get all current sensor readings across all devices
   */
  getAllReadings() {
    return this.sensorData;
  }

  // ===== DATA VALIDATION =====

  /**
   * Validate sensor data against acceptable ranges
   */
  validateSensorData(sensorType, value) {
    const validators = {
      'temperature': {
        min: 10,
        max: 40,
        unit: '°C',
        validator: (v) => v >= 10 && v <= 40
      },
      'humidity': {
        min: 0,
        max: 100,
        unit: '%',
        validator: (v) => v >= 0 && v <= 100
      },
      'power': {
        min: 0,
        max: 50,
        unit: 'kW',
        validator: (v) => v >= 0 && v <= 50
      },
      'occupancy': {
        min: 0,
        max: 1000,
        unit: 'people',
        validator: (v) => Number.isInteger(v) && v >= 0 && v <= 1000
      },
      'co2': {
        min: 300,
        max: 5000,
        unit: 'ppm',
        validator: (v) => v >= 300 && v <= 5000
      }
    };

    const validator = validators[sensorType];
    if (!validator) {
      return { valid: false, error: `Unknown sensor type: ${sensorType}` };
    }

    if (!validator.validator(value)) {
      return {
        valid: false,
        error: `${sensorType} out of range [${validator.min}-${validator.max} ${validator.unit}]`
      };
    }

    return { valid: true };
  }

  // ===== DEVICE STATUS MONITORING =====

  /**
   * Check device connectivity (heartbeat)
   */
  checkDeviceStatus(deviceId, timeoutSeconds = 60) {
    const device = this.devices[deviceId];
    if (!device) return { status: 'unknown', reason: 'Device not registered' };

    const elapsedSeconds = (Date.now() - device.lastSeen.getTime()) / 1000;

    if (elapsedSeconds > timeoutSeconds) {
      return { status: 'offline', lastSeen: device.lastSeen, elapsedSeconds };
    }

    return { status: 'online', lastSeen: device.lastSeen, elapsedSeconds };
  }

  /**
   * Get all device statuses
   */
  getAllDeviceStatuses(timeoutSeconds = 60) {
    const statuses = {};
    Object.keys(this.devices).forEach((deviceId) => {
      statuses[deviceId] = this.checkDeviceStatus(deviceId, timeoutSeconds);
    });
    return statuses;
  }

  // ===== STATISTICS & ANALYTICS =====

  /**
   * Get average sensor reading for a time period
   */
  getAverageSensorReading(deviceId, sensorType, minutes = 60) {
    const history = this.getSensorHistory(deviceId, sensorType, 1000);
    if (history.length === 0) return null;

    const cutoffTime = Date.now() - (minutes * 60 * 1000);
    const recentReadings = history.filter(
      (r) => new Date(r.timestamp).getTime() > cutoffTime
    );

    if (recentReadings.length === 0) return null;

    const sum = recentReadings.reduce((acc, r) => acc + r.value, 0);
    return {
      average: sum / recentReadings.length,
      min: Math.min(...recentReadings.map(r => r.value)),
      max: Math.max(...recentReadings.map(r => r.value)),
      count: recentReadings.length,
      periodMinutes: minutes
    };
  }

  /**
   * Detect sensor anomaly (value outside normal range)
   */
  detectAnomaly(deviceId, sensorType, threshold = 2.0) {
    const current = this.getSensorReading(deviceId, sensorType);
    if (!current) return null;

    const history = this.getSensorHistory(deviceId, sensorType, 20);
    if (history.length < 5) return null;

    const values = history.map(h => h.value);
    const avg = values.reduce((a, b) => a + b) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / values.length
    );

    const zScore = Math.abs((current.value - avg) / (stdDev || 1));

    if (zScore > threshold) {
      return {
        anomalyDetected: true,
        currentValue: current.value,
        average: avg,
        standardDeviation: stdDev,
        zScore: zScore,
        severity: zScore > threshold * 2 ? 'high' : 'medium'
      };
    }

    return { anomalyDetected: false };
  }

  // ===== EXPORT/IMPORT =====

  /**
   * Export current state to JSON
   */
  exportState() {
    return {
      devices: this.devices,
      sensorData: this.sensorData,
      exportedAt: new Date(),
      count: {
        devices: Object.keys(this.devices).length,
        readings: Object.keys(this.sensorData).length
      }
    };
  }

  /**
   * Save state to file (for persistence)
   */
  async saveStateToFile(filePath) {
    try {
      const state = this.exportState();
      await fs.writeFile(filePath, JSON.stringify(state, null, 2));
      console.log(`💾 State saved to ${filePath}`);
      return true;
    } catch (error) {
      console.error(`Error saving state: ${error.message}`);
      return false;
    }
  }

  /**
   * Load state from file
   */
  async loadStateFromFile(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const state = JSON.parse(data);
      
      this.devices = state.devices || {};
      this.sensorData = state.sensorData || {};
      
      console.log(`📂 State loaded from ${filePath}`);
      return true;
    } catch (error) {
      console.error(`Error loading state: ${error.message}`);
      return false;
    }
  }
}

// Export singleton instance
export default new IoTService();