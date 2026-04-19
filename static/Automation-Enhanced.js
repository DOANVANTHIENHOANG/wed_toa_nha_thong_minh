/**
 * Automation Dashboard V5.0 - Ultra Modern Professional Design
 * Features:
 * - 3 AI Scenarios with Glassmorphism cards
 * - Toggle switches with smooth animations
 * - Live energy savings tracking
 * - Color-coded status indicators
 * - Real-time monitoring
 */

class AutomationManagerV5 {
    constructor() {
        this.scenarios = [];
        this.activeScenarios = new Set();
        this.init();
    }

    init() {
        console.log('🚀 AutomationManager V5.0 - Enhanced Professional Edition');
        this.createUI();
        this.loadScenarios();
        this.startMonitoring();
    }

   createUI() {
        const html = `
            <div class="automation-container-v5">
                <div class="automation-header-v5">
                    <div class="header-content">
                        <h1>🤖 Trung tâm Tự động hóa Năng lượng</h1>
                        <p>Quản lý 3 Kịch bản AI Tối ưu hóa Năng lượng</p>
                    </div>
                </div>

                <div class="automation-stats-v5">
                    <div class="stat-mini">
                        <span class="stat-label">Kịch bản Hoạt động</span>
                        <span class="stat-value" id="active-count">3/3</span>
                    </div>
                    <div class="stat-mini highlight">
                        <span class="stat-label">Tiết kiệm Hôm nay</span>
                        <span class="stat-value" id="savings-today" style="color: #10b981;">0.0 kWh</span>
                        <span id="co2-saved" style="font-size: 12px; color: #34d399; font-weight: bold; margin-top: 5px; display: block;">↓ Giảm 0.00 kg CO2</span>
                    </div>
                    <div class="stat-mini">
                        <span class="stat-label">Kích hoạt AI Tổng cộng</span>
                        <span class="stat-value" id="triggers-total">0</span>
                    </div>
                </div>

                <div class="scenarios-grid-v5" id="scenarios-grid">
                    <div class="loading-state">
                        <p>⏳ Đang tải kịch bản...</p>
                    </div>
                </div>

                <div class="ai-log-container" style="margin-top: 30px; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; margin-bottom: 15px;">
                        <h3 style="color: #f8fafc; font-size: 16px; font-weight: 600; margin: 0; display: flex; align-items: center; gap: 8px;">
                            📜 Nhật ký Tối ưu hóa AI
                        </h3>
                        <span style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; border: 1px solid rgba(16, 185, 129, 0.3);">
                            Hoạt động 24/7
                        </span>
                    </div>
                    <div id="ai-action-log" style="max-height: 250px; overflow-y: auto; font-size: 13.5px; padding-right: 5px;">
                        <div style="text-align: center; padding: 20px; color: #64748b; font-style: italic;">
                            Hệ thống đang giám sát. Chưa có hành động cắt tải khẩn cấp nào...
                        </div>
                    </div>
                </div>

                <div class="automation-footer-v5" style="margin-top: 20px;">
                    <div class="status-info">
                        <i class="fas fa-check-circle"></i>
                        <span>Hệ thống giám sát 24/7 - Tất cả kịch bản đang hoạt động</span>
                    </div>
                </div>
            </div>
        `;

        const container = document.getElementById('automation-container');
        if (container) {
            container.innerHTML = html;
        }
    }
    loadScenarios() {
        fetch('/api/automation/scenarios', { credentials: 'include' })
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then(data => {
                this.scenarios = data.scenarios || [];
                this.renderScenarios();
                this.updateStats();
            })
            .catch(err => {
                console.error('❌ Load error:', err);
                const grid = document.getElementById('scenarios-grid');
                if (grid) {
                    grid.innerHTML = `<div class="error-state">❌ Lỗi tải: ${err.message}</div>`;
                }
            });
    }

    renderScenarios() {
        const grid = document.getElementById('scenarios-grid');
        if (!grid || !this.scenarios.length) return;

        grid.innerHTML = this.scenarios
            .map((scenario, idx) => this.buildScenarioCard(scenario, idx))
            .join('');

        // Attach event listeners
        document.querySelectorAll('.toggle-switch-v5').forEach(toggle => {
            toggle.addEventListener('change', (e) => this.toggleScenario(e));
        });
    }

