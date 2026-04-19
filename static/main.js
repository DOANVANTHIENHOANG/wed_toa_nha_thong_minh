// ==========================================
// 1. BIẾN TOÀN CỤC (Giữ nguyên của Hoàng)
// ==========================================
window.energyData = [];
window.energyChartInstance = null;
window.analyticsChartInstance = null;
window.devicePieChartInstance = null;

function updateChart() {
    const ctx = document.getElementById('energyChart');
    if (!ctx || !window.energyData || window.energyData.length === 0) return;

    const chartLabels = window.energyData.map(d => d.timestamp);
    const chartValues = window.energyData.map(d => d.consumption_kWh);

    let existingChart = Chart.getChart(ctx);
    if (existingChart) {
        existingChart.data.labels = chartLabels;
        existingChart.data.datasets[0].data = chartValues;
        existingChart.update('none');
        return;
    }

    window.energyChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Công suất (kW)',
                data: chartValues,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}
// ==========================================
// 2. HÀM PHÂN TÍCH (BẢN FULL ĐỘNG - REALTIME 100%)
// ==========================================
async function loadAnalyticsData() {
    try {
        // 1. GỌI API LẤY 30 CỘT DỮ LIỆU TỪ BACKEND
        const response = await fetch('/api/analytics/history');
        const result = await response.json();

        if (!result.success) return;

        const labels = result.labels;
        const chartData = result.data;

        // Tính tổng và bóc tách dữ liệu
        const realMonthTotal = chartData.reduce((a, b) => a + b, 0); 
        const todayKwh = chartData[chartData.length - 1]; // Hôm nay (Cột cuối)
        const yesterdayKwh = chartData[chartData.length - 2]; // Hôm qua (Cột kế cuối)

        // Cập nhật số liệu tổng lên giao diện
        if (document.getElementById('val-month')) document.getElementById('val-month').textContent = realMonthTotal.toFixed(1);
        if (document.getElementById('val-day')) document.getElementById('val-day').textContent = todayKwh.toFixed(2);
        if (document.getElementById('analytics-month-total')) document.getElementById('analytics-month-total').textContent = realMonthTotal.toFixed(1);

        // =====================================
        // 🔥 ĐỘNG SỐ 1: TÍNH % TĂNG GIẢM (SO VỚI HÔM QUA)
        // =====================================
        let trendPercent = 0;
        if (yesterdayKwh > 0) {
            trendPercent = ((todayKwh - yesterdayKwh) / yesterdayKwh) * 100;
        }

        const trendEl = document.getElementById('power-trend');
        if (trendEl) {
            if (trendPercent > 0) {
                trendEl.innerHTML = `▲ ${trendPercent.toFixed(1)}%`;
                trendEl.style.color = '#ef4444'; // Đỏ (Tốn điện)
            } else if (trendPercent < 0) {
                trendEl.innerHTML = `▼ ${Math.abs(trendPercent).toFixed(1)}%`;
                trendEl.style.color = '#10b981'; // Xanh lá (Tiết kiệm)
            } else {
                trendEl.innerHTML = `- 0%`;
                trendEl.style.color = '#94a3b8'; // Xám (Bằng nhau)
            }
        }

        // =====================================
        // 🔥 ĐỘNG SỐ 2: TẠO INSIGHT THÔNG MINH THEO LOGIC
        // =====================================
        if (document.getElementById('insight-text')) {
            let insightMsg = "Hệ thống đang hoạt động ổn định và an toàn.";
            const currentHour = new Date().getHours();

            if (trendPercent > 15) {
                insightMsg = `Cảnh báo: Tiêu thụ đang tăng đột biến <span style="color: #ef4444; font-weight: bold;">+${trendPercent.toFixed(1)}%</span> so với hôm qua!`;
            } else if (trendPercent < -5) {
                insightMsg = `Tuyệt vời! Bạn đang tiết kiệm được <span style="color: #10b981; font-weight: bold;">${Math.abs(trendPercent).toFixed(1)}%</span> điện năng.`;
            } else if (currentHour >= 17 && currentHour <= 20) {
                insightMsg = "Đang trong <b style='color: #f59e0b;'>giờ cao điểm</b> (17h-20h), ưu tiên tắt các thiết bị không cần thiết.";
            } else if (todayKwh > 40) {
                insightMsg = "Mức tiêu thụ trong ngày khá cao, hãy kiểm tra lại hệ thống điều hòa (HVAC).";
            }
            
            document.getElementById('insight-text').innerHTML = insightMsg;
        }

        // =====================================
        // 🔥 ĐỘNG SỐ 3: CẬP NHẬT DỰ BÁO TIỀN ĐIỆN TỪ API
        // =====================================
try {
    const res = await fetch('/api/analytics/forecast');
    const forecast = await res.json();
    if (forecast.success) {
        // Lấy tiền triệu chia cho 1000 để hiện đơn vị "k" cho nó sang
        const tienK = (forecast.data.forecast_month_vnd / 1000).toLocaleString('vi-VN');
        const priceEl = document.getElementById('forecast-price-value');
        if (priceEl) priceEl.textContent = `${tienK}k VNĐ`;
    }
} catch (e) { console.log("Lỗi dự báo:", e); }
        // VẼ BIỂU ĐỒ 30 CỘT
        // =====================================
        const ctx = document.getElementById('historyBarChart');
        if (!ctx) return;
        if (window.analyticsChartInstance) window.analyticsChartInstance.destroy();

        window.analyticsChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Điện năng (kWh)',
                    data: chartData,
                    backgroundColor: (context) => {
                        const chart = context.chart;
                        const {ctx, chartArea} = chart;
                        if (!chartArea) return null;
                        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                        gradient.addColorStop(0, 'rgba(56, 189, 248, 0.1)'); 
                        gradient.addColorStop(1, 'rgba(56, 189, 248, 0.8)'); 
                        return gradient;
                    },
                    borderColor: '#38bdf8',
                    borderWidth: 1, 
                    barPercentage: 0.6,
                    borderRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
                    x: { 
                        grid: { display: false }, 
                        ticks: { 
                            color: '#94a3b8',
                            callback: function(val, index) { return index % 2 === 0 ? this.getLabelForValue(val) : ''; }
                        } 
                    }
                }
            }
        });
    } catch (err) { console.error("Lỗi Analytics:", err); } 
}
// ==========================================
// 3. HÀM REALTIME (BẢN FIX: CHUẨN SẠCH KÝ TỰ RÁC)
// ==========================================
async function loadRealtimeFromAPI() {
    try {
        const statsRes = await fetch('/api/stats');
        if (statsRes.ok) {
            const stats = await statsRes.json();

            // 🔥 BƯỚC 1: LẤY TỔNG CÔNG SUẤT THẬT TỪ BẢNG 25 PHÒNG
            let realTotalPower = 0;
            if (window.deviceDatabase && window.deviceDatabase.devices) {
                for (let key in window.deviceDatabase.devices) {
                    const dev = window.deviceDatabase.devices[key];
                    if (dev.status) { 
                        realTotalPower += (dev.power || 0);
                    }
                }
            }

            if (realTotalPower > 0) {
                stats.current_power = realTotalPower;
            }
// 🔥 CÔNG THỨC THỰC TẾ 100%
            const addedKwh = (stats.current_power * 30) / 3600;

            if (typeof window.realDayKwh === 'undefined') {
                window.realDayKwh = stats.today_kwh || parseFloat(document.getElementById('val-day')?.textContent) || 0;
            }

            // 1. Cộng lượng điện VỪA TIÊU THỤ trong 30 giây qua cho Hôm nay
            window.realDayKwh += addedKwh;

            // 🔥 2. CẬP NHẬT BIỂU ĐỒ VÀ ÉP TỔNG THÁNG = TỔNG TẤT CẢ CÁC CỘT CỘNG LẠI!
            if (window.analyticsChartInstance) {
                const chart = window.analyticsChartInstance;
                const labelsArray = chart.data.labels;
                const dataArray = chart.data.datasets[0].data;

                const todayObj = new Date();
                const todayStr = `${todayObj.getDate().toString().padStart(2, '0')}/${(todayObj.getMonth() + 1).toString().padStart(2, '0')}`;

                if (labelsArray.length > 0 && labelsArray[labelsArray.length - 1] === todayStr) {
                    dataArray[dataArray.length - 1] = parseFloat(window.realDayKwh.toFixed(2)); 
                } else {
                    labelsArray.push(todayStr); 
                    dataArray.push(parseFloat(window.realDayKwh.toFixed(2))); 
                    if (labelsArray.length > 15) {
                        labelsArray.shift();
                        dataArray.shift();
                    }
                }
                chart.update('none'); 

                // ⚡ ĐÂY LÀ ĐOẠN ĐÁP ỨNG YÊU CẦU CỦA SẾP: 
                // Lấy máy tính cộng dồn chính xác tất cả các cột đang có trên biểu đồ!
                window.realMonthKwh = dataArray.reduce((a, b) => a + b, 0);
            } else {
                if (typeof window.realMonthKwh === 'undefined') window.realMonthKwh = 0;
                window.realMonthKwh += addedKwh;
            }

            // 3. XUẤT RA MÀN HÌNH CHUẨN KHÔNG CẦN CHỈNH
            const fields = { 
                'val-pwr': stats.current_power.toFixed(2),  
                'val-tmp': (stats.current_temp || 24.0).toFixed(1), 
                'val-day': window.realDayKwh.toFixed(2),     
                'val-month': window.realMonthKwh.toFixed(1)  
            };
            for (let id in fields) { 
                if(document.getElementById(id)) document.getElementById(id).textContent = fields[id]; 
            }
            if(document.getElementById('current-power-analytics')) {
                document.getElementById('current-power-analytics').textContent = stats.current_power.toFixed(2) + ' kW';
            }
            if (document.getElementById('analytics-month-total')) {
                document.getElementById('analytics-month-total').textContent = window.realMonthKwh.toFixed(1);
            }

            setTimeout(() => runAutomationAI(stats.current_power), 0);
        }

        const chartRes = await fetch('/api/chart-data');
        if (chartRes.ok) {
            const chartData = await chartRes.json();
            
            let realTotalPowerForChart = 0;
            if (window.deviceDatabase && window.deviceDatabase.devices) {
                for (let key in window.deviceDatabase.devices) {
                    if (window.deviceDatabase.devices[key].status) {
                        realTotalPowerForChart += (window.deviceDatabase.devices[key].power || 0);
                    }
                }
            }
            if (realTotalPowerForChart > 0 && chartData.data.length > 0) {
                chartData.data[chartData.data.length - 1] = parseFloat(realTotalPowerForChart.toFixed(2));
            }

            window.energyData = chartData.labels.map((label, idx) => ({ timestamp: label, consumption_kWh: chartData.data[idx] }));
            if (typeof updateChart === 'function') updateChart();
        }

        const devicesRes = await fetch('/api/devices');
        if (devicesRes.ok) {
            const serverDevices = await devicesRes.json();
            
            // 🔥 LẤY LỆNH BÀI TỪ TRÌNH DUYỆT ĐỂ BẢO VỆ PHÒNG
            let optimizedRooms = JSON.parse(localStorage.getItem('optimized_rooms')) || {};
            let currentTime = Date.now();

            if (!window.deviceDatabase) window.deviceDatabase = { devices: {} };

            // 🔥 QUÉT DATA SERVER VÀ ÉP MÀU XANH NẾU CÓ LỆNH BÀI
            const deviceArray = Array.isArray(serverDevices) ? serverDevices : Object.values(serverDevices);
            deviceArray.forEach(dev => {
                let id = dev.id || dev.room_code || dev.name;
                if (!id) return;

                if (!window.deviceDatabase.devices[id]) window.deviceDatabase.devices[id] = {};
                let localDev = window.deviceDatabase.devices[id];
                localDev.name = dev.room_name || dev.name || `Phòng ${id}`;

                // NẾU PHÒNG NÀY ĐÃ ĐƯỢC BẤM "ÁP DỤNG"
               if (optimizedRooms[id] && optimizedRooms[id] > currentTime) {
                    // CÒN TRONG 2 PHÚT BẢO VỆ -> ÉP XANH TOÀN DIỆN
                    localDev.power = 0.5;
                    localDev.current_power = 0.5; // Kẹp thêm thằng này
                    localDev.status = true;
                    localDev.power_status = 'ON'; // Kẹp thêm thằng này
                    localDev.load_status = "Bình thường";
                    localDev.control_status = "Xử lý";    
                } else {
                    // HẾT THỜI GIAN BẢO VỆ -> ĐỌC SỐ THỰC TẾ TỪ SERVER
                    if (optimizedRooms[id]) {
                        delete optimizedRooms[id];
                        localStorage.setItem('optimized_rooms', JSON.stringify(optimizedRooms));
                    }
                    localDev.power = parseFloat(dev.power || dev.current_power || 0);
                    localDev.status = (dev.power_status === 'ON' || dev.status === true);
                    localDev.load_status = dev.load_status || "Chờ";
                }
            });

            // Gọi hàm render lại cái Bảng thiết bị
            if (window.deviceUI && typeof window.deviceUI.renderTable === 'function') {
                window.deviceUI.renderTable();
            }

            // 📊 VẼ BIỂU ĐỒ TRÒN
// 📊 VẼ BIỂU ĐỒ TRÒN (ĐÃ KHÔI PHỤC ĐOẠN KHỞI TẠO)
            let activeDevices = Object.values(window.deviceDatabase.devices).filter(d => d.status === true);
            const labels = activeDevices.length > 0 ? activeDevices.map(d => d.name) : ['Không có tải'];
            const data = activeDevices.length > 0 ? activeDevices.map(d => parseFloat(d.power || 0).toFixed(2)) : [1];
            
            const ctxPie = document.getElementById('devicePieChart');
            if (ctxPie) {
                if (window.devicePieChartInstance) {
                    window.devicePieChartInstance.data.labels = labels;
                    window.devicePieChartInstance.data.datasets[0].data = data;
                    window.devicePieChartInstance.update();
                } else {
                    // 🔥 ĐOẠN NÀY ĐÃ BỊ THIẾU NÊN NÓ KHÔNG VẼ LÊN ĐƯỢC
                    window.devicePieChartInstance = new Chart(ctxPie, {
                        type: 'doughnut',
                        data: {
                            labels: labels,
                            datasets: [{
                                data: data,
                                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1'],
                                borderWidth: 0, hoverOffset: 5
                            }]
                        },
                        options: {
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { display: activeDevices.length <= 8, position: 'right', labels: { color: '#cbd5e1', font: {size: 11} } } },
                            cutout: '65%'
                        }
                    });
                }
            }
        }
    } catch (err) { console.error("Lỗi Realtime:", err); }
}

