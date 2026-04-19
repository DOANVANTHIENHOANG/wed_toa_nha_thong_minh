/**
 * Smart Energy Dashboard - API Client
 * Connects frontend to Node.js Express Backend
 * ⚠️ Do not edit current HTML/CSS - This file only adds API calls
 */

// ===== CONFIGURATION =====
const API_BASE = 'http://127.0.0.1:3000/api';
const WS_URL = 'ws://127.0.0.1:3000';

class EnergyAPIClient {
  constructor() {
    this.wsConnection = null;
    this.requestTimeout = 30000;
    this.wsRetryCount = 0;
    this.wsMaxRetries = 5;
    this.wsRetryDelay = 3000;
    this.wsConnected = false;
    console.log('🔌 Energy API Client initialized');
  }

  // ===== UTILITY: Handle API Requests =====
  async _request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error(`❌ API Error [${endpoint}]:`, error);
    this._showErrorAlert(error.message);
    throw error;
  }
}

  // ===== ERROR HANDLING =====
  _showErrorAlert(message) {
    // ✅ ADD THIS: Show error without changing HTML layout
    // Create a non-intrusive alert that doesn't modify the DOM structure
    const alert = document.createElement('div');
    alert.className = 'api-error-alert';
    alert.innerHTML = `
      <style>
        .api-error-alert {
          position: fixed;
          top: 100px;
          right: 20px;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          padding: 12px 16px;
          border-radius: 4px;
          font-size: 14px;
          z-index: 10000;
          animation: slideIn 0.3s ease;
          max-width: 300px;
        }
        .api-error-alert.closing {
          animation: slideOut 0.3s ease;
        }
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(400px); opacity: 0; }
        }
      </style>
      ⚠️ ${message}
    `;
    document.body.appendChild(alert);
    setTimeout(() => {
      alert.classList.add('closing');
      setTimeout(() => alert.remove(), 300);
    }, 4000);
  }

  // ===== API METHODS =====

  // ✅ ADD THIS: Get real-time energy data
  async getRealtimeData() {
    try {
      const result = await this._request('/energy/realtime');
      console.log('📊 Realtime data:', result.data);
      return result.data;
    } catch (error) {
      return null;
    }
  }

  // ✅ ADD THIS: Get historical data
  async getHistoryData(days = 30, device = null) {
    try {
      let endpoint = `/energy/history?days=${days}`;
      if (device) {
        endpoint += `&device=${encodeURIComponent(device)}`;
      }
      const result = await this._request(endpoint);
      console.log('📈 History data:', result.data);
      return result.data;
    } catch (error) {
      return null;
    }
  }

  // ✅ ADD THIS: Get anomaly detection
  async getAnomalyData(threshold = 1.5) {
    try {
      const result = await this._request(`/energy/anomaly?threshold=${threshold}`);
      console.log('🚨 Anomaly data:', result.data);
      return result.data;
    } catch (error) {
      return null;
    }
  }

  // ✅ ADD THIS: Get prediction data
  async getPredictionData() {
    try {
      const result = await this._request('/energy/prediction');
      console.log('🔮 Prediction data:', result.data);
      return result.data;
    } catch (error) {
      return null;
    }
  }

  // ✅ ADD THIS: Get analytics dashboard data
  async getAnalyticsData() {
    try {
      const result = await this._request('/energy/analytics');
      console.log('📊 Analytics data:', result.data);
      return result.data;
    } catch (error) {
      return null;
    }
  }

  // ===== WEBSOCKET: REAL-TIME UPDATES =====

  // ✅ ADD THIS: Connect to WebSocket for live updates with fallback
  connectWebSocket(onMessageCallback) {
    // Check if backend server is running first
    this._checkBackendHealth()
      .then(isHealthy => {
        if (!isHealthy) {
          console.warn('⚠️ Backend server not responding. WebSocket will retry when server is available.');
         // this._showErrorAlert('Backend server not available. Make sure "npm run dev" is running in backend folder.');
          this._scheduleWebSocketRetry(onMessageCallback);
          return;
        }
        
        this._connectWebSocketInternal(onMessageCallback);
      })
      .catch(err => {
        console.error('Health check failed:', err);
        this._scheduleWebSocketRetry(onMessageCallback);
      });
  }

  // ===== INTERNAL WEBSOCKET METHODS =====

  // Check if backend is running (health check)
  async _checkBackendHealth() {
    try {
      const response = await fetch('http://127.0.0.1:3000/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error.message);
      return false;
    }
  }

  // Internal connection logic
  _connectWebSocketInternal(onMessageCallback) {
    try {
      console.log(`🔗 Attempting WebSocket connection... (Attempt ${this.wsRetryCount + 1}/${this.wsMaxRetries})`);
      
      this.wsConnection = new WebSocket(WS_URL);
      const connectionTimeout = setTimeout(() => {
        if (this.wsConnection.readyState === WebSocket.CONNECTING) {
          console.warn('⚠️ WebSocket connection timeout');
          this.wsConnection.close();
          this._scheduleWebSocketRetry(onMessageCallback);
        }
      }, 5000);

      this.wsConnection.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('🟢 WebSocket connected successfully');
        this.wsConnected = true;
        this.wsRetryCount = 0;
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('💫 WebSocket message:', message);
          if (onMessageCallback) {
            onMessageCallback(message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.wsConnection.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.wsConnected = false;
      };

      this.wsConnection.onclose = () => {
        clearTimeout(connectionTimeout);
        console.log('⚫ WebSocket disconnected');
        this.wsConnected = false;
        
        // Auto-reconnect with retry logic
        if (this.wsRetryCount < this.wsMaxRetries) {
          this._scheduleWebSocketRetry(onMessageCallback);
        } else {
          console.error('❌ WebSocket: Max retry attempts reached. Falling back to HTTP polling.');
          this._showErrorAlert('Real-time updates unavailable. Using polling instead.');
        }
      };
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      this._scheduleWebSocketRetry(onMessageCallback);
    }
  }

  // Schedule retry with exponential backoff
  _scheduleWebSocketRetry(onMessageCallback) {
    this.wsRetryCount++;
    const delay = this.wsRetryDelay * this.wsRetryCount;
    console.log(`⏰ Retrying WebSocket connection in ${delay}ms... (Retry ${this.wsRetryCount}/${this.wsMaxRetries})`);
    
    setTimeout(() => {
      if (this.wsRetryCount <= this.wsMaxRetries) {
        this.connectWebSocket(onMessageCallback);
      }
    }, delay);
  }

  // Close WebSocket connection
  disconnectWebSocket() {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
      this.wsConnected = false;
      console.log('WebSocket disconnected by user');
    }
  }

  // Force reconnect (useful for debugging)
  reconnectWebSocket(onMessageCallback = null) {
    console.log('🔄 Forcing WebSocket reconnection...');
    this.disconnectWebSocket();
    this.wsRetryCount = 0;
    this.connectWebSocket(onMessageCallback || (() => {}));
  }

  // ===== DATA FORMATTING =====

  // Format consumption data for charts
  formatChartData(dailyConsumption) {
    return {
      labels: Object.keys(dailyConsumption),
      datasets: [{
        label: 'Daily Consumption (kWh)',
        data: Object.values(dailyConsumption),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  }

  // Format device breakdown data
  formatDeviceBreakdown(deviceData) {
    return {
      labels: deviceData.map(d => d.device || d.name),
      datasets: [{
        label: 'Consumption (kWh)',
        data: deviceData.map(d => d.consumption || d.power),
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6'
        ]
      }]
    };
  }
}

// ===== SINGLETON INSTANCE =====
const energyAPI = new EnergyAPIClient();

// ===== AUTO-INIT: Start WebSocket on page load =====
window.addEventListener('DOMContentLoaded', () => {
  console.log('🎯 Smart Energy Dashboard loaded - APIs ready');
  
  // Check backend health before attempting WebSocket connection
  console.log('🔍 Checking backend server health...');
  energyAPI._checkBackendHealth()
    .then(isHealthy => {
      if (isHealthy) {
        console.log('✅ Backend server is running. Connecting WebSocket...');
        // Try to connect WebSocket (non-blocking)
        setTimeout(() => {
          energyAPI.connectWebSocket((message) => {
            // ✅ ADD THIS: Handle real-time updates without modifying UI
            if (message.type === 'realtime' && message.data) {
              console.log('⚡ Real-time update:', message.data);
              // Update will be handled by frontend code that calls the API
            }
          });
        }, 500);
      } else {
        console.warn('⚠️ Backend server not detected on port 3000');
        console.warn('📝 To enable real-time updates, run: cd backend && npm run dev');
        // Still attempt connection in case backend starts later
        setTimeout(() => {
          energyAPI.connectWebSocket((message) => {
            if (message.type === 'realtime' && message.data) {
              console.log('⚡ Real-time update:', message.data);
            }
          });
        }, 1000);
      }
    });
});

// ===== EXPORT FOR BROWSER =====
window.energyAPI = energyAPI;
console.log('✅ API Client exported as window.energyAPI');
window.energyAPI.connectWebSocket();