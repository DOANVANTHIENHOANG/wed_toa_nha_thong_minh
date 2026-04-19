/**
 * SED V2.1 - Settings.js
 * Cài đặt nâng cao hệ thống với real-time monitoring
 */

class AdvancedSettingsManager {
    constructor() {
        this.settings = {};
        this.alerts = [];
        this.isMonitoring = false;
        this.init();
    }

    async init() {
        console.log('⚙️ Initializing Advanced Settings Manager...');
        await this.loadSettings();
        await this.loadAlerts();
        this.setupEventListeners();
        this.startRealTimeMonitoring();
    }

    setupEventListeners() {
        // Apply settings
        const applyBtn = document.getElementById('btn-apply-settings');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => this.applySettings());
        }

        // Reset to defaults
        const resetBtn = document.getElementById('btn-reset-settings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetToDefaults());
        }

        // Clear alerts
        const clearAlertsBtn = document.getElementById('btn-clear-alerts');
        if (clearAlertsBtn) {
            clearAlertsBtn.addEventListener('click', () => this.clearAllAlerts());
        }

        // Threshold slider
        const thresholdSlider = document.getElementById('threshold-slider');
        if (thresholdSlider) {
            thresholdSlider.addEventListener('input', (e) => this.updateThresholdDisplay(e.target.value));
        }
    }

    async loadSettings() {
        try {
            const response = await fetch('/api/settings');
            const data = await response.json();

            this.settings = data;

            // Populate form fields
            const thresholdInput = document.getElementById('threshold-input');
            const priceInput = document.getElementById('price-per-kwh-input');
            const scheduleInput = document.getElementById('schedule-off-input');
            const thresholdSlider = document.getElementById('threshold-slider');

            if (thresholdInput) thresholdInput.value = data.threshold || 5.0;
            if (priceInput) priceInput.value = data.price_per_kwh || 2500;
            if (scheduleInput) scheduleInput.value = data.schedule_off || '22:00';
            if (thresholdSlider) {
                thresholdSlider.value = data.threshold || 5.0;
                thresholdSlider.max = 15.0;
                this.updateThresholdDisplay(data.threshold || 5.0);
            }

            console.log('✅ Settings loaded:', data);
        } catch (error) {
            console.error('❌ Error loading settings:', error);
            this.showNotification('Lỗi khi tải cài đặt', 'error');
        }
    }

    async loadAlerts() {
        try {
            const response = await fetch('/api/realtime/alerts?limit=20');
            const data = await response.json();

            if (data.success) {
                this.alerts = data.alerts || [];
                this.displayAlerts();
            }
        } catch (error) {
            console.error('Error loading alerts:', error);
        }
    }

    displayAlerts() {
        const alertContainer = document.getElementById('alerts-container');
        if (!alertContainer) return;

        if (this.alerts.length === 0) {
            alertContainer.innerHTML = `
                <div class="empty-state">
                    <p>✅ Không có cảnh báo nào</p>
                </div>
            `;
            return;
        }

        alertContainer.innerHTML = `
            <div class="alerts-header">
                <h4>⚠️ Cảnh báo gần đây (${this.alerts.length})</h4>
            </div>
            ${this.alerts.map(alert => `
                <div class="alert-item alert-${alert.severity.toLowerCase()}">
                    <div class="alert-icon">
                        ${alert.severity === 'HIGH' ? '🔴' : alert.severity === 'WARNING' ? '🟡' : '🔵'}
                    </div>
                    <div class="alert-content">
                        <div class="alert-title">
                            <strong>${alert.device_name}</strong>
                            <span class="alert-time">${this.formatTime(alert.timestamp)}</span>
                        </div>
                        <p class="alert-message">${alert.message}</p>
                        <div class="alert-details">
                            <span>Giá trị: <strong>${alert.current_value}</strong></span>
                            <span>Ngưỡng: <strong>${alert.threshold_value}</strong></span>
                            <span>Loại: <strong>${alert.alert_type}</strong></span>
                        </div>
                    </div>
                    ${!alert.is_resolved ? `
                        <button onclick="advancedSettings.resolveAlert(${alert.id})" class="btn-resolve">
                            ✅ Xảy ngoại ghi danh
                        </button>
                    ` : `
                        <span class="resolved-badge">✓ Đã xử lý</span>
                    `}
                </div>
            `).join('')}
        `;
    }

    updateThresholdDisplay(value) {
        const display = document.getElementById('threshold-display');
        if (display) {
            display.textContent = `${value} kW`;
        }

        const indicator = document.getElementById('threshold-indicator');
        if (indicator) {
            indicator.style.width = `${(value / 15) * 100}%`;
            indicator.style.backgroundColor = value > 7 ? '#ff6b6b' : value > 5 ? '#ffa726' : '#66bb6a';
        }
    }

    async applySettings() {
        try {
            const threshold = parseFloat(document.getElementById('threshold-input')?.value || 5.0);
            const price = parseInt(document.getElementById('price-per-kwh-input')?.value || 2500);
            const scheduleOff = document.getElementById('schedule-off-input')?.value || '22:00';

            // Validate
            if (threshold < 1 || threshold > 15) {
                this.showNotification('Ngưỡng phải từ 1-15 kW', 'warning');
                return;
            }

            if (price < 0 || price > 10000) {
                this.showNotification('Giá phải từ 0-10000 ₫', 'warning');
                return;
            }

            const applyBtn = document.getElementById('btn-apply-settings');
            if (applyBtn) {
                applyBtn.disabled = true;
                applyBtn.textContent = '⏳ Đang lưu...';
            }

            const response = await fetch('/api/settings/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    threshold: threshold,
                    price_per_kwh: price,
                    schedule_off: scheduleOff
                })
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            this.settings = { threshold, price_per_kwh: price, schedule_off: scheduleOff };

            this.showNotification(`✅ Cài đặt đã được cập nhật!`, 'success');

            if (applyBtn) {
                applyBtn.disabled = false;
                applyBtn.textContent = '💾 Lưu cài đặt';
            }

            // Auto-reload alerts
            await this.loadAlerts();

        } catch (error) {
            console.error('❌ Error applying settings:', error);
            this.showNotification('Lỗi khi lưu cài đặt', 'error');
        }
    }

    resetToDefaults() {
        if (!confirm('Đặt lại tất cả cài đặt về mặc định?')) return;

        const thresholdInput = document.getElementById('threshold-input');
        const priceInput = document.getElementById('price-per-kwh-input');
        const scheduleInput = document.getElementById('schedule-off-input');
        const thresholdSlider = document.getElementById('threshold-slider');

        if (thresholdInput) thresholdInput.value = 5.0;
        if (priceInput) priceInput.value = 2500;
        if (scheduleInput) scheduleInput.value = '22:00';
        if (thresholdSlider) {
            thresholdSlider.value = 5.0;
            this.updateThresholdDisplay(5.0);
        }

        this.applySettings();
    }

    async resolveAlert(alertId) {
        try {
            const response = await fetch(`/api/realtime/alerts/${alertId}/resolve`, {
                method: 'POST'
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            this.showNotification('✅ Cảnh báo đã được xác nhận', 'success');
            await this.loadAlerts();

        } catch (error) {
            console.error('Error resolving alert:', error);
            this.showNotification('Lỗi khi xác nhận cảnh báo', 'error');
        }
    }

    async clearAllAlerts() {
        if (!confirm('Xóa toàn bộ cảnh báo?')) return;

        try {
            const response = await fetch('/api/alerts/clear', { method: 'POST' });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            this.alerts = [];
            this.displayAlerts();
            this.showNotification('✅ Tất cả cảnh báo đã được xóa', 'success');

        } catch (error) {
            console.error('Error clearing alerts:', error);
            this.showNotification('Lỗi khi xóa cảnh báo', 'error');
        }
    }

    startRealTimeMonitoring() {
        if (this.isMonitoring) return;

        this.isMonitoring = true;

        // Check real-time stats every 30 seconds
        this.monitoringInterval = setInterval(async () => {
            try {
                const response = await fetch('/api/realtime/current');
                const data = await response.json();

                if (data.success) {
                    this.updateRealtimeDisplay(data);

                    // Reload alerts if new alerts detected
                    await this.loadAlerts();
                }
            } catch (error) {
                console.error('Error in real-time monitoring:', error);
            }
        }, 30000);  // Every 30 seconds

        console.log('✅ Real-time monitoring started');
    }

    updateRealtimeDisplay(data) {
        const realtimeContainer = document.getElementById('realtime-display');
        if (!realtimeContainer) return;

        const isAlert = data.alert ? 'alert-active' : 'alert-inactive';

        realtimeContainer.innerHTML = `
            <div class="realtime-stat ${isAlert}">
                <div class="stat-label">⚡ Công suất hiện tại</div>
                <div class="stat-value">${data.current_pwr} kW</div>
                <div class="stat-info">
                    ${data.alert ? `🔴 VỀT NGƯỠNG (${data.threshold} kW)` : `✅ Bình thường`}
                </div>
            </div>

            <div class="realtime-stat">
                <div class="stat-label">🌡️ Nhiệt độ</div>
                <div class="stat-value">${data.temp}°C</div>
                <div class="stat-info">Cập nhật: ${this.formatTime(data.timestamp)}</div>
            </div>

            <div class="realtime-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(data.current_pwr / data.threshold * 100)}%"></div>
                </div>
                <span class="progress-text">${((data.current_pwr / data.threshold) * 100).toFixed(0)}% của ngưỡng</span>
            </div>
        `;
    }

    formatTime(timestamp) {
        if (!timestamp) return '';

        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        } catch {
            return timestamp;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `<p>${message}</p>`;

        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 5000);
    }

    // Cleanup
    destroy() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
    }
}

// Initialize
let advancedSettings;
document.addEventListener('DOMContentLoaded', () => {
    advancedSettings = new AdvancedSettingsManager();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (advancedSettings) {
        advancedSettings.destroy();
    }
});