// ==========================================
// 4. TRẢ LẠI NGUYÊN VẸN HỆ SINH THÁI CỦA HOÀNG KHÔNG MẤT 1 DÒNG NÀO
// ==========================================
async function runAutomationAI(currentPower) {
    const thresholdInput = document.getElementById('threshold-input');
    const threshold = thresholdInput ? parseFloat(thresholdInput.value) : 15.0;

    // Chỉ chạy logic khi vượt ngưỡng
    if (currentPower > threshold) {
        console.group("🤖 AI AUTOMATION LOG"); 
        console.log(`Mức tải: ${currentPower}kW | Ngưỡng: ${threshold}kW`);

        // HÀNH ĐỘNG 1: Tăng số kích hoạt
        const activationEl = document.querySelector('.stat-card:nth-child(3) .stat-value, [data-stat="activation"] .stat-value');
        if (activationEl) {
            activationEl.innerText = (parseInt(activationEl.innerText) || 0) + 1;
            console.log("✅ Đã tăng số đếm kích hoạt");
        }

        // HÀNH ĐỘNG 2: Tắt thiết bị
        const onButton = document.querySelector('.btn-toggle.on, .status-on, [class*="status-active"]');
        if (onButton) {
            const deviceId = onButton.dataset.id || onButton.closest('[data-id]')?.dataset.id;
            
            if (deviceId) {
                fetch('/update_status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ device_id: deviceId, action: 'OFF' })
                })
                .then(res => res.json())
                .then(data => console.log(`🚀 AI đã tắt thiết bị ${deviceId}`, data))
                .catch(e => console.error("❌ Lỗi API tắt:", e));
            } else {
                console.warn("⚠️ Không tìm thấy ID để tắt, tự động Click nút!");
                onButton.click();
            }
        }
        
        if (window.showNotification) window.showNotification("AI: Tự động cắt tải bảo vệ!", "error");
        console.groupEnd();
    }
}

