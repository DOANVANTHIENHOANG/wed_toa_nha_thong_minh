/**
 * Automation Dashboard V4.0 - Modern Professional Design
 * Clean card-based interface with Glassmorphism
 * - Elegant scenario cards with icons, titles, descriptions
 * - Professional toggle switches on right side
 * - Energy savings metrics and status indicators
 * - Smooth hover effects and animations
 * - Dark mode with subtle, professional colors
 */

class AutomationManager {
    constructor() {
        this.scenarios = [];
        this.activeScenarios = [];
        this.statusPolling = null;
        this.scenarioStats = {};
        this.init();
    }

    init() {
        console.log('✨ AutomationManager V4.0 - Modern Professional Dashboard');
        this.createUI();
        this.loadScenarios();
        this.startMonitoring();
    }

    /**
     * Create the main dashboard UI structure
     */
    createUI() {
        const html = `
            <div class="automation-dashboard-v4">
                <!-- Header -->
                <div class="dashboard-header-v4">
                    <h1>🤖 Trung tâm Tự động hóa</h1>
                    <p>Quản lý các kịch bản năng lượng thông minh</p>
                </div>

                <!-- Quick Stats Section -->
                <div class="stats-container-v4">
                    <div class="stat-card-v4">
                        <div class="stat-number" id="total-scenarios">0</div>
                        <div class="stat-label">Tổng kịch bản</div>
                    </div>
                    <div class="stat-card-v4">
                        <div class="stat-number" id="enabled-scenarios">0</div>
                        <div class="stat-label">Đang hoạt động</div>
                    </div>
                    <div class="stat-card-v4">
                        <div class="stat-number" id="total-triggers">0</div>
                        <div class="stat-label">Hôm nay kích hoạt</div>
                    </div>
                    <div class="stat-card-v4 highlight">
                        <div class="stat-number" id="total-savings">0</div>
                        <div class="stat-label">Tiết kiệm (kWh)</div>
                    </div>
                </div>

                <!-- Main Scenarios Grid -->
                <div class="scenarios-container-v4">
                    <div class="container-header-v4">
                        <h2>📊 Kịch bản tự động hóa</h2>
                        <button class="btn-add-scenario-v4" onclick="if(window.automationManager) window.automationManager.showAddModal()">
                            + Thêm kịch bản
                        </button>
                    </div>
                    <div id="scenarios-grid" class="scenarios-grid-v4">
                        <div class="loading-v4">
                            <p>⏳ Đang tải kịch bản...</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal Overlay (Hidden by default) -->
            <div id="modal-overlay" class="modal-overlay-v4"></div>
        `;

        const container = document.getElementById('automation-container');
        if (container) {
            container.innerHTML = html;
        }
    }

    /**
     * Load scenarios from backend API
     */
    loadScenarios() {
        const grid = document.getElementById('scenarios-grid');
        if (!grid) return;

        fetch('/api/automation/scenarios', { credentials: 'include' })
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then(data => {
                this.scenarios = data.scenarios || [];
                this.renderScenarios();
                this.updateStats(data);
                console.log(`✅ Loaded ${this.scenarios.length} scenarios`);
            })
            .catch(err => {
                console.error('❌ Load error:', err);
                grid.innerHTML = `<div class="error-v4">❌ Lỗi: ${err.message}</div>`;
            });
    }

    /**
     * Render all scenario cards in grid
     */
    renderScenarios() {
        const grid = document.getElementById('scenarios-grid');
        if (!grid) return;

        if (this.scenarios.length === 0) {
            grid.innerHTML = '<div class="empty-v4">📭 Chưa có kịch bản</div>';
            return;
        }

        try {
            grid.innerHTML = this.scenarios.map(s => this.buildScenarioCard(s)).join('');
        } catch (err) {
            console.error('❌ Render error:', err);
            grid.innerHTML = `<div class="error-v4">❌ Lỗi render: ${err.message}</div>`;
        }
    }

