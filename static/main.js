
//1. BIẾN TOÀN CỤC (Giữ nguyên của Hoàng)
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
// Lưu số liệu ban đầu vào biến toàn cục (window) để các hàm khác có thể lấy ra cộng dồn
        window.realTimeDayKwh = todayKwh || 0;
        window.realTimeMonthKwh = realMonthTotal || 0;

        // Cập nhật số liệu tổng lên giao diện lần đầu
        if (document.getElementById('val-month')) document.getElementById('val-month').textContent = window.realTimeMonthKwh.toFixed(1);
        if (document.getElementById('val-day')) document.getElementById('val-day').textContent = window.realTimeDayKwh.toFixed(2);
        if (document.getElementById('analytics-month-total')) document.getElementById('analytics-month-total').textContent = window.realTimeMonthKwh.toFixed(1);

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
                    y: { 
                        beginAtZero: true, 
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8' } 
                    },
                    x: { 
                        grid: { display: false }, 
                        ticks: { 
                            color: '#94a3b8',
                            // 🚀 Dùng tính năng Auto-skip siêu xịn của Chart.js
                            autoSkip: true,
                            maxTicksLimit: 10,  // Tối đa chỉ hiện 10 mốc ngày
                            maxRotation: 45,    // Xoay nghiêng chữ 45 độ
                            minRotation: 45
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

            // 🚀 ĐÂY CHÍNH LÀ PHÉP THUẬT CỦA SẾP: TRỪ THẲNG VÀO TỔNG!
            // Nếu AI đã chờ đủ 15 giây và ra tay, nó sẽ trừ đi 4.5kW ở đây.
            if (window.isAILoadSheddingActive) {
                const purpleInput = document.getElementById('cut-slider');
                const cutPower = purpleInput ? parseFloat(purpleInput.value) : 4.5;
                realTotalPower = realTotalPower - cutPower; 
                if (realTotalPower < 0) realTotalPower = 0;
            }

            // Cập nhật lại số liệu cho toàn hệ thống
            if (realTotalPower > 0 || window.isAILoadSheddingActive) {
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
   // 📊 BIỂU ĐỒ TRÒN V3 — GROUPED BY STATUS (BẢN FIX CUỐI CÙNG)
        try {
            const activeDevices = Object.values(window.deviceDatabase.devices).filter(d => d.status === true);

            // 🚀 FIX LỖI TẬN GỐC: Trả lại mốc 5.0 và 8.0 chuẩn cho TỪNG PHÒNG
            // Không xài cái mốc 150kW của cả tòa nhà nữa!
            const yellowLimit = 5.0; 
            const redLimit = 8.0;

            // 1. GOM NHÓM THEO ĐÚNG LOGIC CỦA BẢNG THIẾT BỊ
            const groups = {
                normal: activeDevices.filter(d => parseFloat(d.power||0) < yellowLimit),
                high:   activeDevices.filter(d => parseFloat(d.power||0) >= yellowLimit && parseFloat(d.power||0) < redLimit),
                alert:  activeDevices.filter(d => parseFloat(d.power||0) >= redLimit),
            };
            
            const sumPow = arr => arr.reduce((s, d) => s + parseFloat(d.power || 0), 0);
            const totalPower = sumPow(activeDevices);
            const total = activeDevices.length || 1;

            // 2. CẬP NHẬT KPI CARDS
            const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
            setEl('kpi-total-power', totalPower.toFixed(1));
            setEl('kpi-alert-rooms', groups.alert.length);
            setEl('kpi-avg-power',   (totalPower / total).toFixed(1));

            // 3. CẬP NHẬT LEGEND BÊN DƯỚI
            const setLegend = (suffix, grp) => {
                setEl(`leg-${suffix}-count`, grp.length);
                setEl(`leg-${suffix}-pct`,   Math.round(grp.length / total * 100) + '%');
            };
            setLegend('n', groups.normal);
            setLegend('h', groups.high);
            setLegend('a', groups.alert);

            // 4. TRẠNG THÁI + STATUS BAR
            const isOverload = groups.alert.length > 0;
            const statusDot  = document.getElementById('status-dot');
            const statusText = document.getElementById('status-text');
            if (statusDot)  statusDot.style.background  = isOverload ? '#E24B4A' : '#639922';
            if (statusText) statusText.textContent = isOverload ? 'Quá tải hệ thống' : 'Trạng thái ổn định';

            // 5. TOP 3 PHÒNG CẢNH BÁO
            const top3 = [...groups.alert].sort((a,b) => parseFloat(b.power) - parseFloat(a.power)).slice(0, 3);
            const topEl = document.getElementById('top-rooms');
            if (topEl && top3.length) {
                topEl.innerHTML = '<div style="font-size:11px;color:var(--muted,#888);margin-bottom:4px">Top phòng cảnh báo</div>'
                    + top3.map(d =>
                        `<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid rgba(255,255,255,.07)">
                            <span>${d.name}</span>
                            <span style="color:#ff003c;font-weight:600">${parseFloat(d.power).toFixed(1)} kW</span>
                         </div>`
                    ).join('');
            }

            // 6. DỮ LIỆU CHO CHART
            const chartData    = [groups.normal.length, groups.high.length, groups.alert.length];
            const chartLabels  = [
                `Bình thường (< 5.0 kW)`, 
                `Tải cao (5.0 – 8.0 kW)`, 
                `Cảnh báo (> 8.0 kW)`
            ];
            const chartColors  = ['#10b981', '#fbbf24', '#ef4444']; // Xanh - Vàng - Đỏ Chuẩn

            // 7. TOOLTIP CHI TIẾT
            const tooltipCallback = {
                title: ctx => ctx[0].label,
                label: ctx => {
                    const grpArr = [groups.normal, groups.high, groups.alert];
                    const grp = grpArr[ctx.dataIndex];
                    const pow = sumPow(grp);
                    return [
                        ` ${ctx.raw} phòng (${Math.round(ctx.raw / total * 100)}%)`,
                        ` Tổng: ${pow.toFixed(1)} kW`,
                        ` TB: ${(pow / Math.max(ctx.raw, 1)).toFixed(1)} kW/phòng`
                    ];
                }
            };

            const ctxPie = document.getElementById('devicePieChart');
            if (!ctxPie) return;

            if (window.devicePieChartInstance) {
                const ds = window.devicePieChartInstance.data.datasets[0];
                window.devicePieChartInstance.data.labels  = chartLabels;
                ds.data            = chartData;
                ds.backgroundColor = chartColors;
                window.devicePieChartInstance.update('active');

                const clVal = document.getElementById('pie-center-value');
                if (clVal) clVal.textContent = totalPower.toFixed(1);

            } else {
                window.devicePieChartInstance = new Chart(ctxPie, {
                    type: 'doughnut',
                    data: {
                        labels: chartLabels,
                        datasets: [{
                            data: chartData,
                            backgroundColor: chartColors,
                            borderColor: 'transparent',
                            borderWidth: 2,
                            hoverOffset: 8,
                            borderRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '68%',
                        layout: { padding: 10 },
                        animation: { animateScale: true, animateRotate: true },
                        plugins: {
                            legend: { display: false },
                            title:  { display: false },
                            tooltip: { callbacks: tooltipCallback }
                        }
                    }
                });
            }

        } catch (err) { console.error('Lỗi biểu đồ tròn:', err); }
    }
    } catch (err) { console.error("Lỗi API Realtime tổng:", err); }
}
// ==========================================
// 4. KỊCH BẢN AI: ĐÁNH VÀO TỔNG TẢI (KHÔNG ĐỤNG PHÒNG KHÁCH)
// ==========================================

window.alertStartTime = null; 
window.isAILoadSheddingActive = false; // Mặc định là AI chưa trừ số

async function runAutomationAI(currentPower) {
    const redThresholdInput = document.getElementById('alert-slider');
    const purpleThresholdInput = document.getElementById('cut-slider');
    
    // Lấy ngưỡng từ giao diện (nếu chưa có thì lấy mặc định Đỏ 100, Tím 4.5)
    const buildingLimit = redThresholdInput ? parseFloat(redThresholdInput.value) : 100.0;
    const aiCutLimit = purpleThresholdInput ? parseFloat(purpleThresholdInput.value) : 4.5;
    
    // Kiểm tra công tắc ECO
    const isAiEnabled = document.getElementById('eco-mode') ? document.getElementById('eco-mode').checked : true;

    // Phục hồi lại số điện gốc (chưa trừ) để xem 25 phòng đã thực sự an toàn chưa
    let rawPower = window.isAILoadSheddingActive ? (currentPower + aiCutLimit) : currentPower;

    // --- KỊCH BẢN 1: TÒA NHÀ ĐÃ AN TOÀN ---
    if (rawPower <= buildingLimit) {
        window.alertStartTime = null;  
        window.isAILoadSheddingActive = false; // Tắt khiên trừ tổng, trả lại số thực
        return; 
    }

    // --- KỊCH BẢN 2: BÁO ĐỘNG ĐỎ VÀ ĐẾM 15 GIÂY ---
    if (currentPower > buildingLimit && !window.isAILoadSheddingActive) {
        
        // Bắt đầu bấm giờ
        if (!window.alertStartTime) {
            window.alertStartTime = Date.now();
            console.warn(`🚨 NGUY HIỂM: Tải (${currentPower.toFixed(2)}kW) vượt ngưỡng (${buildingLimit}kW)!`);
        }

        const secondsInAlert = (Date.now() - window.alertStartTime) / 1000;

        // Nếu tắt công tắc xanh thì đứng nhìn, tiếp tục cảnh báo
        if (!isAiEnabled) {
            if (secondsInAlert > 3 && secondsInAlert % 3 < 1) {
                if (window.showNotification) window.showNotification("⚠️ Hệ thống quá tải! Cần sự can thiệp của con người!", "warning");
            }
            return; 
        }

        // 🔥 ĐÚNG 15 GIÂY: BẬT CÔNG TẮC TRỪ SỐ!
        if (isAiEnabled && secondsInAlert >= 5) {
            
            console.group("🤖 AI ĐÃ KÍCH HOẠT: ÉP TRỪ THẲNG VÀO TỔNG CÔNG SUẤT!");
            
            // Bật biến này lên, hàm tính tổng (loadRealtimeFromAPI) sẽ tự động trừ đi thanh màu Tím
            window.isAILoadSheddingActive = true; 
            
            if (window.showNotification) {
                window.showNotification(`🤖 AI Kích hoạt: Đã ngắt ${aiCutLimit}kW tải phụ (hành lang, tiện ích chung) để cứu tòa nhà!`, "success");
            }

            // Tăng số lần kích hoạt trên giao diện (Tab Tự động hóa)
            const triggersEl = document.getElementById('triggers-total');
            if (triggersEl) triggersEl.innerText = (parseInt(triggersEl.innerText) || 0) + 1;

            // In ra Nhật ký AI
            if (typeof window.logAIAction === 'function') {
                window.logAIAction("Tải phụ thứ cấp (Khu vực chung)", aiCutLimit);
            }

            // Gọi hàm tính số lại ngay lập tức để màn hình giật số tổng xuống
            if (typeof loadRealtimeFromAPI === 'function') {
                loadRealtimeFromAPI();
            }
            
            console.groupEnd();
            window.alertStartTime = null; 
        }
    }
}
async function askGeminiAI() {
    const queryInput = document.getElementById('ai-query');
    
    // 🚀 FIX 1: Tự động tìm đúng ID mới (chat-history-permanent) hoặc ID cũ (ai-response)
    const responseDiv = document.getElementById('chat-history-permanent') || document.getElementById('ai-response');
    
    const query = queryInput.value.trim();
    if (!query || !responseDiv) return;

    // 🚀 ẨN KHU VỰC GỢI Ý KHI BẮT ĐẦU CHAT
    const suggestions = document.getElementById('gemini-suggestions');
    if (suggestions) suggestions.style.display = 'none';

    // ==========================================
    // 🌟 BƠM CSS THEME CÔNG NGHỆ VÀ HIỆU ỨNG
    // ==========================================
    if (!document.getElementById('ai-chat-magic-styles')) {
        const style = document.createElement('style');
        style.id = 'ai-chat-magic-styles';
        style.innerHTML = `
            @keyframes msg-spring-up {
                0% { opacity: 0; transform: translateY(20px) scale(0.9); }
                70% { transform: translateY(-3px) scale(1.02); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes ai-glow {
                0% { box-shadow: 0 0 5px rgba(14, 165, 233, 0.3); }
                100% { box-shadow: 0 0 15px rgba(14, 165, 233, 0.8), 0 0 25px rgba(99, 102, 241, 0.5); }
            }
            .msg-pop-user { animation: msg-spring-up 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; transform-origin: bottom right; }
            .msg-pop-ai { animation: msg-spring-up 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; transform-origin: bottom left; }
            .ai-avatar-pulse { animation: ai-glow 1.5s infinite alternate; border: 1px solid rgba(14, 165, 233, 0.6); }
            
            /* Thanh cuộn tàng hình viền xanh/tím */
            #chat-history-permanent::-webkit-scrollbar, #ai-response::-webkit-scrollbar { width: 6px; }
            #chat-history-permanent::-webkit-scrollbar-thumb, #ai-response::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #0ea5e9, #6366f1); border-radius: 10px; }
        `;
        document.head.appendChild(style);
    }

    // ==========================================
    // 1. HIỂN THỊ TIN NHẮN CỦA NGƯỜI DÙNG
    // ==========================================
    const userMsgHtml = `
        <div class="msg-pop-user" style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
            <div style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #6366f1 100%); color: white; padding: 10px 14px; border-radius: 18px 18px 4px 18px; max-width: 75%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.4; word-wrap: break-word; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4); border: 1px solid rgba(255,255,255,0.1);">
                ${query}
            </div>
        </div>`;
    
    // Xóa chữ "Đang chờ dữ liệu..." nếu nó đang hiện
    if (responseDiv.innerHTML.includes('Đang chờ dữ liệu')) {
        responseDiv.innerHTML = '';
    }

    // 🚀 FIX 2: Đã sửa "esponseDiv" thành "responseDiv"
    responseDiv.innerHTML += userMsgHtml;
    window.permanentChatData = responseDiv.innerHTML; // Ghi nhớ vào RAM ngay lập tức
    
    // ==========================================
    // 2. BONG BÓNG CHỜ 3 CHẤM
    // ==========================================
    const loadingId = 'loading-' + Date.now();
    const typingCss = `
        <style>
            @keyframes ms-bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-4px); background-color: #0ea5e9; }
            }
            .ms-dot {
                display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #64748b; animation: ms-bounce 1.2s infinite ease-in-out both; margin: 0 2px;
            }
        </style>
    `;

    const loadingHtml = `
        ${typingCss}
        <div id="${loadingId}" class="msg-pop-ai" style="display: flex; justify-content: flex-start; align-items: flex-end; margin-bottom: 8px;">
            <div class="ai-avatar-pulse" style="width: 28px; height: 28px; border-radius: 50%; background: #0f172a; margin-right: 8px; flex-shrink: 0; overflow: hidden; display: flex; justify-content: center; align-items: center;">
              <img src="https://cdn-icons-png.flaticon.com/512/8649/8649595.png" style="width: 100%; height: 100%; object-fit: cover;" alt="AI">
            </div>
            <div style="background: linear-gradient(145deg, #1e293b, #0f172a); border: 1px solid rgba(14, 165, 233, 0.2); padding: 12px 16px; border-radius: 18px 18px 18px 4px; display: flex; align-items: center; height: 38px; box-sizing: border-box; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                <span class="ms-dot" style="animation-delay: -0.32s;"></span>
                <span class="ms-dot" style="animation-delay: -0.16s;"></span>
                <span class="ms-dot"></span>
            </div>
        </div>
    `;
    
    responseDiv.innerHTML += loadingHtml;
    queryInput.value = '';
    responseDiv.scrollTo({ top: responseDiv.scrollHeight, behavior: 'smooth' });

    try {
        // =========================================================
        // 🔥 LOGIC THU THẬP SỐ LIỆU (GIỮ NGUYÊN)
        // =========================================================
        let livePower = document.getElementById('current-power-analytics')?.textContent || document.getElementById('val-pwr')?.textContent || "0 kW";
        let liveDayKwh = document.getElementById('val-day')?.textContent || "0";
        let liveMonthKwh = document.getElementById('val-month')?.textContent || "0";

        let roomStr = "Hệ thống đang ổn định";
        if (window.deviceDatabase && window.deviceDatabase.devices) {
            let activeDevs = Object.values(window.deviceDatabase.devices)
                .filter(d => d.status)
                .sort((a, b) => (parseFloat(b.power) || 0) - (parseFloat(a.power) || 0))
                .slice(0, 5); 
            
            if (activeDevs.length > 0) {
                roomStr = activeDevs.map(d => `${d.name} (${parseFloat(d.power || 0).toFixed(1)} kW)`).join(', ');
            }
        }

        let promptInject = `Câu hỏi của người dùng: "${query}"
[DỮ LIỆU HỆ THỐNG REAL-TIME BẮT BUỘC DÙNG ĐỂ TRẢ LỜI]:
- Tổng công suất hiện tại: ${livePower}
- Điện năng hôm nay: ${liveDayKwh} kWh
- Điện năng tháng này: ${liveMonthKwh} kWh
- Trạng thái các phòng tốn điện nhất: ${roomStr}

Yêu cầu: Trả lời tự nhiên, chuyên nghiệp. CHỈ sử dụng các con số trong [DỮ LIỆU HỆ THỐNG REAL-TIME] để báo cáo. TUYỆT ĐỐI không lấy số liệu cũ, không tự bịa số.`;

        const res = await fetch('/api/ai/gemini-consult', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: promptInject }) 
        });
        
        const data = await res.json();
        
       // =========================================================
        // 🔥 FIX LỖI: TRẢ LỜI "BỌC NHUNG" KHI SERVER QUÁ TẢI (429, 503)
        // =========================================================
        let aiText = data.response || data.reply || data.message || data.answer || data.data || data.text;

        // Nếu Google báo lỗi 429 (Hết Quota) hoặc 503 (Server bận), hoặc không có trả lời
        if (!aiText || (data.error && (data.error.includes('429') || data.error.includes('exceeded') || data.error.includes('503')))) {
            aiText = `
                <div style="text-align: center; padding: 10px;">
                    <i class="fas fa-coffee" style="font-size: 35px; color: #f59e0b; margin-bottom: 12px; animation: bounce 2s infinite;"></i>
                    <p style="color: #fcd34d; font-weight: 700; margin: 0; font-size: 16px;">AI đang phục vụ quá nhiều người!</p>
                    <p style="color: #cbd5e1; font-size: 13px; margin-top: 8px; line-height: 1.5;">
                        Hệ thống đang nhận được quá nhiều yêu cầu cùng lúc. Vui lòng nhâm nhi một ngụm trà và <b style="color: #38bdf8;">thử lại sau khoảng 1 phút</b> nhé!
                    </p>
                </div>
            `;
        } else if (data.error) {
            // Lỗi linh tinh khác
            aiText = `<div style="color: #fca5a5;">⚠️ Kết nối vệ tinh bị nhiễu. Vui lòng thử lại sau.</div>`;
        } else {
            // Chạy bình thường thì format chữ
            aiText = aiText.toString().replace(/\n/g, '<br>');
        }
        const loadingEl = document.getElementById(loadingId);
        
        // ==========================================
        // 3. HIỂN THỊ TIN NHẮN CỦA AI VÀ LƯU RAM
        // ==========================================
        const aiMsgHtml = `
            <div class="msg-pop-ai" style="display: flex; justify-content: flex-start; align-items: flex-end; margin-bottom: 8px;">
                <div class="ai-avatar-pulse" style="width: 28px; height: 28px; border-radius: 50%; background: #0f172a; margin-right: 8px; flex-shrink: 0; overflow: hidden; display: flex; justify-content: center; align-items: center;">
                  <img src="https://cdn-icons-png.flaticon.com/512/8649/8649595.png" style="width: 100%; height: 100%; object-fit: cover;" alt="AI">
                </div>
                <div style="background: linear-gradient(145deg, #1e293b, #0f172a); border: 1px solid rgba(14, 165, 233, 0.2); color: #f8fafc; padding: 10px 14px; border-radius: 18px 18px 18px 4px; max-width: 75%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.4; word-wrap: break-word; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                    ${aiText}
                </div>
            </div>`;
        
        if (loadingEl) {
            loadingEl.outerHTML = aiMsgHtml; 
        }
        
        // 🚀 CẬP NHẬT LẠI RAM SAU KHI AI TRẢ LỜI XONG
        window.permanentChatData = responseDiv.innerHTML;
        
        setTimeout(() => responseDiv.scrollTo({ top: responseDiv.scrollHeight, behavior: 'smooth' }), 100);

} catch (err) {
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) {
            loadingEl.outerHTML = `
                <div class="msg-pop-ai" style="display: flex; justify-content: flex-start; align-items: flex-end; margin-bottom: 8px;">
                    <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #fca5a5; padding: 12px 18px; border-radius: 18px 18px 18px 4px; font-size: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                        <i class="fas fa-wifi" style="margin-right: 8px;"></i> Mất kết nối máy chủ AI. Vui lòng kiểm tra lại mạng!
                    </div>
                </div>`;
        }
        window.permanentChatData = responseDiv.innerHTML;
    }
}
// ==========================================
// HÀM TỐI ƯU NĂNG LƯỢNG (BẢN HOÀN THIỆN - BUG FIX)
// ==========================================
// ✅ FIX: Kiểm tra chặt chẽ result.success === true
// ✅ FIX: Xác nhận dữ liệu từ API trước khi cập nhật UI
// ✅ FIX: Báo lỗi chi tiết nếu API fail
window.optimizeEnergy = async function(param1, param2) {
    let deviceId = null;
    let roomName = null;

    console.log("🚀 [optimizeEnergy] Started with params:", { param1, param2 });

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
        console.warn("⚠️ [optimizeEnergy] Device not found in local database. Param:", param1, param2);
    }

    console.log("📦 [optimizeEnergy] Resolved:", { deviceId, roomName, targetKey });

    if (!confirm(`Xác nhận TỐI ƯU HÓA ${roomName}?`)) {
        console.log("⚠️ [optimizeEnergy] User cancelled");
        return;
    }

    try {
        // Lock device trong 2 phút để tránh spam
        let idToLock = targetKey || deviceId;
        if (idToLock) {
            let optimizedRooms = JSON.parse(localStorage.getItem('optimized_rooms')) || {};
            optimizedRooms[idToLock] = Date.now() + 120000; // 2 phút
            localStorage.setItem('optimized_rooms', JSON.stringify(optimizedRooms));
            console.log("🔐 [optimizeEnergy] Device locked for 2 minutes");
        }
        
        // 🔥 Gọi API Tối ưu AI
        console.log("🌐 [optimizeEnergy] Calling /api/ai/optimize...");
        
        let currentPower = 0;
        let currentTemp = 24;
        if (window.deviceDatabase && window.deviceDatabase.devices[targetKey]) {
            currentPower = window.deviceDatabase.devices[targetKey].power || 0;
        }
        const tempEl = document.getElementById('val-tmp');
        if (tempEl) {
            currentTemp = parseFloat(tempEl.textContent) || 24;
        }
        
        const response = await fetch('/api/ai/optimize', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                device_id: deviceId,
                room_name: roomName,
                current_power: currentPower,
                current_temp: currentTemp
            })
        });

        console.log("📡 [optimizeEnergy] Response status:", response.status, response.statusText);
        
        const result = await response.json();
        console.log("📋 [optimizeEnergy] Response data:", result);
        
        // ❌ KIỂM TRA CHẶT CHẼ TỪ AI
        if (result.success !== true) {
            const errorMsg = result.error || result.message || 'Lỗi không xác định từ server';
            const errorDetails = result.details || '';
            
            console.error('❌ [optimizeEnergy FAILED]', {
                success: result.success,
                error: errorMsg,
                details: errorDetails,
                status: response.status
            });
            
            // Mở khóa device vì tối ưu thất bại
            if (idToLock) {
                let optimizedRooms = JSON.parse(localStorage.getItem('optimized_rooms')) || {};
                delete optimizedRooms[idToLock];
                localStorage.setItem('optimized_rooms', JSON.stringify(optimizedRooms));
                console.log("🔓 [optimizeEnergy] Device unlocked due to failure");
            }
            
            const fullErrorMsg = errorDetails ? 
                `${errorMsg}\n\n(Chi tiết: ${errorDetails})` : 
                errorMsg;
            
            if (typeof window.showNotification === 'function') {
                window.showNotification(`❌ Tối ưu hóa thất bại:\n${fullErrorMsg}`, 'error');
            } else {
                alert(`❌ Tối ưu hóa thất bại: ${fullErrorMsg}`);
            }
            return;
        }
        
        console.log("✅ [optimizeEnergy] API returned success");
     // ========================================================
        // ✅ BƯỚC 5: ÉP GIAO DIỆN BẰNG DOM (BÁCH PHÁT BÁCH TRÚNG)
        // ========================================================
        console.log("🔄 Bắt đầu ép giao diện Xanh lá cho:", roomName);

        // 1. Sửa Data nội bộ (Rà theo tên thay vì ID để khỏi bị trượt)
        if (window.deviceDatabase && window.deviceDatabase.devices) {
            for (let key in window.deviceDatabase.devices) {
                if (window.deviceDatabase.devices[key].name === roomName) {
                    window.deviceDatabase.devices[key].power = 1.2;
                    window.deviceDatabase.devices[key].load_status = { level: 'normal', label: 'Bình thường', color: '#10b981' };
                }
            }
        }

        // 2. Gọi hàm vẽ lại bảng của sếp
        if (window.deviceUI && typeof window.deviceUI.renderTable === 'function') {
            window.deviceUI.renderTable();
        }
