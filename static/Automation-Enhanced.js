/**
 * Automation Dashboard V5.0 - REAL DATABASE CONNECTION
 */
class AutomationManagerV5 {
    constructor() {
        this.scenarios = [];
        this.init();
    }

    init() {
        console.log('🚀 AutomationManager V5.0 - Database Connected Edition');
        this.createUI();
        this.loadScenarios();
        // Lấy dữ liệu thực từ DB ngay khi load trang
        this.fetchRealDatabaseData(); 
    }

    createUI() {
        const html = `
            <div class="automation-container-v5">
                <div class="automation-stats-v5">
                    <div class="stat-mini">
                        <span class="stat-label">Kịch bản Hoạt động</span>
                        <span class="stat-value" id="active-count">0/0</span>
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
                    <div class="loading-state"><p>⏳ Đang tải kịch bản...</p></div>
                </div>

                <div class="ai-log-container" style="margin-top: 30px; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; margin-bottom: 15px;">
                        <h3 style="color: #f8fafc; font-size: 16px; margin: 0;">📜 Nhật ký Tối ưu hóa AI (Trực tiếp từ Database)</h3>
                    </div>
                    <div id="ai-action-log" style="max-height: 300px; overflow-y: auto; font-size: 13.5px;">
                        <div style="text-align: center; padding: 20px; color: #64748b;">Đang tải dữ liệu từ máy chủ...</div>
                    </div>
                </div>
            </div>
        `;
        const container = document.getElementById('automation-container');
        if (container) container.innerHTML = html;
    }

    loadScenarios() {
        fetch('/api/automation/scenarios', { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                this.scenarios = data.scenarios || [];
                this.renderScenarios();
                // Sau khi load xong kịch bản, gọi DB để tính Biến A + Biến B
                this.fetchRealDatabaseData(); 
            })
            .catch(err => console.error('❌ Lỗi tải kịch bản:', err));
    }

    renderScenarios() {
        const grid = document.getElementById('scenarios-grid');
        if (!grid || !this.scenarios.length) return;
        grid.innerHTML = this.scenarios.map((s, idx) => this.buildScenarioCard(s, idx)).join('');
        document.querySelectorAll('.toggle-switch-v5').forEach(t => t.addEventListener('change', e => this.toggleScenario(e)));
    }
buildScenarioCard(scenario, index) {
        const isEnabled = scenario.enabled;
        
        // 🚀 CẤU HÌNH ĐỊNH DANH ĐỘC QUYỀN: Nâng cấp mã màu chuẩn Neon
        let color = '#8b5cf6'; 
        let techIcon = '<i class="fas fa-microchip"></i>'; 
        
        if (scenario.type === 'lighting_saving') {
            color = '#fbbf24'; // Vàng Amber Neon
            techIcon = '<i class="fas fa-lightbulb" style="text-shadow: 0 0 15px rgba(251,191,36,0.9);"></i>'; 
        } else if (scenario.type === 'device_protection') {
            color = '#ef4444'; // Đỏ Danger Neon
            techIcon = '<i class="fas fa-server" style="text-shadow: 0 0 15px rgba(239,68,68,0.9);"></i>'; 
        } else if (scenario.type === 'building_optimization') {
            color = '#0ea5e9'; // Đổi sang Xanh Cyan (Sci-fi) cho hợp chất tương lai hơn
            techIcon = '<i class="fas fa-city" style="text-shadow: 0 0 15px rgba(14,165,233,0.9);"></i>'; 
        }

        // Cấu hình Badge Ưu tiên (Độ tương phản cao)
        const isHighPriority = scenario.priority === 'high';
        const badgeBg = isHighPriority ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.1)';
        const badgeColor = isHighPriority ? '#fca5a5' : '#7dd3fc';
        const badgeBorder = isHighPriority ? 'rgba(239, 68, 68, 0.4)' : 'rgba(56, 189, 248, 0.3)';
        const badgeIcon = isHighPriority ? '<i class="fas fa-bolt" style="margin-right: 4px;"></i>' : '<i class="fas fa-layer-group" style="margin-right: 4px;"></i>';
        const badgeText = isHighPriority ? 'ƯU TIÊN CAO' : 'BÌNH THƯỜNG';

