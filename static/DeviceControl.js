/**
 * Smart Energy V2.1 - DeviceControl.js
 * Clean, DOM-based filtering implementation with Database integration
 * Load Status Colors: #9ca3af (Chờ), #00aa77 (Bình thường), #ffb020 (Cao), #ff6b35 (Tới hạn)
 *
 * Logic:
 * - OFF: power = 0, load = "Chờ", button = "Chờ xử lý"
 * - ON: enable random power, recalculate load based on power:
 *   - power > 4kW: load = "Tới hạn" (Đỏ), button = "Cảnh báo"
 *   - power < 4kW: load = "Bình thường" (Xanh) or "Cao" (Vàng), button = "Xử lý"
 */

// ========== DEVICE DATABASE ==========
const deviceDatabase = {
    devices: {},
    // Track intervals for random power generation per device
    powerIntervals: {},
    isLoadedFromDB: false,

    // Load devices from database via API
    async loadFromAPI() {
        try {
            console.log('🔄 Loading devices from API...');

            const response = await fetch('/api/devices', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + (sessionStorage.getItem('token') || '')
                }
            });

            console.log('📡 API Response status:', response.status);

            if (response.ok) {
                const devicesList = await response.json();
                console.log('📦 Received devices:', devicesList.length);

                if (!devicesList || devicesList.length === 0) {
                    console.log("⚠️ Không có dữ liệu từ API");
                    console.error('❌ API returned empty device list!');
                    // Không return false ở đây nữa để nó rớt xuống xài đồ local
                } else {
                    if (!this.devices) this.devices = {};
                    
                   devicesList.forEach(dev => {
                        let currentDevice = this.devices[dev.id];
                        
                        // � FIXED: Removed isOptimized guard to allow database updates
                        // Always load fresh data from database, even for optimized devices

                        // Kỷ luật thép: Nếu Tắt (OFF) thì ép công suất về 0 và trạng thái về Chờ
                        const isON = dev.power_status === 'ON';
                        // ... (các dòng code cũ của ông ở bên dưới)
                        const actualPower = isON ? (parseFloat(dev.current_power) || 0) : 0;
                        
                        this.devices[dev.id] = {
                            id: dev.id,
                            name: dev.room_name || `Phòng ${dev.id}`,
                            floor: dev.floor || 1,
                            location: `Tầng ${dev.floor || 1}`,
                            code: dev.room_code || 'Unknown',
                            power: actualPower,
                            status: isON,
                            load_status: isON ? this.calculateLoadStatus(actualPower) : { level: 'idle', label: 'Chờ', color: '#9ca3af' },
                            last_updated: dev.last_updated || new Date().toISOString()
                        };
                    });

                    this.isLoadedFromDB = true;
                    console.log(`✓ Loaded ${Object.keys(this.devices).length} devices from database`);
                    return true; // Load API thành công thì kết thúc ở đây
                }
            } else {
                // Tui đã khôi phục lại cái else này cho ông (chỉ bỏ return false thôi)
                console.error('❌ API returned error:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('❌ Failed to load devices from API:', error);
        }
        
        // ✨ Đoạn code này đã SÁNG LÊN rực rỡ và chạy hoàn hảo!
        console.log('⚠️ Using local device initialization (API unavailable)');
        if (typeof this.initDevices === 'function') {
            this.initDevices();
        }
        return false;
    },

    initDevices() {
        for (let floor = 1; floor <= 5; floor++) {
            for (let room = 1; room <= 5; room++) {
                const roomCode = `P${floor}0${room}`;
                this.devices[roomCode] = {
                    id: roomCode,
                    name: `Phòng ${floor}0${room}`,
                    floor: floor,
                    location: `Tầng ${floor}`,
                    code: `CB-L${floor}-${room}`,
                    power: Math.random() * 6,
                    status: Math.random() > 0.3,
                    load_status: this.calculateLoadStatus(Math.random() * 6),
                    last_updated: new Date().toISOString()
                };
            }
        }
        console.log(`✓ Initialized ${Object.keys(this.devices).length} devices locally`);
    },

    calculateLoadStatus(power) {
        if (power < 0.1) return { level: 'idle', label: 'Chờ', color: '#9ca3af' };
        if (power < 5.0) return { level: 'normal', label: 'Bình thường', color: '#00aa77' };
        if (power <= 8.0) return { level: 'high', label: 'Cao', color: '#ffb020' };
        return { level: 'critical', label: 'Tới hạn', color: '#ff6b35' };
    },

    getDevice(id) {
        return this.devices[id];
    },

    // Start random power generation for a device (only when ON)
    startPowerRandom(deviceId) {
        // Clear existing interval if any
        this.stopPowerRandom(deviceId);

        const device = this.devices[deviceId];
        if (!device || !device.status) return;

        // Generate random power between 0.5 and 6 kW
        const generatePower = () => {
          device.power = 1.0 + Math.random() * 11.0; // Random từ 1.0kW đến 12.0kW
            device.load_status = this.calculateLoadStatus(device.power);
            device.last_updated = new Date().toISOString();

            // Update UI immediately after power change
            if (typeof deviceUI !== 'undefined') {
                deviceUI.updateDeviceUI(deviceId, device.status);
            }
        };

        // Generate initial power
        generatePower();

        // Update every 3 seconds
        this.powerIntervals[deviceId] = setInterval(generatePower, 30000);
        console.log(`⚡ Started power random for device: ${deviceId}`);
    },

    // Stop random power generation for a device (when OFF)
    stopPowerRandom(deviceId) {
        if (this.powerIntervals[deviceId]) {
            clearInterval(this.powerIntervals[deviceId]);
            delete this.powerIntervals[deviceId];
            console.log(`⏹️ Stopped power random for device: ${deviceId}`);
        }
    },

    updateDevice(id, updates) {
        const device = this.devices[id];
        if (device) {
            Object.assign(device, updates);
            if (updates.power !== undefined) {
                device.load_status = this.calculateLoadStatus(device.power);
            }
            device.last_updated = new Date().toISOString();
            return true;
        }
        return false;
    },

    // Toggle device with proper OFF/ON handling and Database sync
    async toggleDevice(id) {
        const device = this.devices[id];
        if (device) {
            device.status = !device.status;

            if (!device.status) {
                // OFF: Force power to 0, load to "Chờ", stop random power
                device.power = 0;
                device.load_status = { level: 'idle', label: 'Chờ', color: '#9ca3af' };
                this.stopPowerRandom(id);

                // Save to database
                await this.saveToDatabase(id, 'OFF', 0);
            } else {
                // ON: Start random power generation, recalculate load
                // Generate initial random power
                device.power = 0.5 + Math.random() * 5.5;
                device.load_status = this.calculateLoadStatus(device.power);
                this.startPowerRandom(id);

                // Save to database
                await this.saveToDatabase(id, 'ON', device.power);
            }

            device.last_updated = new Date().toISOString();
            return device;
        }
        return null;
    },

    // Save device state to database via API
    async saveToDatabase(deviceId, powerStatus, currentPower) {
        try {
            const response = await fetch(`/api/device/${deviceId}/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    power_status: powerStatus,
                    current_power: currentPower
                })
            });

            if (response.ok) {
                console.log(`💾 Saved to database: ${deviceId} -> ${powerStatus}, ${currentPower}kW`);
            } else {
                console.warn('⚠️ Failed to save to database');
            }
        } catch (error) {
            console.error('Error saving to database:', error);
        }
    },

    getAllDevices() {
        return Object.values(this.devices);
    },

    // Stop all power intervals (cleanup)
    stopAllPowerIntervals() {
        Object.keys(this.powerIntervals).forEach(deviceId => {
            this.stopPowerRandom(deviceId);
        });
    }
};

// ========== DEVICE UI MODULE ==========
const deviceUI = {
    filterState: { floors: [], statuses: [] },

    // 🔴 MAIN FILTER FUNCTION - EXACT STRING MATCHING FROM TABLE
    applyFilters() {
        const rows = document.querySelectorAll('#devices-tbody tr');
        let visibleCount = 0;

        rows.forEach(row => {
            if (row.children.length < 7) return; // Skip message rows

            // EXACT STRING MATCHING: Read actual text from table cells
            const location = row.cells[1].textContent.trim(); // "Tầng X"
            const loadLevelText = row.cells[5].textContent.trim().toLowerCase(); // Read actual Mức tải label

            // Check floor filter with exact matching
            let matchFloor = this.filterState.floors.length === 0;
            if (this.filterState.floors.length > 0) {
                matchFloor = this.filterState.floors.some(f => location.includes(`Tầng ${f}`));
            }

            // Check status filter with EXACT STRING MATCHING
            let matchStatus = this.filterState.statuses.length === 0;
            if (this.filterState.statuses.length > 0) {
                matchStatus = this.filterState.statuses.some(statusFilter => {
                    return loadLevelText === statusFilter;
                });
            }

            const shouldShow = matchFloor && matchStatus;
            row.style.display = shouldShow ? 'table-row' : 'none';
            if (shouldShow) visibleCount++;
        });

        if (visibleCount === 0) {
            const tbody = document.getElementById('devices-tbody');
            const messageRow = tbody.querySelector('tr[style*="colspan"]');
            if (!messageRow) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 40px;">Không có thiết bị phù hợp với bộ lọc</td></tr>';
            }
        }
    },

    renderTable() {
        const tbody = document.getElementById('devices-tbody');
        if (!tbody) {
            console.error('❌ devices-tbody not found');
            return;
        }

        tbody.innerHTML = '';
        const allDevices = deviceDatabase.getAllDevices();

        console.log('🔍 renderTable: got', allDevices.length, 'devices');

        if (allDevices.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 40px;">⚠️ Chưa có dữ liệu từ Database. Vui lòng đăng nhập hoặc tải lại trang.</td></tr>';
            return;
        }

                        console.log("Render:", allDevices[0]);
                        allDevices.forEach(device => {
            const row = document.createElement('tr');
            row.setAttribute('data-device-id', device.id);

            row.innerHTML = this.buildDeviceRowHTML(device);
            tbody.appendChild(row);

            // Re-attach event listeners for newly created row
            this.attachRowEventListeners(row);

            // Start power random if device is ON
            if (device.status) {
                deviceDatabase.startPowerRandom(device.id);
            }
        });

        this.attachEventListeners();
        // FIX: Reset filters to show ALL by default - no pre-selected filters
        this.filterState.floors = [];
        this.filterState.statuses = [];
        this.updateFilterUI();
        this.applyFilters();
    },

    // Build HTML for a device row - centralized for consistent rendering
    buildDeviceRowHTML(device) {
        const toggleBg = device.status ? '#10b981' : '#9ca3af';
        const toggleText = device.status ? '🟢 Bật' : '🔴 Tắt';
        const rgb = this.hexToRgb(device.load_status.color);

        // Determine action button text based on load status
        let actionBtnText = '🔧 Xử lý';
        let actionBtnColor = 'var(--primary)';

        // Calculate load status based on power if not already set
    const loadInfo = deviceDatabase.calculateLoadStatus(device.power);

        if (!device.status || device.power === 0) {
            actionBtnText = '⏳ Chờ xử lý';
            actionBtnColor = '#6b7280';
        } else if (loadInfo.level === 'critical') {
            actionBtnText = '⚠️ Cảnh báo';
            actionBtnColor = '#ff6b35';
        } else if (loadInfo.level === 'high') {
            actionBtnText = '🔧 Xử lý';
            actionBtnColor = '#f59e0b';
        }

        // Update device load_status with calculated value
        device.load_status = loadInfo;

        return `
            <td style="font-weight: 600; color: #f1f5f9;">
                <span style="display: inline-block; width: 12px; height: 12px; background: ${device.load_status.color}; border-radius: 50%; margin-right: 10px; box-shadow: 0 0 8px ${device.load_status.color};"></span>
                ${device.name}
            </td>
            <td style="color: #cbd5e1;">${device.location}</td>
            <td style="color: var(--primary); font-family: monospace; font-weight: 600;">${device.code}</td>
            <td style="color: #f1f5f9; font-weight: 600;">${device.power.toFixed(2)} kW</td>
            <td>
                <button class="btn-toggle" data-device-id="${device.id}" style="padding: 8px 14px; background: ${toggleBg}; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px;">
                    ${toggleText}
                </button>
            </td>
            <td>
                <span style="display: inline-block; padding: 6px 12px; background: ${device.load_status.color}; color: white; border-radius: 6px; font-weight: 600; font-size: 12px; box-shadow: 0 0 12px rgba(${rgb}, 0.4);">
                    ${device.load_status.label}
                </span>
            </td>
            <td>
                <button class="btn-action" data-device-id="${device.id}" style="padding: 8px 14px; background: ${actionBtnColor}; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px;">
                    ${actionBtnText}
                </button>
            </td>
        `;
    },

    // ========== CENTRALIZED DEVICE UI UPDATE FUNCTION ==========
    // This is the main function that syncs all fields for a device
    // Used by both toggle button and power interval
    updateDeviceUI(deviceId, status) {
        const device = deviceDatabase.getDevice(deviceId);
        if (!device) {
            console.error('❌ Device not found:', deviceId);
            return;
        }

        const row = document.querySelector(`tr[data-device-id="${deviceId}"]`);
        if (!row) {
            console.warn('⚠️ Row not found for device:', deviceId);
            return;
        }

        // Update row using centralized HTML builder
        row.innerHTML = this.buildDeviceRowHTML(device);

        // Re-attach event listeners after replacing HTML
        this.attachRowEventListeners(row);

        // Re-apply filters (in case status changed affects filter)
        this.applyFilters();
    },

    // Attach event listeners to toggle and action buttons
    attachEventListeners() {
        document.querySelectorAll('.btn-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const deviceId = e.target.getAttribute('data-device-id');
                this.handleToggleDevice(deviceId);
            });
        });

        document.querySelectorAll('.btn-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const deviceId = e.target.getAttribute('data-device-id');
                this.handleActionButton(deviceId);
            });
        });
    },

    // Attach event listeners for a specific row (after update)
    attachRowEventListeners(row) {
        const toggleBtn = row.querySelector('.btn-toggle');
        const actionBtn = row.querySelector('.btn-action');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                const deviceId = e.target.getAttribute('data-device-id');
                this.handleToggleDevice(deviceId);
            });
        }

        if (actionBtn) {
            actionBtn.addEventListener('click', (e) => {
                const deviceId = e.target.getAttribute('data-device-id');
                this.handleActionButton(deviceId);
            });
        }
    },

    // ========== TOGGLE DEVICE HANDLER ==========
    async handleToggleDevice(deviceId) {
        const device = deviceDatabase.getDevice(deviceId);
        if (!device) {
            console.error('❌ Device not found:', deviceId);
            return;
        }

        const currentStatus = device.status ? 'ON' : 'OFF';
        const newAction = currentStatus === 'ON' ? 'OFF' : 'ON';

        console.log(`🔄 Sending ${newAction} command for device: ${deviceId}`);

        try {
            const response = await fetch('/update_status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    device_id: deviceId,
                    action: newAction
                })
            });

            const result = await response.json();

            if (result.success) {
                // Update device in local database
                const updatedDevice = {
                    ...device,
                    status: newAction === 'ON',
                    power: result.current_power,
                    // 🔥 TUYỆT CHIÊU: Lấy luôn load_status do Python đóng gói gửi về, không cần tính lại!
                    load_status: result.load_status 
                };

                deviceDatabase.devices[deviceId] = updatedDevice;

                // Update only this row in UI
                this.updateDeviceUI(deviceId, updatedDevice.status);

                const statusText = newAction === 'ON' ? 'Bật' : 'Tắt';
                this.showNotification(`${device.name}: ${statusText}`, 'info');

                console.log(`✅ Device toggled: ${deviceId} -> ${statusText}`, {
                    power: result.current_power,
                    load_status: result.load_status
                });
            } else {
                this.showNotification('❌ Lỗi từ server: ' + (result.message || 'Không xác định'), 'error');
            }
        } catch (error) {
            // Tui in ra lỗi thật sự ở đây để lỡ có lỗi mình biết ngay thằng nào làm!
            console.error('❌ Bắt được lỗi code JS (Không phải do mạng):', error);
            this.showNotification('❌ Lỗi xử lý giao diện', 'error');
        }
    }, 
    // ========== ACTION BUTTON HANDLER ==========
    handleActionButton(deviceId) {
        const device = deviceDatabase.getDevice(deviceId);
        if (!device) return;

        // Only show modal for critical load when device is ON
        if (device.status && device.load_status.level === 'critical') {
            this.showCriticalAlertModal(device);
        } else if (!device.status) {
            this.showNotification('⏳ Thiết bị đang ở chế độ nghỉ', 'info');
        } else {
            this.showNotification('🔧 Thiết bị hoạt động bình thường', 'info');
        }
    },

    renderFilters() {
        const floorContainer = document.getElementById('floor-filters');
        const statusContainer = document.getElementById('status-filters');
        if (!floorContainer || !statusContainer || floorContainer.dataset.initialized) return;

        // Floor filters
        const allFloorBtn = document.createElement('button');
        allFloorBtn.textContent = '[Tất cả]';
        allFloorBtn.style.cssText = `padding: 8px 14px; background: var(--primary); color: white; border: 1px solid var(--primary-light); border-radius: 20px; cursor: pointer; font-weight: 600; font-size: 12px; transition: all 0.3s;`;
        allFloorBtn.onclick = (e) => { e.preventDefault(); this.filterState.floors = []; this.updateFilterUI(); this.applyFilters(); };
        floorContainer.appendChild(allFloorBtn);

        for (let f = 1; f <= 5; f++) {
            const btn = document.createElement('button');
            btn.textContent = `[Tầng ${f}]`;
            btn.setAttribute('data-floor', f);
            btn.style.cssText = `padding: 8px 14px; background: rgba(56, 189, 248, 0.1); color: var(--primary); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 20px; cursor: pointer; font-weight: 600; font-size: 12px; transition: all 0.3s;`;
            btn.onclick = (e) => {
                e.preventDefault();
                const idx = this.filterState.floors.indexOf(f);
                if (idx > -1) this.filterState.floors.splice(idx, 1);
                else this.filterState.floors.push(f);
                this.updateFilterUI();
                this.applyFilters();
            };
            floorContainer.appendChild(btn);
        }

        // Status filters
        const allStatusBtn = document.createElement('button');
        allStatusBtn.textContent = '[Tất cả]';
        allStatusBtn.style.cssText = `padding: 8px 14px; background: var(--primary); color: white; border: 1px solid var(--primary-light); border-radius: 20px; cursor: pointer; font-weight: 600; font-size: 12px; transition: all 0.3s;`;
        allStatusBtn.onclick = (e) => { e.preventDefault(); this.filterState.statuses = []; this.updateFilterUI(); this.applyFilters(); };
        statusContainer.appendChild(allStatusBtn);

        const statuses = [
            { level: 'idle', label: 'Chờ', labelLower: 'chờ', color: '#9ca3af' },
            { level: 'normal', label: 'Bình thường', labelLower: 'bình thường', color: '#00aa77' },
            { level: 'high', label: 'Cao', labelLower: 'cao', color: '#ffb020' },
            { level: 'critical', label: 'Tới hạn', labelLower: 'tới hạn', color: '#ff6b35' }
        ];

        statuses.forEach(status => {
            const btn = document.createElement('button');
            btn.textContent = `[${status.label}]`;
            btn.setAttribute('data-status', status.labelLower);
            const rgb = this.hexToRgb(status.color);
            btn.style.cssText = `padding: 8px 14px; background: rgba(${rgb}, 0.1); color: ${status.color}; border: 1px solid rgba(${rgb}, 0.3); border-radius: 20px; cursor: pointer; font-weight: 600; font-size: 12px; transition: all 0.3s;`;
            btn.onclick = (e) => {
                e.preventDefault();
                const idx = this.filterState.statuses.indexOf(status.labelLower);
                if (idx > -1) this.filterState.statuses.splice(idx, 1);
                else this.filterState.statuses.push(status.labelLower);
                this.updateFilterUI();
                this.applyFilters();
            };
            statusContainer.appendChild(btn);
        });

        floorContainer.dataset.initialized = 'true';
    },

    updateFilterUI() {
        document.querySelectorAll('#floor-filters button').forEach((btn, idx) => {
            const floor = btn.getAttribute('data-floor');
            const isAll = !floor;
            const isActive = isAll ? this.filterState.floors.length === 0 : this.filterState.floors.includes(parseInt(floor));
            btn.style.background = isActive ? 'var(--primary)' : 'rgba(56, 189, 248, 0.1)';
            btn.style.color = isActive ? 'white' : 'var(--primary)';
            btn.style.borderColor = isActive ? 'var(--primary-light)' : 'rgba(56, 189, 248, 0.3)';
        });

        const statusColors = { 'chờ': '#9ca3af', 'bình thường': '#00aa77', 'cao': '#ffb020', 'tới hạn': '#ff6b35' };
        document.querySelectorAll('#status-filters button').forEach(btn => {
            const statusLabel = btn.getAttribute('data-status');
            const isAll = !statusLabel;
            const isActive = isAll ? this.filterState.statuses.length === 0 : this.filterState.statuses.includes(statusLabel);
            if (isAll) {
                btn.style.background = isActive ? 'var(--primary)' : 'rgba(56, 189, 248, 0.1)';
                btn.style.color = isActive ? 'white' : 'var(--primary)';
                btn.style.borderColor = isActive ? 'var(--primary-light)' : 'rgba(56, 189, 248, 0.3)';
            } else {
                const color = statusColors[statusLabel];
                const rgb = this.hexToRgb(color);
                btn.style.background = isActive ? color : `rgba(${rgb}, 0.1)`;
                btn.style.color = isActive ? 'white' : color;
                btn.style.borderColor = isActive ? color : `rgba(${rgb}, 0.3)`;
            }
        });
    },
   hexToRgb(hex) {
        if (!hex) return '128, 128, 128'; 
        try {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `${r}, ${g}, ${b}`;
        } catch (e) {
            return '128, 128, 128';
        }
    },
    showCriticalAlertModal(device) {
        const modalId = 'critical-alert-modal-' + device.id;
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 5000;`;
        modal.innerHTML = `
            <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%); border: 2px solid #ff6b35; border-radius: 16px; padding: 40px; max-width: 500px; width: 90%; color: #f1f5f9; box-shadow: 0 0 30px rgba(255, 107, 53, 0.3);">
                <div style="text-align: center; margin-bottom: 25px;">
                    <div style="font-size: 50px; margin-bottom: 15px;">⚠️</div>
                    <h2 style="margin: 0 0 10px 0; color: #ff6b35; font-size: 26px;">CẢNH BÁO TỚI HẠN</h2>
                    <p style="margin: 0; color: #94a3b8; font-size: 14px;">Thiết bị đang tiêu thụ quá mức công suất</p>
                </div>
                <div style="background: rgba(255, 107, 53, 0.1); border-left: 3px solid #ff6b35; padding: 15px; margin: 20px 0; border-radius: 6px;">
                    <p style="margin: 8px 0;"><strong>Phòng:</strong> ${device.name}</p>
                    <p style="margin: 8px 0;"><strong>Tầng:</strong> ${device.location}</p>
                    <p style="margin: 8px 0;"><strong>Mã thiết bị:</strong> <code style="color: var(--primary);">${device.code}</code></p>
                    <p style="margin: 8px 0;"><strong>Công suất:</strong> <span style="color: #ff6b35; font-weight: 600;">${device.power.toFixed(2)} kW</span></p>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 25px;">
                    <button onclick="document.getElementById('${modalId}').remove()" style="flex: 1; padding: 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: white; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        ✓ Đóng
                    </button>
                    <button onclick="deviceUI.openGeminiForDevice('${device.id}'); document.getElementById('${modalId}').remove()" style="flex: 1; padding: 12px; background: var(--primary); border: none; color: white; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        🤖 Hỏi Gemini
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    openGeminiForDevice(deviceId) {
        const device = deviceDatabase.getDevice(deviceId);
        if (!device) {
            console.error('❌ Device not found for Gemini:', deviceId);
            this.showNotification('❌ Không tìm thấy thiết bị', 'error');
            return;
        }

        console.log(`🔄 Opening Gemini for device: ${deviceId}`, device);
        window.currentAlertDevice = device;

        const geminiNav = document.querySelector('[data-tab="ai"]');
        if (geminiNav) {
            console.log('🤖 Clicking Gemini tab to trigger analysis...');
            geminiNav.click();
        } else {
            console.error('❌ Gemini tab not found');
            this.showNotification('❌ Tab Gemini không tìm thấy', 'error');
        }
    },

    applyAIFix(deviceId) {
        const device = deviceDatabase.getDevice(deviceId);
        if (!device) {
            console.error('❌ Device not found:', deviceId);
            this.showNotification('❌ Không tìm thấy thiết bị', 'error');
            return false;
        }

        console.log(`⚡ Applying AI fix for device: ${deviceId}`, device);

        this.showNotification(
            `🔧 Đang thực hiện cấu hình lại dòng điện cho ${device.name}...`,
            'info'
        );

       const oldPower = device.power;
        const oldStatus = device.load_status.level;

        if (oldStatus === 'critical') {
            device.power = Math.max(device.power * 0.5, 0.5);
        } else if (oldStatus === 'high') {
            device.power = Math.max(device.power * 0.7, 0.8);
        }

        // 🔥 TÍNH SỐ ĐIỆN CỨU ĐƯỢC ĐỂ TRUYỀN ĐI
        const savedPower = oldPower - device.power; 

        device.load_status = deviceDatabase.calculateLoadStatus(device.power);
        device.last_updated = new Date().toISOString();

        // Save to database
        deviceDatabase.saveToDatabase(deviceId, device.status ? 'ON' : 'OFF', device.power);

        console.log(`✅ Device updated:`, {
            old_power: oldPower,
            new_power: device.power,
            old_status: oldStatus,
            new_status: device.load_status.level
        });

        // Use centralized update function
        this.updateDeviceUI(deviceId, device.status);

        setTimeout(() => {
            this.showNotification(
                `✅ ${device.name} đã được cấu hình thành công! Cứu được ${savedPower.toFixed(2)} kWh`,
                'success'
            );
            
            // 🚀 BẮN SỰ KIỆN TOÀN CỤC BÁO CHO BÊN TỰ ĐỘNG HÓA BIẾT (TUYỆT CHIÊU Ở ĐÂY NÈ SẾP)
            document.dispatchEvent(new CustomEvent('AI_Optimized_Success', { 
                detail: { 
                    deviceName: device.name, 
                    savedPower: savedPower, 
                    time: new Date(),
                    oldStatusValue: oldPower,
                    newStatusValue: device.power
                } 
            }));

        }, 500);

        setTimeout(() => {
            const devTab = document.querySelector('[data-tab="devices"]');
            if (devTab) {
                console.log('🔄 Navigating back to Devices tab...');
                devTab.click();
            }
        }, 1000);

        return true;
    },

    showNotification(msg, type = 'info') {
        const notif = document.createElement('div');
        const bgColor = type === 'success' ? '#10b981' :
                       type === 'error' ? '#ef4444' :
                       type === 'info' ? '#3b82f6' : '#f59e0b';
        const icon = type === 'success' ? '✅' :
                    type === 'error' ? '❌' :
                    type === 'info' ? '🔧' : '⚠️';

        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${bgColor};
            color: white;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            font-size: 14px;
            animation: device-toast-in 0.3s ease-out;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            word-wrap: break-word;
        `;
        notif.textContent = msg;
        document.body.appendChild(notif);

        if (!document.getElementById('device-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'device-notification-styles';
            style.textContent = `
                @keyframes device-toast-in {
                    from { transform: translateX(400px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes device-toast-out {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(400px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => {
            notif.style.animation = 'device-toast-out 0.3s ease-out forwards';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }
};

// ========== INITIALIZATION ==========
async function loadDevices() {
    console.log('🚀 Loading devices...');

    // Try to load from database first
    await deviceDatabase.loadFromAPI();

    deviceUI.renderFilters();
    deviceUI.renderTable();
    console.log('✓ Device loading complete');
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    deviceDatabase.stopAllPowerIntervals();
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadDevices);
} else {
    loadDevices();
}


window.deviceUI = deviceUI;
window.deviceDatabase = deviceDatabase;