/**
 * Smart Energy V2.1 - GeminiAnalysis.js - ENHANCED V6 (FIXED HISTORY BUG)
 *
 * UPGRADES:
 * - Scanning effect with orange progress bar (1.5s)
 * - Dynamic kW data from Dashboard
 * - Risk prediction: random 70-90% when critical
 * - Energy savings calculation
 * - Two buttons: "Tối ưu năng lượng" and "Ngắt khẩn cấp"
 * - "Cre: Thiên Hoàng" at bottom of report
 */

// ========== GLOBAL STATE ==========
window.currentAlertDevice = null;
window.geminiInitialized = false;

// 🚀 HÀM MỚI: Tự động tìm khung chat thật (tránh bị lỗi tàng hình)
function getChatContainer() {
    return document.getElementById('real-chat-history') || document.getElementById('ai-response');
}

// ========== TAB OBSERVER ==========
function attachGeminiTabListener() {
    const geminiNavItem = document.querySelector('[data-tab="ai"]');
    if (!geminiNavItem) {
        setTimeout(attachGeminiTabListener, 100);
        return;
    }

    geminiNavItem.addEventListener('click', function(e) {
        console.log('🔄 Gemini tab clicked, initializing...');
        setTimeout(() => {
            initGeminiChat();
        }, 100);
    });
    console.log('✅ Gemini tab event listener attached');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachGeminiTabListener);
} else {
    attachGeminiTabListener();
}

// ========== MAIN AUTO-INIT FUNCTION ==========
function initGeminiChat() {
    console.log('📱 initGeminiChat() - currentAlertDevice:', window.currentAlertDevice);

    // 🚀 DÙNG HÀM TÌM ID MỚI
    const responseDiv = getChatContainer();
    if (!responseDiv) {
        console.error('❌ ai-response/real-chat-history div not found');
        return;
    }

    if (window.currentAlertDevice && window.currentAlertDevice.id) {
        const device = window.currentAlertDevice;
        console.log('✅ Processing alert for:', device.name);

        // 🚀 ẨN GỢI Ý NẾU CÓ BÁO ĐỘNG KHẨN CẤP
        const suggestions = document.getElementById('gemini-suggestions');
        if (suggestions) suggestions.style.display = 'none';

        responseDiv.innerHTML = '';
        showScanningEffect(device);

        setTimeout(() => {
            generateDynamicAnalysis(device);
            window.geminiInitialized = true;
            // Cập nhật bộ nhớ RAM nếu có
            if (typeof window.permanentChatData !== 'undefined') window.permanentChatData = responseDiv.innerHTML;
        }, 1500);

        // 🚀 XÓA TRẠNG THÁI BÁO ĐỘNG ĐỂ KHÔNG BỊ LẶP LẠI KHI CHUYỂN TAB
        window.currentAlertDevice = null;
    } else {
        // 🚀 FIX LỖI XÓA CHAT: CHỈ IN RA LỜI CHÀO NẾU KHUNG CHAT ĐANG TRỐNG
        if (responseDiv.innerHTML.trim() === '' || responseDiv.innerHTML.includes('Đang chờ dữ liệu')) {
            responseDiv.innerHTML = `
                <div style="padding: 40px; text-align: center; color: #94a3b8;">
                    <p style="font-size: 16px; margin: 0;">🤖 Sẵn sàng phân tích ...</p>
                </div>
            `;
        }
    }
}

// ========== SCANNING EFFECT (1.5s Orange Progress Bar) ==========
function showScanningEffect(device) {
    const responseDiv = getChatContainer();
    responseDiv.innerHTML = `
        <div style="padding: 50px 30px; text-align: center;">
            <div style="font-size: 60px; margin-bottom: 25px;">🔍</div>
            <h3 style="color: #f1f5f9; margin: 0 0 20px 0; font-size: 22px; font-weight: 700;">
                Đang phân tích dữ liệu hệ thống...
            </h3>
            <p style="color: #cbd5e1; margin: 0 0 30px 0; font-size: 14px;">
                Thiết bị: <strong style="color: #ff6b35;">${device.name}</strong> |
                Công suất: <strong>${device.power ? device.power.toFixed(2) : '0.00'} kW</strong>
            </p>

            <div style="width: 100%; height: 8px; background: rgba(255, 107, 53, 0.15); border-radius: 4px; overflow: hidden; margin-bottom: 20px;">
                <div id="gemini-progress" style="width: 0%; height: 100%; background: linear-gradient(90deg, #ff6b35, #ffb020, #ff6b35); border-radius: 4px; transition: width 0.1s linear;"></div>
            </div>

            <div style="display: flex; justify-content: space-between; color: #94a3b8; font-size: 12px;">
                <span>🔌 Kết nối DB</span>
                <span>📊 Phân tích</span>
                <span>🎯 Dự báo</span>
                <span>✅ Hoàn tất</span>
            </div>

            <p style="color: #64748b; margin: 25px 0 0 0; font-size: 12px;">
                Vui lòng chờ trong giây lát...
            </p>
        </div>

        <script>
            (function() {
                const progressBar = document.getElementById('gemini-progress');
                let width = 0;
                const interval = setInterval(function() {
                    width += 3;
                    if (width > 100) width = 100;
                    progressBar.style.width = width + '%';
                    if (width >= 100) {
                        clearInterval(interval);
                    }
                }, 45); // 1500ms / 33 steps ≈ 45ms
            })();
        </script>
    `;
}