        return `
            <div class="scenario-card-v5 ${isEnabled ? 'enabled' : 'disabled'}" data-id="${scenario.id}" 
                 style="display: flex; flex-direction: column; position: relative; overflow: hidden; padding: 22px; 
                        background-color: rgba(15, 23, 42, 0.7); 
                        background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 14px 14px;
                        backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
                        border: 1px solid ${isEnabled ? color + '50' : 'rgba(255,255,255,0.05)'}; 
                        border-radius: 16px; 
                        box-shadow: ${isEnabled ? `0 10px 30px -10px ${color}40, inset 0 0 20px rgba(255,255,255,0.02)` : '0 10px 30px rgba(0,0,0,0.3)'};
                        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                        transform: translateY(0);"
                 onmouseenter="this.style.transform='translateY(-6px)'; this.style.boxShadow='${isEnabled ? `0 15px 35px -10px ${color}60, inset 0 0 20px rgba(255,255,255,0.05)` : '0 15px 35px rgba(0,0,0,0.4)'}'; this.style.borderColor='${isEnabled ? color : 'rgba(255,255,255,0.1)'}';"
                 onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='${isEnabled ? `0 10px 30px -10px ${color}40, inset 0 0 20px rgba(255,255,255,0.02)` : '0 10px 30px rgba(0,0,0,0.3)'}'; this.style.borderColor='${isEnabled ? color + '50' : 'rgba(255,255,255,0.05)'}';">
                
                <div style="position: absolute; top: -50px; left: -50px; width: 140px; height: 140px; 
                            background: ${color}; filter: blur(60px); border-radius: 50%;
                            opacity: ${isEnabled ? '0.15' : '0.02'}; transition: opacity 0.5s; pointer-events: none;"></div>

                <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: ${color}; 
                            opacity: ${isEnabled ? '1' : '0.15'}; box-shadow: ${isEnabled ? `0 0 12px ${color}` : 'none'}; transition: 0.4s;"></div>

                <div class="card-content" style="display: flex; flex-direction: column; height: 100%; flex-grow: 1; position: relative; z-index: 1;">
                    
                    <div class="card-header" style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 18px;">
                        
                        <div style="display: flex; justify-content: center; align-items: center; width: 54px; height: 54px; flex-shrink: 0;
                                    background: ${isEnabled ? color + '15' : 'rgba(255,255,255,0.02)'};
                                    border: 1px solid ${isEnabled ? color + '50' : 'rgba(255,255,255,0.08)'};
                                    border-radius: 14px; color: ${isEnabled ? color : '#475569'}; font-size: 24px;
                                    box-shadow: ${isEnabled ? `inset 0 0 15px ${color}20, 0 0 15px ${color}30` : 'none'};
                                    transition: all 0.4s ease;">
                            ${techIcon}
                        </div>

                        <div class="header-text" style="flex-grow: 1; padding-top: 4px;">
                            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: ${isEnabled ? '#ffffff' : '#cbd5e1'}; letter-spacing: 0.5px; transition: 0.3s;">
                                ${scenario.name}
                            </h3>
                            <p style="margin: 0; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 6px; display: inline-block; letter-spacing: 0.8px;
                                      background: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder}; transition: 0.3s;">
                                ${badgeIcon} ${badgeText}
                            </p>
                        </div>
                    </div>
                    
                    <div class="card-description" style="flex-grow: 1; margin-bottom: 25px; padding-left: 14px; border-left: 2px solid ${isEnabled ? color + '80' : 'rgba(255,255,255,0.1)'}; transition: 0.4s;">
                        <p style="font-size: 13px; color: ${isEnabled ? '#94a3b8' : '#64748b'}; line-height: 1.6; margin: 0; transition: 0.3s;">${scenario.description}</p>
                    </div>
                    
                    <div class="card-footer" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 16px; margin-top: auto;">
                        
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 8px; height: 8px; border-radius: 50%; background: ${isEnabled ? color : '#475569'}; 
                                        box-shadow: ${isEnabled ? `0 0 8px ${color}, 0 0 16px ${color}` : 'none'}; transition: 0.4s;"></div>
                            <span style="font-size: 13px; font-weight: 700; color: ${isEnabled ? color : '#64748b'}; letter-spacing: 0.8px; transition: 0.3s;">
                                ${isEnabled ? 'ĐANG HOẠT ĐỘNG' : 'ĐÃ TẮT'}
                            </span>
                        </div>

                        <div style="position: relative; display: flex; align-items: center;">
                            <label style="position: relative; display: inline-block; width: 48px; height: 26px; margin: 0; cursor: pointer;">
                                <input type="checkbox" class="toggle-switch-v5" data-id="${scenario.id}" ${isEnabled ? 'checked' : ''} style="opacity: 0; width: 0; height: 0; position: absolute; z-index: -1;">
                                <span style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; 
                                             background-color: ${isEnabled ? color : '#1e293b'}; border-radius: 30px; transition: 0.4s cubic-bezier(0.4, 0.0, 0.2, 1); 
                                             border: 1px solid ${isEnabled ? 'transparent' : 'rgba(255,255,255,0.1)'};
                                             box-shadow: ${isEnabled ? `inset 0 2px 4px rgba(0,0,0,0.2), 0 0 12px ${color}60` : 'inset 0 2px 4px rgba(0,0,0,0.4)'};">
                                    <span style="position: absolute; height: 20px; width: 20px; left: ${isEnabled ? '25px' : '2px'}; bottom: ${isEnabled ? '3px' : '2px'}; 
                                                 background-color: ${isEnabled ? '#ffffff' : '#64748b'}; border-radius: 50%; transition: 0.4s cubic-bezier(0.4, 0.0, 0.2, 1); 
                                                 box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></span>
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    toggleScenario(event) {
        const toggle = event.target;
        const scenarioId = parseInt(toggle.dataset.id);
        const isEnabled = toggle.checked;

        fetch(`/api/automation/scenario/${scenarioId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled: isEnabled })
        }).then(() => {
            this.loadScenarios(); // Gọi load lại để cập nhật số đếm kịch bản
        }).catch(() => { toggle.checked = !isEnabled; });
    }

    // ======================================================================
    // 🚀 LÕI TRUY XUẤT DATABASE VÀ NHẢY SỐ (THAY THẾ HOÀN TOÀN BỘ CŨ)
    // ======================================================================
    fetchRealDatabaseData() {
        console.log("⚡ Đang móc dữ liệu từ SQLite Database...");
        
        // Gọi API có sẵn trong app.py của sếp (Dòng 621)
        fetch('/api/ai/optimization-history?limit=50', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    this.renderDatabaseLogs(data.data);
                    this.updateDatabaseStats(data.stats);
                }
            })
            .catch(e => console.error("❌ Lỗi lấy DB:", e));
    }

    renderDatabaseLogs(historyArray) {
        const logContainer = document.getElementById('ai-action-log');
        if (!logContainer) return;

        if (!historyArray || historyArray.length === 0) {
            logContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #64748b;">Hệ thống đang giám sát. Chưa có hành động...</div>';
            return;
        }

        // Vẽ HTML dựa trên dữ liệu lấy từ DB
        const html = historyArray.map(log => {
            // Xử lý chuỗi thời gian từ DB
            const timeObj = new Date(log.timestamp);
            const timeStr = timeObj.toLocaleTimeString('vi-VN');
            const dateStr = timeObj.toLocaleDateString('vi-VN');
            
            return `
                <div style="display: flex; gap: 15px; padding: 12px 0; border-bottom: 1px dashed rgba(255,255,255,0.05);">
                    <div style="color: #38bdf8; font-family: monospace;">[${dateStr} ${timeStr}]</div>
                    <div style="flex: 1; color: #cbd5e1;"><strong>${log.room_name}</strong> - ${log.reason}</div>
                    <div style="color: #10b981; font-weight: bold; background: rgba(16, 185, 129, 0.1); padding: 2px 8px; border-radius: 4px;">
                        Cứu: -${parseFloat(log.energy_saved_kwh).toFixed(2)} kWh
                    </div>
                </div>
            `;
        }).join('');
        
        logContainer.innerHTML = html;
    }

    updateDatabaseStats(dbStats) {
        // BIẾN A: Số kịch bản đang bật
        const activeScenariosCount = this.scenarios.filter(scen => scen.enabled).length;
        const activeCountEl = document.getElementById('active-count');
        if (activeCountEl) activeCountEl.textContent = `${activeScenariosCount}/${this.scenarios.length}`;

        // BIẾN B: Số lần AI đã chạy thực tế trong Database (today_activations)
        const aiTriggersToday = dbStats.today_activations || 0;
        const totalActivations = activeScenariosCount + aiTriggersToday;

        // TIẾT KIỆM HÔM NAY: Lấy chính xác từ Database
        const totalSavedKwh = dbStats.today_saved_kwh || 0.0;
        const co2Reduced = dbStats.co2_saved_kg || 0.0;

        // CHẠY ANIMATION CẬP NHẬT GIAO DIỆN
        const triggersEl = document.getElementById('triggers-total');
        if (triggersEl) {
            const startVal = parseInt(triggersEl.innerText) || 0;
            if(startVal !== totalActivations) this.animateValue("triggers-total", startVal, totalActivations, 800, "");
        }
        
        const savedEl = document.getElementById('savings-today');
        if (savedEl) {
            const startVal = parseFloat(savedEl.innerText) || 0;
            if(startVal !== totalSavedKwh) this.animateValue("savings-today", startVal, totalSavedKwh, 1000, " kWh");
        }

        const co2El = document.getElementById('co2-saved');
        if (co2El) {
            const startVal = parseFloat(co2El.innerText.replace(/[^\d.-]/g, '')) || 0;
            if(startVal !== co2Reduced) this.animateValue("co2-saved", startVal, co2Reduced, 1000, " kg CO2", "↓ Giảm ");
        }
    }

    animateValue(id, start, end, duration, suffix = "", prefix = "") {
        const obj = document.getElementById(id);
        if (!obj) return;
        
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 4);
            const currentVal = start + (end - start) * easeOut;
            const displayVal = (end % 1 !== 0) ? currentVal.toFixed(2) : Math.floor(currentVal);
            
            obj.innerHTML = `${prefix}${displayVal}${suffix}`;
            obj.style.textShadow = `0 0 15px #10b981`;
            
            if (progress < 1) window.requestAnimationFrame(step);
            else {
                obj.style.textShadow = "none";
                obj.innerHTML = `${prefix}${end % 1 !== 0 ? end.toFixed(2) : end}${suffix}`;
            }
        };
        window.requestAnimationFrame(step);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { window.automationManagerV5 = new AutomationManagerV5(); });
} else {
    window.automationManagerV5 = new AutomationManagerV5();
}