    buildScenarioCard(scenario, index) {
        const isEnabled = scenario.enabled;
        const icon = this.getScenarioIcon(scenario.type);
        const color = this.getScenarioColor(scenario.type);
        
        return `
            <div class="scenario-card-v5 ${isEnabled ? 'enabled' : 'disabled'}" data-id="${scenario.id}">
                <!-- Card Background Gradient -->
                <div class="card-gradient" style="--color: ${color}"></div>

                <!-- Card Content -->
                <div class="card-content">
                    <!-- Icon & Title Area -->
                    <div class="card-header">
                        <div class="scenario-icon" style="--icon-color: ${color}">
                            ${icon}
                        </div>
                        <div class="header-text">
                            <h3>${scenario.name}</h3>
                            <p class="priority-badge" data-priority="${scenario.priority}">
                                ${scenario.priority === 'high' ? '🔥 Ưu tiên cao' : '⚙️ Bình thường'}
                            </p>
                        </div>
                    </div>

                    <!-- Description -->
                    <div class="card-description">
                        <p>${scenario.description}</p>
                    </div>

                    <!-- Metrics -->
                    <div class="card-metrics">
                        <div class="metric-item">
                            <span class="metric-label">Kích hoạt</span>
                            <span class="metric-value">${scenario.trigger_count || 0}x</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Trạng thái</span>
                            <span class="metric-status ${isEnabled ? 'active' : 'inactive'}">
                                ${isEnabled ? '✓ Hoạt động' : '✗ Tắt'}
                            </span>
                        </div>
                    </div>

                    <!-- Footer with Toggle -->
                    <div class="card-footer">
                        <div class="toggle-container">
                            <label class="toggle-switch-wrapper">
                                <input type="checkbox" class="toggle-switch-v5" data-id="${scenario.id}" ${isEnabled ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                            <span class="toggle-label">${isEnabled ? 'Đang bật' : 'Đang tắt'}</span>
                        </div>
                    </div>
                </div>

                <!-- Status Indicator Dot -->
                <div class="status-dot" style="--status-color: ${isEnabled ? '#10b981' : '#6b7280'}"></div>
            </div>
        `;
    }

    getScenarioIcon(type) {
        const icons = {
            'lighting_saving': '<i class="fas fa-lightbulb"></i>',
            'device_protection': '<i class="fas fa-shield-alt"></i>',
            'building_optimization': '<i class="fas fa-building"></i>'
        };
        return icons[type] || '<i class="fas fa-cog"></i>';
    }

    getScenarioColor(type) {
        const colors = {
            'lighting_saving': '#fbbf24',      // Amber
            'device_protection': '#ef4444',    // Red
            'building_optimization': '#3b82f6' // Blue
        };
        return colors[type] || '#8b5cf6';
    }

    toggleScenario(event) {
        const toggle = event.target;
        const scenarioId = parseInt(toggle.dataset.id);
        const isEnabled = toggle.checked;

        fetch(`/api/automation/scenario/${scenarioId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ enabled: isEnabled })
        })
            .then(r => r.json())
            .then(data => {
                console.log(`✓ Scenario ${scenarioId} toggled to ${isEnabled}`);
                this.loadScenarios();
            })
            .catch(err => {
                console.error('Toggle error:', err);
                toggle.checked = !isEnabled;
            });
    }

   updateStats() {
        const enabled = this.scenarios.filter(s => s.enabled).length;
        const total = this.scenarios.length;

        // Cập nhật số Kịch bản
        const activeCountEl = document.getElementById('active-count');
        if (activeCountEl) activeCountEl.textContent = `${enabled}/${total}`;

        // 🔥 LẤY SỐ LIỆU THẬT TỪ HỆ THỐNG GHI LOG CỦA SPRINT 5
        let totalActivations = parseInt(localStorage.getItem('ai_activations')) || 0;
        let totalSavedKwh = parseFloat(localStorage.getItem('ai_saved_kwh')) || 0;
        let co2Reduced = totalSavedKwh * 0.4; // Công thức 1 kWh = 0.4 kg CO2

        // Cập nhật số Kích hoạt
        const triggersEl = document.getElementById('triggers-total');
        if (triggersEl) triggersEl.textContent = totalActivations;
        
        // Cập nhật số Tiết kiệm điện
        const savedEl = document.getElementById('savings-today');
        if (savedEl) savedEl.textContent = `${totalSavedKwh.toFixed(1)} kWh`;

        // Cập nhật đồng hồ CO2
        const co2El = document.getElementById('co2-saved');
        if (co2El) co2El.textContent = `↓ Giảm ${co2Reduced.toFixed(2)} kg CO2`;
    
    }
    startMonitoring() {
        // Tự động quét số liệu mỗi 5 giây để cập nhật Giao diện
        setInterval(() => {
            if (typeof this.updateStats === 'function') {
                this.updateStats();
            }
        }, 5000);
    }
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.automationManagerV5 = new AutomationManagerV5();
    });
} else {
    // DOM is already loaded
    window.automationManagerV5 = new AutomationManagerV5();
}