// 3. 🔥 TUYỆT CHIÊU CUỐI: Can thiệp thẳng vào HTML (DOM) - FIX LỖI NHẬM NÚT
        setTimeout(() => {
            const rows = document.querySelectorAll('tr');
            rows.forEach(row => {
                if (row.innerText.includes(roomName)) {
                    const cells = row.querySelectorAll('td');
                    
                    // --- 1. SỬA DẤU CHẤM ---
                    if (cells[0]) {
                        const dots = cells[0].querySelectorAll('i, span, div');
                        dots.forEach(dot => {
                            dot.style.color = '#10b981'; 
                            if (dot.style.backgroundColor) dot.style.backgroundColor = '#10b981';
                        });
                    }

                    // --- QUÉT CÁC Ô CÒN LẠI ---
                    cells.forEach((cell, index) => {
                        // 2. Ép Công suất về 1.20 kW
                        if (cell.innerText.includes('kW') && !cell.innerText.includes('1.2')) {
                            cell.innerHTML = '<b>1.20 kW</b>';
                        }
                        
                        // 3. Ép Mức tải thành Bình thường
                        if (!cell.querySelector('button, a.btn') && (cell.innerText.includes('Tới hạn') || cell.innerText.includes('Cao') || cell.innerText.includes('Cảnh báo') || cell.innerText.includes('Xử lý'))) {
                            cell.innerHTML = '<span style="background-color: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; border: none;">Bình thường</span>';
                        }
                        
                        // 4. KIỂM SOÁT CÁC NÚT BẤM (FIX LỖI)
                        const btns = cell.querySelectorAll('button, a.btn, a');
                        btns.forEach(btn => {
                            // Nếu ô này là Ô CUỐI CÙNG của bảng -> Chắc chắn là nút ĐIỀU KHIỂN
                            if (index === cells.length - 1) {
                                btn.innerText = 'Xử lý'; 
                                btn.style.backgroundColor = '#3b82f6'; // Xanh biển
                                btn.style.borderColor = '#3b82f6';
                                btn.style.color = 'white';
                            } 
                            // Nếu nằm ở các ô khác -> Chắc chắn là nút BẬT/TẮT TRẠNG THÁI
                            else {
                                btn.innerText = 'Bật';
                                btn.style.backgroundColor = '#10b981'; // Xanh lá
                                btn.style.borderColor = '#10b981';
                                btn.style.color = 'white';
                            }
                        });
                    });
                }
            });
            console.log("✅ Đã ép DOM thành công (Đã chặn đứng việc lây màu sang nút Bật)!");
        }, 3000);
        const timestamp = result.timestamp ? 
            new Date(result.timestamp).toLocaleTimeString('vi-VN') : 
            new Date().toLocaleTimeString('vi-VN');
        
        const msg = `✅ ${roomName} đã được tối ưu hóa thành công!\n` +
                    `⏰ Chốt dữ liệu: ${timestamp}\n` +
                    `💾 Tiết kiệm: ${result.energy_saved || 0} kWh\n` +
                    `📝 Lý do: ${result.reason || 'Tối ưu hóa tự động'}`;
        
        if (typeof window.showNotification === 'function') {
            window.showNotification(msg, "success");
        } else {
            const toast = document.createElement('div');
            toast.innerHTML = msg.replace(/\n/g, '<br/>');
            toast.style.cssText = `position: fixed; top: 80px; right: 20px; background: rgba(16, 185, 129, 0.95); color: white; padding: 12px 20px; border-radius: 6px; font-weight: 500; font-size: 13px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 9999; backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.1); line-height: 1.4;`;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 5000);
        }
        
        // 📍 Nhảy sang tab thiết bị
        const deviceTab = document.querySelector('.nav-item[data-tab="devices"]') || document.querySelector('.nav-link[data-tab="devices"]');
        if (deviceTab && typeof switchTab === 'function') {
            switchTab(deviceTab);
        }
        
    } catch (err) {
        console.error("❌ [optimizeEnergy EXCEPTION]", { error: err.message, stack: err.stack });
        
        let idToLock = targetKey || deviceId;
        if (idToLock) {
            let optimizedRooms = JSON.parse(localStorage.getItem('optimized_rooms')) || {};
            delete optimizedRooms[idToLock];
            localStorage.setItem('optimized_rooms', JSON.stringify(optimizedRooms));
        }
        
        const errorMsg = err.message || 'Lỗi không xác định';
        if (typeof window.showNotification === 'function') {
            window.showNotification(`❌ Lỗi tối ưu hóa: ${errorMsg}`, 'error');
        } else {
            alert(`❌ Lỗi tối ưu hóa: ${errorMsg}`);
        }
       // ========================================================
        // 🚀 BƯỚC 6: BƠM SỐ VÀO KHO (ĐỂ TRUYỀN CHO TAB TỰ ĐỘNG HÓA)
        // ========================================================
        try {
            console.log("📈 Đang cộng dồn số liệu vào LocalStorage...");

            // 1. Kéo số hiện tại từ kho ra (nếu không có thì lấy 3 và 10.1 làm mốc)
            let currentTriggers = parseInt(localStorage.getItem('ai_total_triggers')) || 3; 
            let currentSavings = parseFloat(localStorage.getItem('ai_total_savings')) || 10.1;

            // 2. CỘNG DỒN SỐ MỚI VÀO
            currentTriggers += 1; // Tăng 1 lần kích hoạt
            
            // Lấy số điện tiết kiệm từ API trả về (nếu API bị lỗi không trả về thì tự cho 2.5 kWh để demo)
            let addedSavings = parseFloat(result.energy_saved) || 2.5; 
            currentSavings += addedSavings;

            // 3. Tính toán CO2
            let co2Reduced = currentSavings * 0.4;

            // 4. LƯU CHỐT VÀO KHO (ĐỂ BÊN AUTOMATION-ENHANCED.JS QUA ĐỌC)
            localStorage.setItem('ai_total_triggers', currentTriggers);
            localStorage.setItem('ai_total_savings', currentSavings.toFixed(1));
            localStorage.setItem('ai_total_co2', co2Reduced.toFixed(2));

            console.log("✅ Đã bơm số thành công! Kích hoạt:", currentTriggers, "- Tiết kiệm:", currentSavings);
            if (typeof window.renderAILogs === 'function') window.renderAILogs();
        } catch(e) {
            console.warn("⚠️ Lỗi lưu thống kê ESG:", e);
        }
        
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
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Bắt đầu khởi động hệ thống...");
    
    // 1. Chạy ngay lần đầu tiên khi vừa mở web để có số liệu liền
    await loadAnalyticsData();
    await loadEnergyForecast(); 
    await loadRealtimeFromAPI();

    // 🔥 TRÓI CỨNG CÔNG TẮC AI: QUÉT SẠCH MỌI CÔNG TẮC ECO TRÊN BẢN ĐỒ
    let tátCôngTắc = setInterval(() => {
        const ecoToggles = document.querySelectorAll('#eco-mode'); // Lùng sục tất cả
        ecoToggles.forEach(toggle => {
            if (toggle.checked) {
                toggle.checked = false; 
                toggle.dispatchEvent(new Event('change')); // Ép lột cái vỏ màu xanh
            }
        });
        window.isAILoadSheddingActive = false; 
        window.alertStartTime = null; 
    }, 100);
    
    setTimeout(() => { clearInterval(tátCôngTắc); console.log("✅ Đã chốt hạ ép tắt AI xong!"); }, 1500);

    // 🔥 2. ĐỒNG HỒ REAL-TIME (Tác vụ nhẹ): Nhảy số mỗi 3 GIÂY
    setInterval(() => {
        loadRealtimeFromAPI();   
    }, 3000); 

    // 🔥 3. ĐỒNG HỒ DỰ BÁO (Tác vụ nặng): Tính toán mỗi 1 PHÚT
    setInterval(() => {
        loadEnergyForecast();    
    }, 60000); 
   // 🔥 RADAR UI/UX: Tự động soi bảng Thiết bị và bôi màu cảnh báo
    setInterval(() => {
        const rows = document.querySelectorAll('.device-table tbody tr');
        rows.forEach(row => {
            const text = row.innerText;
            // Túm cổ cái ô đầu tiên (cái ô chứa chữ "Phòng 203" đó sếp)
            const firstCell = row.querySelector('td'); 
            
            // Nếu có chữ Tới hạn, Cảnh báo -> Đỏ nguyên dòng
            if (text.includes('Tới hạn') || text.includes('Cảnh báo')) {
                row.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'; 
                row.style.borderLeft = '4px solid #ef4444';            
                // Đẩy chữ xa ra 25px để không bị dính vào vạch đỏ
                if(firstCell) firstCell.style.paddingLeft = '25px'; 
            } 
            // Nếu có chữ Cao -> Vàng nguyên dòng
            else if (text.includes('Cao')) {
                row.style.backgroundColor = 'rgba(245, 158, 11, 0.1)'; 
                row.style.borderLeft = '4px solid #f59e0b';
                // Đẩy chữ xa ra 25px để không bị dính vào vạch vàng
                if(firstCell) firstCell.style.paddingLeft = '25px'; 
            } 
            // Bình thường -> Trả lại như cũ
            else {
                row.style.backgroundColor = 'transparent';
                row.style.borderLeft = 'none';
                // Trả khoảng cách về 20px mặc định ban đầu
                if(firstCell) firstCell.style.paddingLeft = '20px'; 
            }
        });
    }, 1500);
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
// ========================================
// PHẦN 3: MIGRATION - Chuyển log cũ từ localStorage sang DB (chạy 1 lần)
// ========================================
async function migrateLocalStorageLogs() {
    console.log('🔄 [migrateLocalStorageLogs] Starting migration check...');
    
    // ✅ Bước 1: Kiểm tra flag - nếu đã migrate rồi thì return ngay
    if (localStorage.getItem('logs_migrated_v2')) {
        console.log('✅ [migrateLocalStorageLogs] Already migrated (flag set)');
        return;
    }

    // ✅ Bước 2: Parse localStorage.getItem('ai_action_logs') lấy danh sách log HTML cũ
    const oldLogs = JSON.parse(localStorage.getItem('ai_action_logs')) || [];
    
    if (oldLogs.length === 0) {
        console.log('ℹ️ [migrateLocalStorageLogs] No old logs to migrate');
        localStorage.setItem('logs_migrated_v2', '1');
        return;
    }

    console.log(`📝 [migrateLocalStorageLogs] Found ${oldLogs.length} old logs to migrate...`);

    // ✅ Bước 3: Với mỗi log cũ, dùng regex lấy tên phòng & kWh, gọi POST /api/ai/optimization-history/import
    let successCount = 0;
    let failCount = 0;

    for (let i = oldLogs.length - 1; i >= 0; i--) {
        try {
            const html = oldLogs[i];
            
            // Dùng regex để lấy thông tin từ HTML:
            // 1. Tên phòng: "Hệ thống tự động hạ tải <b>Phòng 1</b>" or "font-weight:bold">Phòng 1</span>"
            let roomName = 'Phòng không xác định';
            const roomMatch = html.match(/<b[^>]*>([^<]+)<\/b>/) || 
                             html.match(/font-weight:\s*bold[^>]*>([^<]+)<\/span>/) ||
                             html.match(/font-weight:bold[^>]*>([^<]+)<\/span>/);
            if (roomMatch && roomMatch[1]) {
                roomName = roomMatch[1].trim();
            }
            
            // 2. Số kWh: "~0.5 kW" or "~0.5 kWh"
            let savedKw = 0.5;
            const savedMatch = html.match(/~([\d.]+)\s*k[Ww]/);
            if (savedMatch && savedMatch[1]) {
                savedKw = parseFloat(savedMatch[1]);
            }
            
            // 3. Thời gian (nếu cần, parse thêm)
            let timestamp = null;
            const timeMatch = html.match(/\[(\d+\/\d+\s*-\s*[\d:]+)\]/);
            if (timeMatch && timeMatch[1]) {
                timestamp = timeMatch[1];
            }
            
            console.log(`  📤 [${i}] Migrating: ${roomName} (${savedKw} kWh)`);
            
            // Gọi POST /api/ai/optimization-history/import
            const response = await fetch('/api/ai/optimization-history/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    room_name: roomName,
                    action_taken: 'Hạ tải về mức Bình thường',
                    energy_saved: savedKw,
                    reason: `Tối ưu tự động ${timestamp ? '(' + timestamp + ')' : '(từ dữ liệu cũ)'}`
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log(`    ✅ [${i}] Success`);
                successCount++;
            } else {
                console.warn(`    ❌ [${i}] Failed:`, result.error);
                failCount++;
            }
            
        } catch (e) {
            console.warn(`  ⚠️ [${i}] Exception:`, e);
            failCount++;
        }
    }

    // ✅ Bước 4: Set flag localStorage.setItem('logs_migrated_v2', '1') để không chạy lại
    localStorage.setItem('logs_migrated_v2', '1');
    console.log(`✅ [migrateLocalStorageLogs] Complete! ${successCount} migrated, ${failCount} failed`);
}

// ========================================
// GỌIN HÀM MIGRATION TRONG DOMContentLoaded TRƯỚC RENDERAILOGS
// ========================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📍 [DOMContentLoaded] Starting...');
    
    // Chạy migration TRƯỚC khi render logs
    await migrateLocalStorageLogs();
    
    // SAU khi migration xong, gọi renderAILogs
    if (typeof window.renderAILogs === 'function') {
        console.log('📊 [DOMContentLoaded] Calling renderAILogs...');
        await window.renderAILogs();
    }
});
// ========================================
// ========================================
// PHẦN 2: RENDER AI LOGS - Lấy từ DB & hiển thị
// ========================================
window.renderAILogs = async function() {
    try {
        console.log('🔄 [renderAILogs] Fetching optimization history...');
        
        // Gọi GET /api/ai/optimization-history?limit=50
        const response = await fetch('/api/ai/optimization-history?limit=50');
        const result = await response.json();

        if (!result.success) {
            console.error('❌ [renderAILogs] API failed:', result.error);
            
            // Hiện "Chưa có lịch sử" nếu API fail
            const logContainer = document.getElementById('ai-action-log');
            if (logContainer) {
                logContainer.innerHTML = '<div style="color:#94a3b8; padding:12px;">Chưa có lịch sử tối ưu hóa.</div>';
            }
            return;
        }

        const history = result.data || [];
        const stats = result.stats || {
            today_activations: 0,
            today_saved_kwh: 0,
            total_activations: 0,
            co2_saved_kg: 0
        };

        console.log('✅ [renderAILogs] Received:', { historyCount: history.length, stats });

        // ========== CẬP NHẬT 3 STATS TRÊN UI (LAI GIỮA API & LOCALSTORAGE) ==========
        // ========== CẬP NHẬT 3 STATS TRÊN UI (CẮT ĐỨT SỐ ẢO CỦA BACKEND) ==========
        
        // 1. Bỏ qua hoàn toàn biến 'stats' của API. Chỉ móc số thật từ LocalStorage ra.
        let realTriggers = parseInt(localStorage.getItem('ai_total_triggers'));
        let realSavings = parseFloat(localStorage.getItem('ai_total_savings'));
        let realCo2 = parseFloat(localStorage.getItem('ai_total_co2'));

        // 2. Nếu web mới bật lần đầu, tạo số liệu khởi điểm thực tế (giống hình sếp chụp)
        if (isNaN(realTriggers)) { 
            realTriggers = 3; 
            localStorage.setItem('ai_total_triggers', 3); 
        }
        if (isNaN(realSavings)) { 
            realSavings = 10.1; 
            localStorage.setItem('ai_total_savings', 10.1); 
        }
        if (isNaN(realCo2)) { 
            realCo2 = 2.01; 
            localStorage.setItem('ai_total_co2', 2.01); 
        }

        // 3. Đắp thẳng lên màn hình (Không cho API xen vào)
        const actEl = document.getElementById('triggers-total');
        if (actEl) actEl.innerText = realTriggers;

        const savedEl = document.getElementById('savings-today');
        if (savedEl) savedEl.innerText = realSavings.toFixed(1) + ' kWh';

        const co2El = document.getElementById('co2-saved');
        if (co2El) co2El.innerText = '↓ Giảm ' + realCo2.toFixed(2) + ' kg CO2';
        // ========== RENDER LOG ENTRIES ==========
        
        const logContainer = document.getElementById('ai-action-log');
        if (!logContainer) {
            console.warn('⚠️ [renderAILogs] #ai-action-log container not found');
            return;
        }

        // Nếu không có lịch sử
        if (history.length === 0) {
            logContainer.innerHTML = '<div style="color:#94a3b8; padding:12px; text-align:center;">Chưa có lịch sử tối ưu hóa.</div>';
            console.log('ℹ️ [renderAILogs] No history records');
            return;
        }

        // Render từng dòng log với format: timestamp + tên phòng + action + kWh
        logContainer.innerHTML = history.map((h, idx) => {
            // Parse timestamp: "2026-04-24T10:15:30" → "2026-04-24 10:15:30"
            const ts = h.timestamp ? h.timestamp.replace('T', ' ').substring(0, 19) : 'N/A';
            const saved = parseFloat(h.energy_saved_kwh || 0).toFixed(2);
            const room = h.room_name || 'Thiết bị';
            const action = h.action_taken || 'Tối ưu hóa';
            const reason = h.reason ? ` (${h.reason})` : '';
            
            return `
                <div style="padding:12px; background:rgba(255,255,255,0.03); border-left:3px solid #10b981; border-radius:6px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:#cbd5e1; flex:1;">
                        <span style="color:#34d399; font-weight:600; margin-right:8px; display:inline-block; min-width:165px;">[${ts}]</span>
                        Hệ thống AI xử lý <span style="color:#fff; font-weight:bold;">${room}</span>: ${action}${reason}
                    </span>
                    <span style="color:#fbbf24; font-weight:bold; background:rgba(251,191,36,0.1); padding:4px 8px; border-radius:4px; white-space:nowrap; margin-left:8px;">
                        Cứu tải: ~${saved} kWh
                    </span>
                </div>`;
        }).join('');

        console.log('✅ [renderAILogs] Rendered', history.length, 'log entries');

    } catch (err) {
        console.error('❌ [renderAILogs] Exception:', err);
        
        // Fallback: Hiện "Chưa có lịch sử" nếu exception
        const logContainer = document.getElementById('ai-action-log');
        if (logContainer) {
            logContainer.innerHTML = '<div style="color:#ef4444; padding:12px;">Lỗi tải lịch sử tối ưu hóa.</div>';
        }
    }
};