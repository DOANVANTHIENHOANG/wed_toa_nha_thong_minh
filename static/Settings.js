/**
 * SED V2.1 - Settings.js
 * Cài đặt nâng cao hệ thống với real-time monitoring (BẢN ĐỘC QUYỀN VIP 100% DYNAMIC)
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
        // Hỗ trợ cả 2 tên ID (cũ và mới) của nút Lưu
        const applyBtn = document.getElementById('btn-apply-settings') || document.getElementById('btn-save');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => this.applySettings());
        }

        const resetBtn = document.getElementById('btn-reset-settings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetToDefaults());
        }

        const clearAlertsBtn = document.getElementById('btn-clear-alerts');
        if (clearAlertsBtn) {
            clearAlertsBtn.addEventListener('click', () => this.clearAllAlerts());
        }

        const thresholdSlider = document.getElementById('threshold-slider');
        if (thresholdSlider) {
            thresholdSlider.addEventListener('input', (e) => this.updateThresholdDisplay(e.target.value));
        }
        // Xử lý làm mờ ô nhập giá khi bật EVN
        const evnToggle = document.getElementById('evn-mode');
        if (evnToggle) {
            evnToggle.addEventListener('change', (e) => {
                const staticPriceInput = document.getElementById('static-price') || document.getElementById('price-per-kwh-input');
                if (staticPriceInput) {
                    staticPriceInput.disabled = e.target.checked;
                    staticPriceInput.style.opacity = e.target.checked ? '0.4' : '1';
                    staticPriceInput.style.cursor = e.target.checked ? 'not-allowed' : 'text';
                }
            });
        }
    }

    async loadSettings() {
        try {
            const response = await fetch('/api/settings');
            const data = await response.json();

            this.settings = data;
            window.systemSettings = data; // Đồng bộ lên RAM toàn hệ thống

            // Hàm tự động điền dữ liệu (có giáp chống lỗi)
            const setVal = (id, val) => { if(document.getElementById(id)) document.getElementById(id).value = val; };
            const setCheck = (id, val) => { if(document.getElementById(id)) document.getElementById(id).checked = val; };

            // 🚀 BƠM DỮ LIỆU CHO 6 TÍNH NĂNG MỚI
            setVal('alert-slider', data.threshold || 15.0);
            setVal('cut-slider', data.cut_threshold || 5.4);
            setVal('static-price', data.price_per_kwh || 3500);
            setVal('target-kwh', data.target_kwh || 500);
            setCheck('evn-mode', data.evn_mode || false);
            // Khóa ô giá tĩnh nếu EVN đang bật
            const staticPriceInput = document.getElementById('static-price') || document.getElementById('price-per-kwh-input');
            if (staticPriceInput) {
                const isEvn = data.evn_mode === true || data.evn_mode === 'true';
                staticPriceInput.disabled = isEvn;
                staticPriceInput.style.opacity = isEvn ? '0.4' : '1';
                staticPriceInput.style.cursor = isEvn ? 'not-allowed' : 'text';
            }
            setCheck('eco-mode', data.eco_mode || true);

            // Giữ lại hỗ trợ cho các ID cũ lỡ web của sếp còn dùng
            setVal('threshold-input', data.threshold || 15.0);
            setVal('price-per-kwh-input', data.price_per_kwh || 3500);
            setVal('schedule-off-input', data.schedule_off || '22:00');

            if (document.getElementById('threshold-slider')) {
                document.getElementById('threshold-slider').value = data.threshold || 15.0;
                document.getElementById('threshold-slider').max = 200.0; // Nâng max lên 200 cho xịn
                this.updateThresholdDisplay(data.threshold || 15.0);
            }

            console.log('✅ Cấu hình đã được tải từ Lõi:', data);
        } catch (error) {
            console.error('❌ Error loading settings:', error);
            this.showNotification('Lỗi khi tải cài đặt', 'error');
        }
    }

    // 🚀 HÀM QUAN TRỌNG NHẤT: BẮN FULL DỮ LIỆU XUỐNG PYTHON
    async applySettings() {
        try {
            // Hàm lấy dữ liệu (Hỗ trợ quét cả ID cũ và ID mới)
            const getVal = (id, def) => document.getElementById(id) ? document.getElementById(id).value : def;
            const getCheck = (id, def) => document.getElementById(id) ? document.getElementById(id).checked : def;

            // GOM 6 TRƯỜNG VIP
            const threshold = parseFloat(getVal('alert-slider', getVal('threshold-input', 15.0)));
            const cut_threshold = parseFloat(getVal('cut-slider', 5.4));
            const target_kwh = parseInt(getVal('target-kwh', 500));
            const price = parseInt(getVal('static-price', getVal('price-per-kwh-input', 3500)));
            const evn_mode = getCheck('evn-mode', false);
            const eco_mode = getCheck('eco-mode', true);
            const scheduleOff = getVal('schedule-off-input', '22:00');

            const payload = {
                threshold: threshold,
                cut_threshold: cut_threshold,
                target_kwh: target_kwh,
                price_per_kwh: price,
                evn_mode: evn_mode,
                eco_mode: eco_mode,
                schedule_off: scheduleOff
            };

            const applyBtn = document.getElementById('btn-apply-settings') || document.getElementById('btn-save');
            if (applyBtn) {
                applyBtn.disabled = true;
                applyBtn.textContent = '⏳ Đang đồng bộ...';
            }

            const response = await fetch('/api/settings/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            // Cập nhật lại vào RAM 
            this.settings = payload;
            window.systemSettings = payload;

            this.showNotification(`✅ Cài đặt Động đã được lưu vào Lõi!`, 'success');

            if (applyBtn) {
                applyBtn.disabled = false;
                applyBtn.textContent = '💾 Lưu cấu hình hệ thống';
            }

            await this.loadAlerts();

        } catch (error) {
            console.error('❌ Error applying settings:', error);
            this.showNotification('Lỗi khi lưu cài đặt', 'error');
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
        } catch (error) { console.error('Error loading alerts:', error); }
    }

    displayAlerts() {
        const alertContainer = document.getElementById('alerts-container');
        if (!alertContainer) return;

        if (this.alerts.length === 0) {
            alertContainer.innerHTML = `
                <div class="empty-state">
                    <p>✅ Không có cảnh báo nào</p>
                </div>`;
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
                            ✅ Xác nhận
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
        if (display) display.textContent = `${value} kW`;

        const indicator = document.getElementById('threshold-indicator');
        if (indicator) {
            indicator.style.width = `${(value / 200) * 100}%`;
            indicator.style.backgroundColor = value > 150 ? '#ff6b6b' : value > 100 ? '#ffa726' : '#66bb6a';
        }
    }

    resetToDefaults() {
        if (!confirm('Đặt lại tất cả cài đặt về mặc định?')) return;
        const setVal = (id, val) => { if(document.getElementById(id)) document.getElementById(id).value = val; };
        const setCheck = (id, val) => { if(document.getElementById(id)) document.getElementById(id).checked = val; };

        setVal('alert-slider', 15.0);
        setVal('cut-slider', 5.4);
        setVal('static-price', 3500);
        setVal('target-kwh', 500);
        setCheck('evn-mode', false);
        setCheck('eco-mode', true);
        
        this.applySettings();
    }

    async resolveAlert(alertId) {
        try {
            const response = await fetch(`/api/realtime/alerts/${alertId}/resolve`, { method: 'POST' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this.showNotification('✅ Cảnh báo đã được xác nhận', 'success');
            await this.loadAlerts();
        } catch (error) { this.showNotification('Lỗi khi xác nhận cảnh báo', 'error'); }
    }

    async clearAllAlerts() {
        if (!confirm('Xóa toàn bộ cảnh báo?')) return;
        try {
            const response = await fetch('/api/alerts/clear', { method: 'POST' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this.alerts = [];
            this.displayAlerts();
            this.showNotification('✅ Tất cả cảnh báo đã được xóa', 'success');
        } catch (error) { this.showNotification('Lỗi khi xóa cảnh báo', 'error'); }
    }

    startRealTimeMonitoring() {
        if (this.isMonitoring) return;
        this.isMonitoring = true;
        this.monitoringInterval = setInterval(async () => {
            try {
                const response = await fetch('/api/realtime/current');
                const data = await response.json();
                if (data.success) {
                    this.updateRealtimeDisplay(data);
                    await this.loadAlerts();
                }
            } catch (error) { console.error('Error in real-time monitoring:', error); }
        }, 30000);
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
                <div class="stat-info">${data.alert ? `🔴 VƯỢT NGƯỠNG (${data.threshold} kW)` : `✅ Bình thường`}</div>
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
        try { return new Date(timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }); } 
        catch { return timestamp; }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `<p>${message}</p>`;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    destroy() { if (this.monitoringInterval) clearInterval(this.monitoringInterval); }
}

let advancedSettings;
document.addEventListener('DOMContentLoaded', () => { advancedSettings = new AdvancedSettingsManager(); });
window.addEventListener('beforeunload', () => { if (advancedSettings) advancedSettings.destroy(); });