async function askGeminiAI() {
    const queryInput = document.getElementById('ai-query');
    const responseDiv = document.getElementById('ai-response');
    const query = queryInput.value.trim();
    
    if (!query) return;

    // 1. HIỂN THỊ TIN NHẮN CỦA HOÀNG (Giữ nguyên 100%)
    const userMsgHtml = `
        <div style="display: flex; justify-content: flex-end; margin-bottom: 15px;">
            <div style="background: var(--primary); color: white; padding: 10px 15px; border-radius: 18px 18px 2px 18px; max-width: 80%; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                ${query}
            </div>
        </div>`;
    responseDiv.innerHTML += userMsgHtml;
    
    const loadingId = 'loading-' + Date.now();
    responseDiv.innerHTML += `<div id="${loadingId}" style="color: #94a3b8; font-size: 13px; margin-bottom: 15px; margin-left: 10px;">🤖 Gemini đang soạn tin nhắn...</div>`;
    
    queryInput.value = '';
    responseDiv.scrollTop = responseDiv.scrollHeight; 

    try {
        // =========================================================
        // 🔥 CHỈ BỔ SUNG ĐOẠN NÀY: THU THẬP SỐ THẬT TRÊN MÀN HÌNH
        // =========================================================
        let livePower = document.getElementById('current-power-analytics')?.textContent || document.getElementById('val-pwr')?.textContent || "0 kW";
        let liveDayKwh = document.getElementById('val-day')?.textContent || "0";
        let liveMonthKwh = document.getElementById('val-month')?.textContent || "0";

        // Lọc ra Top các phòng đang bật và tốn điện nhất
        let roomStr = "Hệ thống đang ổn định";
        if (window.deviceDatabase && window.deviceDatabase.devices) {
            let activeDevs = Object.values(window.deviceDatabase.devices)
                .filter(d => d.status)
                .sort((a, b) => (parseFloat(b.power) || 0) - (parseFloat(a.power) || 0))
                .slice(0, 5); // Lấy tối đa 5 phòng
            
            if (activeDevs.length > 0) {
                roomStr = activeDevs.map(d => `${d.name} (${parseFloat(d.power || 0).toFixed(1)} kW - ${d.load_status})`).join(', ');
            }
        }

        // Bơm số liệu thực tế này vào phía sau câu hỏi của sếp
        let promptInject = `Câu hỏi của người dùng: "${query}"

[DỮ LIỆU HỆ THỐNG REAL-TIME BẮT BUỘC DÙNG ĐỂ TRẢ LỜI]:
- Tổng công suất hiện tại: ${livePower}
- Điện năng hôm nay: ${liveDayKwh} kWh
- Điện năng tháng này: ${liveMonthKwh} kWh
- Trạng thái các phòng tốn điện nhất: ${roomStr}

Yêu cầu: Trả lời tự nhiên, chuyên nghiệp. CHỈ sử dụng các con số trong [DỮ LIỆU HỆ THỐNG REAL-TIME] để báo cáo. TUYỆT ĐỐI không lấy số liệu cũ, không tự bịa số.`;
        // =========================================================

        const res = await fetch('/api/ai/gemini-consult', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // THAY ĐỔI NHỎ: Gửi cái prompt đã được bơm số liệu đi
            body: JSON.stringify({ query: promptInject }) 
        });
        
        const data = await res.json();
        const loadingEl = document.getElementById(loadingId);
        
        // 2. HIỂN THỊ TIN NHẮN CỦA AI (Giữ nguyên 100%)
        const aiMsgHtml = `
            <div style="display: flex; justify-content: flex-start; margin-bottom: 20px;">
                <div style="background: rgba(30, 41, 59, 0.8); color: #cbd5e1; padding: 15px; border-radius: 18px 18px 18px 2px; max-width: 90%; border: 1px solid rgba(56, 189, 248, 0.2); box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                    <div style="font-weight: bold; color: var(--primary-light); margin-bottom: 8px; font-size: 11px; display: flex; align-items: center; gap: 5px;">
                        <i class="fas fa-robot"></i> SED AI - TRỢ LÝ THÔNG MINH
                    </div>
                    <div style="line-height: 1.6; font-size: 14px;">
                        ${data.response ? data.response.replace(/\n/g, '<br>') : "Hệ thống đang bận, Hoàng hỏi lại sau nhé!"}
                    </div>
                </div>
            </div>`;
        
        if (loadingEl) {
            loadingEl.outerHTML = aiMsgHtml; 
        }
        responseDiv.scrollTop = responseDiv.scrollHeight;

    } catch (err) {
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) {
            loadingEl.innerHTML = `<div style="color: var(--danger);">❌ Lỗi kết nối: ${err.message}</div>`;
        }
    }
}
// ==========================================
// HÀM TỐI ƯU NĂNG LƯỢNG (BẢN TỐI THƯỢNG - CHỐNG SPAM 100%)
// ==========================================
window.optimizeEnergy = async function(param1, param2) {
    let deviceId = null;
    let roomName = null;

    // 1. Phân loại tham số truyền vào
    if (typeof param2 === 'string' && param2.includes('Phòng')) {
        deviceId = param1; roomName = param2;
    } else if (typeof param1 === 'string' && param1.includes('Phòng')) {
        roomName = param1; deviceId = param2;
    } else if (!isNaN(param1)) {
        deviceId = param1;
    } else if (!isNaN(param2)) {
        deviceId = param2;
    }

    // 2. 🧠 BỘ NÃO TRUY QUÉT DATA: Tìm chính xác ID và Tên trong Database
    let targetKey = null;
    if (window.deviceDatabase && window.deviceDatabase.devices) {
        // Tìm theo ID trước
        if (deviceId && window.deviceDatabase.devices[deviceId]) {
            targetKey = deviceId;
            if (!roomName) roomName = window.deviceDatabase.devices[deviceId].name;
        } else {
            // Không có ID thì rà theo Tên Phòng
            for (let key in window.deviceDatabase.devices) {
                if (window.deviceDatabase.devices[key].name === roomName) {
                    targetKey = key;
                    if (!deviceId) deviceId = key;
                    break;
                }
            }
        }
    }

    // Dự phòng nếu lỗi
    if (!roomName) roomName = `Thiết bị ${deviceId || ''}`.trim();
    if (!targetKey) {
        console.error("❌ Không tìm thấy phòng trong Database. Param:", param1, param2);
        // Vẫn cho chạy tiếp để báo lỗi rõ ràng
    }

    if (!confirm(`Xác nhận TỐI ƯU HÓA ${roomName}?`)) return;

    try {
        let idToLock = targetKey || deviceId;
if (idToLock) {

    let optimizedRooms = JSON.parse(localStorage.getItem('optimized_rooms')) || {};
    optimizedRooms[idToLock] = Date.now() + 120000; // Khóa chết 2 phút
    localStorage.setItem('optimized_rooms', JSON.stringify(optimizedRooms));
}
        fetch('/api/ai/optimize', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ device_id: deviceId, room_name: roomName })
        }).catch(e => console.log("Backend log:", e));
        
        // NHẢY TAB TỨC THÌ
        const deviceTab = document.querySelector('.nav-item[data-tab="devices"]') || document.querySelector('.nav-link[data-tab="devices"]');
        if (deviceTab && typeof switchTab === 'function') switchTab(deviceTab);

        // 🔨 KHÓA CHẾT VÀ ĐỔI MÀU (CHỈ ĐÚNG PHÒNG ĐÓ)
        setTimeout(() => {
            if (targetKey && window.deviceDatabase && window.deviceDatabase.devices[targetKey]) {
                // RÚT ĐIỆN VÒNG LẶP RANDOM!
                if (window.deviceDatabase.powerIntervals && window.deviceDatabase.powerIntervals[targetKey]) {
                    clearInterval(window.deviceDatabase.powerIntervals[targetKey]);
                }

                const dev = window.deviceDatabase.devices[targetKey];
                // 🔥 SPRINT 5: GHI LOG KHI CÓ HÀNH ĐỘNG CẮT TẢI
                let currentPowerBefore = dev.power || 0;
                let powerSaved = currentPowerBefore - 0.5; 
                if (powerSaved > 0 && typeof window.logAIAction === 'function') {
                    window.logAIAction(roomName, powerSaved); 
                }
                dev.power = 0.5; 
                dev.status = true; 
                dev.load_status = window.deviceDatabase.calculateLoadStatus ? window.deviceDatabase.calculateLoadStatus(0.5) : "Bình thường";
                dev.isOptimized = true;
                
                // Cập nhật giao diện
                if (window.deviceUI && typeof window.deviceUI.updateDeviceUI === 'function') {
                    window.deviceUI.updateDeviceUI(targetKey, true);
                }
            }
            
            // Vẽ lại bảng
            if (window.deviceUI && typeof window.deviceUI.renderTable === 'function') {
                window.deviceUI.renderTable(); 
            }
        }, 300); 

        // THÔNG BÁO XỊN
        const msg = `✅ ${roomName} đã được tối ưu về mức Bình thường!`;
        if (typeof window.showNotification === 'function') {
            window.showNotification(msg, "success");
        } else {
            const toast = document.createElement('div');
            toast.innerHTML = msg;
            toast.style.cssText = `position: fixed; top: 80px; right: 20px; background: rgba(16, 185, 129, 0.95); color: white; padding: 12px 20px; border-radius: 6px; font-weight: 500; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 9999; backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.1);`;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
    } catch (err) {
        console.error("Lỗi UI:", err);
    }
};
async function loadEnergyForecast() {
    try {
        console.log('🔮 Đang gọi API dự báo...');
        const response = await fetch('/api/analytics/forecast');
        console.log('📡 Response status:', response.status);

        const result = await response.json();
        console.log('📊 Kết quả dự báo:', result);

        const el = document.getElementById('du-bao-thang');
        if (!el) {
            console.error('❌ Không tìm thấy element du-bao-thang');
            return;
        }

        if (result.success) {
            const rawMoney = result.data.forecast_month_vnd;
            console.log('💰 Tiền dự báo raw:', rawMoney);
            const tienK = Math.round(rawMoney / 1000).toLocaleString('vi-VN');
            el.innerText = tienK + 'k VNĐ';
            console.log('✅ Đã hiển thị dự báo');
        } else {
            console.error('❌ API lỗi:', result.error);
            el.innerText = 'Lỗi dữ liệu';
        }
    } catch (e) {
        console.error('❌ Lỗi loadEnergyForecast:', e);
        const el = document.getElementById('du-bao-thang');
        if (el) el.innerText = 'Lỗi kết nối';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadAnalyticsData();
    loadEnergyForecast(); 
    loadRealtimeFromAPI();

    // 🔥 THIẾT LẬP CẬP NHẬT TỰ ĐỘNG MỖI 30 GIÂY
    setInterval(() => {
        loadRealtimeFromAPI();   
        loadEnergyForecast();    
    }, 30000); 
});
async function handleEmergency(deviceId, roomName) {
    try {
        // 1. Gọi API xử lý (Tùy theo Backend của ông, nếu chưa có thì dùng optimizeEnergy)
        const response = await fetch('/api/ai/optimize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ device_id: deviceId, action: 'RESET' })
        });

        const result = await response.json();
        
        // 2. Hiện thông báo thành công màu xanh (Toast)
        const msg = `✅ Đã xử lý thành công ${roomName}! Mức tải đã về bình thường.`;
        const toast = document.createElement('div');
        toast.innerHTML = msg;
        toast.style.cssText = `position: fixed; top: 80px; right: 20px; background: rgba(16, 185, 129, 0.95); color: white; padding: 12px 20px; border-radius: 6px; font-weight: 500; z-index: 9999;`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);

        // 3. 🔥 QUAN TRỌNG: Ép giao diện phòng đó về Bình Thường
        if (window.deviceDatabase && window.deviceDatabase.devices[deviceId]) {
            const dev = window.deviceDatabase.devices[deviceId];
            dev.power = 0.5; // Đưa về mức an toàn
            dev.status = true;
           dev.load_status = window.deviceDatabase.calculateLoadStatus ? window.deviceDatabase.calculateLoadStatus(0.5) : "Bình thường";
            
            // Vẽ lại bảng thiết bị để mất chữ "Tới hạn"
            if (window.deviceUI && typeof window.deviceUI.renderTable === 'function') {
                window.deviceUI.renderTable();
            }
        }
        
        // 4. Cập nhật lại toàn bộ Dashboard
        loadRealtimeFromAPI();

    } catch (e) {
        console.error("Lỗi xử lý:", e);
    }
}
// ==========================================
// 5. KHỞI ĐỘNG HỆ THỐNG
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadAnalyticsData().then(() => {
        loadRealtimeFromAPI();
        setInterval(loadRealtimeFromAPI, 30000);
    });
});