// ========== DYNAMIC ANALYSIS WITH 6 FEATURES ==========
function generateDynamicAnalysis(device) {
    const responseDiv = getChatContainer();
    console.log('📊 Generating dynamic analysis for:', device.name);

    const power = device.power || 0;
    const floorNum = device.floor || (device.location ? parseInt(device.location.replace('Tầng ', '')) : 1);

    // ===== FEATURE 1: Dynamic kW-based text =====
    let dynamicAdvice = '';
    let statusEmoji = '✅';
    let statusColor = '#10b981';
    let statusLabel = 'Bình thường';

    if (power === 0) {
        dynamicAdvice = 'Thiết bị đang tắt. Bật để bắt đầu giám sát công suất.';
        statusEmoji = '⏳';
        statusColor = '#9ca3af';
        statusLabel = 'Chờ';
    } else if (power < 2.0) {
        dynamicAdvice = '🎉 Tuyệt vời! Công suất rất thấp, hệ thống hoạt động hiệu quả cao.';
        statusEmoji = '✅';
        statusColor = '#10b981';
        statusLabel = 'Bình thường';
    } else if (power < 3.0) {
        dynamicAdvice = '👍 Tốt. Công suất ở mức chấp nhận được. Tiếp tục theo dõi.';
        statusEmoji = '👍';
        statusColor = '#10b981';
        statusLabel = 'Bình thường';
    } else if (power < 4.0) {
        dynamicAdvice = '⚠️ Cảnh báo! Công suất cao, cần giảm tải để tránh quá tải.';
        statusEmoji = '⚠️';
        statusColor = '#f59e0b';
        statusLabel = 'Cao';
    } else {
        dynamicAdvice = '🚨 NGUY HIỂM! Công suất vượt ngưỡng an toàn. Nguy cơ cháy nổ cao!';
        statusEmoji = '🚨';
        statusColor = '#ff6b35';
        statusLabel = 'Tới hạn';
    }

    // ===== FEATURE 2: Risk Prediction (70-90% when critical) =====
    let riskPercentage = 0;
    if (power === 0) {
        riskPercentage = 5;
    } else if (power < 2.0) {
        riskPercentage = 10 + (power / 2.0) * 10; // 10-20%
    } else if (power < 4.0) {
        riskPercentage = 30 + (power - 2.0) * 20; // 30-70%
    } else {
        // Critical: random 70-90%
        riskPercentage = Math.floor(70 + Math.random() * 21); // 70-90
    }

    // ===== FEATURE 3: Energy Savings Calculation =====
    const pricePerKWh = 2500; // VND
    const threshold = 4.0; // kW
    let excessPower = 0;
    let savingsPerHour = 0;
    let savingsPerDay = 0;

    if (power > threshold) {
        excessPower = power - threshold;
        savingsPerHour = excessPower * pricePerKWh;
        savingsPerDay = savingsPerHour * 24;
    }

    const savingsHTML = power > threshold ? `
        <div style="margin: 15px 0; padding: 12px; background: rgba(16, 185, 129, 0.12); border-left: 3px solid #10b981; border-radius: 6px;">
            <div style="font-size: 12px; color: #94a3b8; margin-bottom: 6px;">💰 TIẾT KIỆM DỰ KIẾN</div>
            <div style="font-size: 14px; color: #10b981; font-weight: 600;">
                ${savingsPerHour.toLocaleString('vi-VN')}đ/giờ |
                ${savingsPerDay.toLocaleString('vi-VN')}đ/ngày
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                (Giảm ${excessPower.toFixed(2)}kW xuống ngưỡng ${threshold}kW)
            </div>
        </div>
    ` : `
        <div style="margin: 15px 0; padding: 12px; background: rgba(56, 189, 248, 0.08); border-left: 3px solid #38bdf8; border-radius: 6px;">
            <div style="font-size: 12px; color: #94a3b8; margin-bottom: 6px;">💰 TIẾT KIỆM DỰ KIẾN</div>
            <div style="font-size: 14px; color: #38bdf8; font-weight: 600;">
                ✓ Thiết bị trong ngưỡng an toàn
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                Không cần giảm tải
            </div>
        </div>
    `;

    // ===== Build Complete HTML =====
    const html = `
        <div style="
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%);
            border: 2px solid ${statusColor};
            border-radius: 16px;
            padding: 25px;
            color: #f1f5f9;
            box-shadow: 0 0 40px rgba(${hexToRgb(statusColor)}, 0.25);
        ">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <div style="font-size: 50px;">${statusEmoji}</div>
                <div style="flex: 1;">
                    <h3 style="margin: 0; color: ${statusColor}; font-size: 22px; font-weight: 700;">
                        Báo cáo cho Phòng ${device.name.replace('Phòng ', '')} - Tầng ${floorNum}
                    </h3>
                    <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 13px;">
                        <span style="color: ${statusColor}; font-weight: 600;">Mã:</span> ${device.code} |
                        <span style="color: ${statusColor}; font-weight: 600;">Công suất:</span> <span style="font-size: 18px; font-weight: 700;">${power.toFixed(2)} kW</span> |
                        <span style="color: ${statusColor}; font-weight: 600;">Mức:</span> ${statusLabel}
                    </p>
                </div>
            </div>

            <div style="margin: 0 0 20px 0; padding: 16px; background: rgba(${hexToRgb(statusColor)}, 0.1); border-left: 4px solid ${statusColor}; border-radius: 8px;">
                <h4 style="margin: 0 0 10px 0; color: ${statusColor}; font-size: 15px;">📊 Phân tích công suất</h4>
                <p style="margin: 0; color: #e2e8f0; font-size: 14px; line-height: 1.7;">
                    ${dynamicAdvice}
                </p>
            </div>

            <div style="margin: 0 0 15px 0; padding: 16px; background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; border-radius: 8px;">
                <h4 style="margin: 0 0 10px 0; color: #ef4444; font-size: 15px;">🎯 Dự báo rủi ro</h4>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="font-size: 32px; font-weight: 700; color: #ef4444;">${riskPercentage}%</div>
                    <div style="flex: 1;">
                        <div style="color: #cbd5e1; font-size: 13px;">nguy cơ nhảy CB</div>
                        <div style="color: #94a3b8; font-size: 11px; margin-top: 4px;">
                            ${power > 4.0 ? '⚠️ Cần ngắt khẩn cấp!' : '✓ Trong ngưỡng an toàn'}
                        </div>
                    </div>
                </div>
            </div>

            ${savingsHTML}

            <div style="margin: 15px 0; padding: 16px; background: rgba(56, 189, 248, 0.08); border-left: 4px solid #38bdf8; border-radius: 8px;">
                <h4 style="margin: 0 0 10px 0; color: #38bdf8; font-size: 15px;">💡 Khuyến nghị</h4>
                <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 13px; line-height: 1.8;">
                    ${power > 4.0 ? `
                        <li style="color: #ef4444;">Ngắt thiết bị công suất cao ngay lập tức</li>
                        <li>Giảm 50% tải điện</li>
                        <li>Kiểm tra mạch điện</li>
                    ` : power > 2.0 ? `
                        <li>Tắt các thiết bị không cần thiết</li>
                        <li>Cân bằng tải sang giờ thấp điểm</li>
                        <li>Theo dõi sát công suất</li>
                    ` : `
                        <li>Tiếp tục giám sát bình thường</li>
                        <li>Không cần can thiệp</li>
                    `}
                </ul>
            </div>

           <div style="margin-top: 20px; display: flex; gap: 12px;">
                <button onclick="closeGeminiTab()" style="
                    flex: 1; padding: 14px; background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: #cbd5e1; border-radius: 8px; cursor: pointer;
                    font-weight: 600; font-size: 14px;
                ">
                    ❌ Đóng
                </button>
                
                ${power > 2.0 ? `
                <button class="btn-optimize" onclick="optimizeEnergy('${device.id}')" style="
                    flex: 1; padding: 14px; background: linear-gradient(135deg, #10b981, #059669);
                    border: none; color: white; border-radius: 8px;
                    cursor: pointer; font-weight: 600; font-size: 14px;
                    box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
                ">
                    ⚡ Tối ưu năng lượng
                </button>
                
                <button class="btn-emergency" onclick="emergencyShutdown('${device.id}')" style="
                    flex: 1; padding: 14px; background: linear-gradient(135deg, #ef4444, #dc2626);
                    border: none; color: white; border-radius: 8px;
                    cursor: pointer; font-weight: 600; font-size: 14px;
                    box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
                ">
                    🛑 Ngắt khẩn cấp
                </button>
                ` : `
                <button onclick="showToast('✅ Thiết bị hoạt động bình thường', 'success')" style="
                    flex: 1; padding: 14px; background: #10b981;
                    border: none; color: white; border-radius: 8px;
                    cursor: default; font-weight: 600; font-size: 14px;
                ">
                    ✓ Hoạt động tốt
                </button>
                `}
            </div>

            <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.08); text-align: center;">
                <p style="margin: 0; color: rgba(255,255,255,0.35); font-size: 11px; font-weight: 300; letter-spacing: 0.5px;">
                    Cre: Thiên Hoàng
                </p>
            </div>
        </div>
    `;

    responseDiv.innerHTML = html;
}

// ========== ACTION FUNCTIONS ==========

// Optimize Energy
async function optimizeEnergy(deviceId) {
    const device = deviceDatabase ? deviceDatabase.getDevice(deviceId) : window.currentAlertDevice;
    if (!device) {
        showToast('❌ Không tìm thấy thiết bị', 'error');
        return;
    }

    const oldStatus = device.load_status ? device.load_status.label : 'Không xác định';
    const oldPower = device.power;

    showToast(`🔧 Cấu hình lại dòng điện cho ${device.name}...`, 'info');

    if (device.power > 4.0) {
        device.power = 0.5;
    } else if (device.power > 2.0) {
        device.power = 0.5;
    }

    device.load_status = deviceDatabase.calculateLoadStatus(device.power);
    const newStatus = device.load_status ? device.load_status.label : 'Bình thường';

    if (deviceDatabase && deviceDatabase.saveToDatabase) {
        deviceDatabase.saveToDatabase(deviceId, device.status ? 'ON' : 'OFF', device.power);
    }

    try {
        const res = await fetch(`/api/device/${deviceId}/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                power_status: device.status ? 'ON' : 'OFF',
                current_power: device.power
            })
        });
        const data = await res.json();
        console.log("API Response:", data);
    } catch (err) {
        console.error("Lỗi API:", err);
    }

    if (typeof deviceUI !== 'undefined' && deviceUI.updateDeviceUI) {
        deviceUI.updateDeviceUI(deviceId, device.status);
    }

    setTimeout(() => {
        const responseDiv = getChatContainer();
        if (responseDiv) {
            responseDiv.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%);
                    border: 2px solid #10b981;
                    border-radius: 16px;
                    padding: 40px;
                    text-align: center;
                    color: #f1f5f9;
                    box-shadow: 0 0 40px rgba(16, 185, 129, 0.3);
                    animation: success-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                ">
                    <div style="font-size: 80px; margin-bottom: 20px; animation: checkmark-bounce 1s ease-out;">✅</div>
                    <h2 style="margin: 0 0 15px 0; color: #10b981; font-size: 32px; font-weight: 700;">FIX THÀNH CÔNG</h2>
                    <p style="margin: 0 0 25px 0; color: #cbd5e1; font-size: 18px; line-height: 1.6;">
                        ${device.name} đã được cấu hình.
                    </p>
                    
                    <div style="
                        background: rgba(16, 185, 129, 0.15);
                        border: 1px solid #10b981;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                    ">
                        <div style="display: flex; justify-content: space-around; align-items: center;">
                            <div style="text-align: center;">
                                <div style="font-size: 12px; color: #94a3b8; margin-bottom: 8px;">Trạng thái cũ</div>
                                <div style="font-size: 24px; font-weight: 700; color: #ef4444;">${oldStatus}</div>
                            </div>
                            <div style="font-size: 30px; color: #10b981; font-weight: 700;">→</div>
                            <div style="text-align: center;">
                                <div style="font-size: 12px; color: #94a3b8; margin-bottom: 8px;">Trạng thái mới</div>
                                <div style="font-size: 24px; font-weight: 700; color: #10b981;">${newStatus}</div>
                            </div>
                        </div>
                    </div>

                    <div style="
                        background: rgba(56, 189, 248, 0.1);
                        border: 1px solid #38bdf8;
                        border-radius: 8px;
                        padding: 15px;
                        margin-top: 20px;
                    ">
                        <div style="font-size: 14px; color: #38bdf8; font-weight: 600;">⚡ Công suất mới: ${device.power.toFixed(2)} kW</div>
                        <div style="font-size: 12px; color: #94a3b8; margin-top: 5px;">Giảm từ ${oldPower.toFixed(2)} kW</div>
                    </div>

                    <p style="margin: 30px 0 0 0; color: #94a3b8; font-size: 14px; animation: countdown-pulse 1s infinite;">
                        ⏰ Quay lại Thiết bị & Tải sau <span id="countdown-timer">2</span> giây...
                    </p>
                </div>

                <style>
                    @keyframes success-pop {
                        0% { transform: scale(0.8); opacity: 0; }
                        50% { transform: scale(1.05); }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes checkmark-bounce {
                        0% { transform: scale(0); }
                        50% { transform: scale(1.1); }
                        100% { transform: scale(1); }
                    }
                    @keyframes countdown-pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }
                </style>
            `;
        }

        let countdown = 2;
        const timerInterval = setInterval(() => {
            countdown--;
            const timerEl = document.getElementById('countdown-timer');
            if (timerEl) {
                timerEl.textContent = countdown;
            }
            if (countdown <= 0) {
                clearInterval(timerInterval);
            }
        }, 1000);

        setTimeout(() => {
            const deviceTab = document.querySelector('[data-tab="devices"]');
            if (deviceTab) {
                deviceTab.click();
                if (typeof loadDevices === 'function') {
                    loadDevices();
                }
            }
        }, 2000);
    }, 500);
}

// Emergency Shutdown
async function emergencyShutdown(deviceId) {
    const device = deviceDatabase ? deviceDatabase.getDevice(deviceId) : window.currentAlertDevice;
    if (!device) {
        showToast('❌ Không tìm thấy thiết bị', 'error');
        return;
    }

    if (!confirm(`🛑 Xác nhận NGẮT KHẨN CẤP ${device.name}?`)) {
        return;
    }

    showToast(`🛑 Đang ngắt khẩn cấp ${device.name}...`, 'error');

    device.power = 0;
    device.status = false;
    device.load_status = { level: 'idle', label: 'Chờ', color: '#9ca3af' };

    if (deviceDatabase && deviceDatabase.saveToDatabase) {
        deviceDatabase.saveToDatabase(deviceId, 'OFF', 0);
    }

    try {
        const res = await fetch(`/api/device/${deviceId}/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                power_status: 'OFF',
                current_power: 0
            })
        });
        const data = await res.json();
        console.log("API Response:", data);
    } catch (err) {
        console.error("Lỗi API:", err);
    }

    if (typeof deviceUI !== 'undefined' && deviceUI.updateDeviceUI) {
        deviceUI.updateDeviceUI(deviceId, false);
    }

    setTimeout(() => {
        showToast(`✅ ${device.name} đã được ngắt khẩn cấp`, 'success');

        const deviceTab = document.querySelector('[data-tab="devices"]');
        if (deviceTab) {
            deviceTab.click();
            if (typeof loadDevices === 'function') {
                loadDevices();
            }
        }
    }, 1000);
}

// Close Gemini Tab
function closeGeminiTab() {
    window.currentAlertDevice = null;
    const devTab = document.querySelector('[data-tab="devices"]');
    if (devTab) {
        devTab.click();
    }
}

// ========== TOAST NOTIFICATION ==========
function showToast(message, type = 'info') {
    const notif = document.createElement('div');
    const bgColor = type === 'success' ? '#10b981' :
                   type === 'error' ? '#ef4444' :
                   type === 'info' ? '#3b82f6' : '#f59e0b';

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
        animation: gemini-toast-in 0.3s ease-out;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    `;
    notif.textContent = message;
    document.body.appendChild(notif);

    setTimeout(() => {
        notif.style.animation = 'gemini-toast-out 0.3s ease-out forwards';
        setTimeout(() => notif.remove(), 300);
    }, 3000);

    if (!document.getElementById('gemini-v6-styles')) {
        const style = document.createElement('style');
        style.id = 'gemini-v6-styles';
        style.textContent = `
            @keyframes gemini-toast-in {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes gemini-toast-out {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ========== UTILITY ==========
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
}

// Export functions to global
window.optimizeEnergy = optimizeEnergy;
window.emergencyShutdown = emergencyShutdown;
window.closeGeminiTab = closeGeminiTab;
window.showScanningEffect = showScanningEffect;
window.generateDynamicAnalysis = generateDynamicAnalysis;
window.showToast = showToast;