    /**
     * Build a single scenario card
     */
    buildScenarioCard(scenario) {
        const isActive = this.activeScenarios.some(s => s.id === scenario.id);
        const savings = this.scenarioStats[scenario.id]?.savings || 0;
        const triggers = scenario.trigger_count || 0;
        const lastTriggered = scenario.last_triggered ? this.formatTime(scenario.last_triggered) : 'Chưa';

        return `
            <div class="scenario-card-v4 ${isActive ? 'active' : ''} ${!scenario.enabled ? 'disabled' : ''}">
                <!-- Left: Icon & Info -->
                <div class="card-left">
                    <div class="card-icon">${this.getIcon(scenario.type)}</div>
                    <div class="card-info">
                        <h3>${scenario.name}</h3>
                        <p>${this.getDescription(scenario)}</p>
                    </div>
                </div>
                <!-- Right: Toggle Switch -->
                <div class="card-right">
                    <label class="switch-v4">
                        <input type="checkbox" ${scenario.enabled ? 'checked' : ''} 
                               onchange="if(window.automationManager) window.automationManager.toggleScenario(${scenario.id})">
                        <span class="slider-v4"></span>
                    </label>
                </div>

                <!-- Status Badge -->
                <div class="card-status">
                    <span class="badge ${isActive ? 'badge-active' : 'badge-wait'}">
                        ${isActive ? '🔥 Hoạt động' : '⏸️ Chờ'}
                    </span>
                </div>

                <!-- Bottom: Stats & Actions -->
                <div class="card-footer">
                    <div class="footer-left">
                        <div class="stat-line">
                            <span class="stat-icon">💾</span>
                            <span class="stat-text">Tiết kiệm: <strong>${savings.toFixed(1)} kWh</strong></span>
                        </div>
                        <div class="stat-line">
                            <span class="stat-icon">🕐</span>
                            <span class="stat-text">Lần cuối: <strong>${lastTriggered}</strong></span>
                        </div>
                    </div>
                    <div class="footer-right">
                        <button class="btn-icon-v4" onclick="if(window.automationManager) window.automationManager.deleteScenario(${scenario.id})" title="Xóa">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get emoji icon for scenario type
     */
    getIcon(type) {
        const icons = {
            'lighting_saving': '💡',
            'device_protection': '🛡️',
            'building_optimization': '🏢',
            'hvac_optimization': '❄️',
            'peak_hour': '⚡',
            'custom': '⚙️'
        };
        return icons[type] || '🔧';
    }

    /**
     * Get description text for scenario
     */
    getDescription(scenario) {
        const descriptions = {
            'lighting_saving': 'Tối ưu chiếu sáng dựa trên ánh sáng tự nhiên',
            'device_protection': 'Bảo vệ thiết bị khỏi quá tải',
            'building_optimization': 'Tối ưu hóa năng lượng cho toàn tòa nhà',
            'hvac_optimization': 'Điều chỉnh nhiệt độ thông minh',
            'peak_hour': 'Giảm tải giờ cao điểm',
            'custom': 'Kịch bản tuỳ chỉnh'
        };
        return descriptions[scenario.type] || 'Kịch bản tự động hóa';
    }

    /**
     * Format time to relative format (e.g., "5p trước")
     */
    formatTime(isoString) {
        try {
            const date = new Date(isoString);
            const now = new Date();
            const diffMinutes = Math.floor((now - date) / 60000);

            if (diffMinutes < 1) return 'Vừa xong';
            if (diffMinutes < 60) return `${diffMinutes}p`;
            if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
            return date.toLocaleDateString('vi');
        } catch (e) {
            return '—';
        }
    }

    /**
     * Update stat cards at top
     */
    updateStats(data) {
        try {
            const total = document.getElementById('total-scenarios');
            const enabled = document.getElementById('enabled-scenarios');
            const triggers = document.getElementById('total-triggers');
            const savings = document.getElementById('total-savings');

            if (total) total.textContent = data.total_scenarios || 0;
            if (enabled) enabled.textContent = data.total_enabled || 0;
            if (triggers) triggers.textContent = data.total_triggers || 0;
            if (savings) {
                const sum = Object.values(this.scenarioStats).reduce((s, v) => s + (v.savings || 0), 0);
                savings.textContent = sum.toFixed(1);
            }
        } catch (err) {
            console.error('❌ Stats update error:', err);
        }
    }

    /**
     * Toggle scenario on/off
     */
    toggleScenario(id) {
        const scenario = this.scenarios.find(s => s.id === id);
        if (!scenario) return;

        scenario.enabled = !scenario.enabled;

        fetch(`/api/automation/scenario/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ enabled: scenario.enabled })
        })
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then(() => {
                console.log(`✅ Scenario toggled`);
                this.renderScenarios();
            })
            .catch(err => {
                console.error('❌ Toggle error:', err);
                scenario.enabled = !scenario.enabled;
                this.renderScenarios();
            });
    }

    /**
     * Delete scenario
     */
    deleteScenario(id) {
        if (!confirm('⚠️ Xóa kịch bản này?')) return;

        fetch(`/api/automation/scenario/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        })
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then(() => {
                console.log('✅ Scenario deleted');
                this.loadScenarios();
            })
            .catch(err => {
                console.error('❌ Delete error:', err);
                alert('❌ Lỗi: ' + err.message);
            });
    }

    /**
     * Show add scenario modal
     */
    showAddModal() {
        const overlay = document.getElementById('modal-overlay');
        if (!overlay) return;

        const modal = document.createElement('div');
        modal.className = 'modal-dialog-v4';
        modal.innerHTML = `
            <div class="modal-content-v4">
                <div class="modal-header-v4">
                    <h2>✨ Thêm kịch bản AI</h2>
                    <button class="btn-close-v4" onclick="if(window.automationManager) window.automationManager.closeModal()">✕</button>
                </div>
                <div class="modal-body-v4">
                    <p>Chức năng này sẽ được cập nhật sớm 🚀</p>
                    <p style="font-size: 13px; color: #cbd5e1; margin-top: 15px;">Hiện tại bạn có 3 kịch bản mặc định.</p>
                </div>
                <div class="modal-footer-v4">
                    <button class="btn-secondary-v4" onclick="if(window.automationManager) window.automationManager.closeModal()">Đóng</button>
                </div>
            </div>
        `;

        overlay.appendChild(modal);
        overlay.style.display = 'flex';
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeModal();
        });
    }

    /**
     * Close modal
     */
    closeModal() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.innerHTML = '';
            overlay.style.display = 'none';
        }
    }

    /**
     * Start monitoring - real-time status updates
     */
    startMonitoring() {
        if (this.statusPolling) clearInterval(this.statusPolling);

        this.statusPolling = setInterval(() => {
            fetch('/api/automation/status', { credentials: 'include' })
                .then(r => r.json())
                .then(data => {
                    this.activeScenarios = data.active_scenarios || [];
                    this.scenarioStats = data.scenario_stats || {};
                    this.renderScenarios();
                    this.updateStats(data);
                })
                .catch(err => console.error('❌ Status update error:', err));
        }, 5000);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            window.automationManager = new AutomationManager();
            console.log('✅ AutomationManager initialized');
        } catch (err) {
            console.error('❌ Initialization error:', err);
        }
    });
} else {
    try {
        window.automationManager = new AutomationManager();
        console.log('✅ AutomationManager initialized');
    } catch (err) {
        console.error('❌ Initialization error:', err);
    }
}