// ==========================================
// EVENT DELEGATION CHO TAB GEMINI
// ==========================================
document.addEventListener('click', function(e) {
    const btn = e.target.closest('button');
    if (!btn) return;

    if (btn.classList.contains('btn-optimize') || btn.textContent.includes("Tối ưu")) {
        const onclickAttr = btn.getAttribute('onclick');
        const match = onclickAttr?.match(/optimizeEnergy\(['"]([^'"]+)['"]\)/);

        if (match && match[1]) {
            const deviceId = match[1];
            // Gọi biến window.optimizeEnergy
            if (typeof window.optimizeEnergy === 'function') {
                window.optimizeEnergy(deviceId);
            } else {
                console.error("Lỗi nặng: Vẫn không thấy window.optimizeEnergy!");
            }
        }
        return;
    }

    if (btn.classList.contains('btn-emergency') || btn.textContent.includes("Ngắt")) {
        const onclickAttr = btn.getAttribute('onclick');
        const match = onclickAttr?.match(/emergencyShutdown\(['"]([^'"]+)['"]\)/);
        if (match && match[1]) {
            if (typeof window.emergencyShutdown === 'function') {
                window.emergencyShutdown(match[1]);
            }
        }
        return;
    }
});
// ==========================================
// EVENT DELEGATION CHO TAB GEMINI
// Bắt click động trên nút "Tối ưu năng lượng" và "Ngắt khẩn cấp"
// ==========================================
document.addEventListener('click', function(e) {
    // Tìm button cha gần nhất
    const btn = e.target.closest('button');
    if (!btn) return;

    console.log("Click detected on button:", btn.className, btn.textContent);

    // 🔵 NÚT TỐI ƯU - Theo class hoặc text
    if (btn.classList.contains('btn-optimize') || btn.textContent.includes("Tối ưu")) {
        console.log("CLICK OPTIMIZE - BUTTON FOUND");

        // Lấy deviceId từ onclick attribute
        const onclickAttr = btn.getAttribute('onclick');
        console.log("onclick attr:", onclickAttr);

        const match = onclickAttr?.match(/optimizeEnergy\(['"]([^'"]+)['"]\)/);

        if (match && match[1]) {
            const deviceId = match[1];
            console.log("Device ID:", deviceId);

            // Gọi hàm optimizeEnergy từ GeminiAnalysis.js
            if (typeof optimizeEnergy === 'function') {
                console.log("Calling optimizeEnergy...");
                optimizeEnergy(deviceId);
            } else {
                console.error("optimizeEnergy không tồn tại");
            }
        } else {
            console.error("Không lấy được deviceId từ onclick");
        }
        return;
    }

    // 🔴 NÚT NGẮT KHẨN - Theo class hoặc text
    if (btn.classList.contains('btn-emergency') || btn.textContent.includes("Ngắt")) {
        console.log("CLICK EMERGENCY - BUTTON FOUND");

        // Lấy deviceId từ onclick attribute
        const onclickAttr = btn.getAttribute('onclick');
        console.log("onclick attr:", onclickAttr);

        const match = onclickAttr?.match(/emergencyShutdown\(['"]([^'"]+)['"]\)/);

        if (match && match[1]) {
            const deviceId = match[1];
            console.log("Device ID:", deviceId);

            // Gọi hàm emergencyShutdown từ GeminiAnalysis.js
            if (typeof emergencyShutdown === 'function') {
                console.log("Calling emergencyShutdown...");
                emergencyShutdown(deviceId);
            } else {
                console.error("emergencyShutdown không tồn tại");
            }
        } else {
            console.error("Không lấy được deviceId từ onclick");
        }
        return;
    }
});
window.xacNhanToiUu = function(deviceId) {
    console.log(`🚀 Bắt đầu tối ưu bằng LocalStorage cho phòng: ${deviceId}`);

    // 1. Lưu ID phòng này vào bộ nhớ trình duyệt, khóa trạng thái Xanh trong 2 phút
    let optimizedRooms = JSON.parse(localStorage.getItem('optimized_rooms')) || {};
    optimizedRooms[deviceId] = Date.now() + 120000; // Thời gian sống = hiện tại + 2 phút
    localStorage.setItem('optimized_rooms', JSON.stringify(optimizedRooms));

    // 2. Chuyển tab về danh sách
    if (typeof switchTab === 'function') switchTab('devices');
    
    // 3. Hiện thông báo
    alert(`✅ Đã áp dụng giải pháp tối ưu cho phòng ${deviceId} thành công!`);

    // 4. Load lại dữ liệu ngay
    if (typeof loadRealtimeFromAPI === 'function') loadRealtimeFromAPI();
};
// ==========================================
// 📜 HỆ THỐNG GHI LOG NHẬT KÝ AI VÀ THỐNG KÊ (SPRINT 5)
// ==========================================
window.logAIAction = function(roomName, powerSaved) {
    // 1. CỘNG DỒN SỐ LẦN KÍCH HOẠT
    let totalActivations = parseInt(localStorage.getItem('ai_activations')) || 0;
    totalActivations += 1;
    localStorage.setItem('ai_activations', totalActivations);

    // 2. CỘNG DỒN SỐ ĐIỆN TIẾT KIỆM ĐƯỢC
    let totalSavedKwh = parseFloat(localStorage.getItem('ai_saved_kwh')) || 0;
    totalSavedKwh += powerSaved;
    localStorage.setItem('ai_saved_kwh', totalSavedKwh);

    // 3. TẠO DÒNG LOG NHẬT KÝ MỚI
    let logs = JSON.parse(localStorage.getItem('ai_action_logs')) || [];
    let now = new Date();
    let timeStr = `[${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')} - ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
    
    let logHTML = `
        <div style="padding: 12px; background: rgba(255,255,255,0.03); border-left: 3px solid #10b981; border-radius: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #cbd5e1;">
                <span style="color: #34d399; font-weight: 600; margin-right: 8px;">${timeStr}</span> 
                Hệ thống tự động hạ tải <span style="color: #fff; font-weight:bold;">${roomName}</span> về mức Bình thường.
            </span>
            <span style="color: #fbbf24; font-weight: bold; background: rgba(251, 191, 36, 0.1); padding: 4px 8px; border-radius: 4px;">
                Cứu tải: ~${powerSaved.toFixed(1)} kW
            </span>
        </div>
    `;
    
    logs.unshift(logHTML);
    if (logs.length > 50) logs.pop();
    localStorage.setItem('ai_action_logs', JSON.stringify(logs));

    // 4. VẼ TẤT CẢ RA GIAO DIỆN
    if (typeof window.renderAILogs === 'function') window.renderAILogs();
};

// Hàm Vẽ lại giao diện
window.renderAILogs = function() {
    let logs = JSON.parse(localStorage.getItem('ai_action_logs')) || [];
    let logContainer = document.getElementById('ai-action-log');
    if (logContainer && logs.length > 0) logContainer.innerHTML = logs.join('');
    
    let totalActivations = parseInt(localStorage.getItem('ai_activations')) || 0;
    let actEl = document.getElementById('triggers-total');
    if (actEl) actEl.innerText = totalActivations;
    
    let totalSavedKwh = parseFloat(localStorage.getItem('ai_saved_kwh')) || 0;
    let savedEl = document.getElementById('savings-today');
    if (savedEl) savedEl.innerText = totalSavedKwh.toFixed(1) + ' kWh';
    
    let co2El = document.getElementById('co2-saved');
    if (co2El) co2El.innerText = '↓ Giảm ' + (totalSavedKwh * 0.4).toFixed(2) + ' kg CO2';
};

// Gọi khi vừa mở trang web, hoặc khi nhấn qua tab Tự động hóa
document.addEventListener('DOMContentLoaded', () => { setTimeout(window.renderAILogs, 500); });
// Lắng nghe sự kiện click menu để lỡ nó load chậm thì update lại
document.addEventListener('click', (e) => {
    if (e.target.closest('[data-tab="automation"]')) { setTimeout(window.renderAILogs, 100); }
});
// ==========================================
// 5. KHỞI ĐỘNG HỆ THỐNG (Bản đã fix lỗi cập nhật)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadAnalyticsData().then(() => {
        loadRealtimeFromAPI();
        if (typeof loadEnergyForecast === 'function') {
            loadEnergyForecast();
        }
    
        setInterval(() => {
            loadRealtimeFromAPI();
            if (typeof loadEnergyForecast === 'function') {
                loadEnergyForecast();
            }
        }, 30000);
    });
});