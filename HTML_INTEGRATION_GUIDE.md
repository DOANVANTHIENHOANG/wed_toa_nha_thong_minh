# HTML Integration Guide - SED V2.1 Components

## 📋 Updated Dashboard Structure

Để tích hợp toàn bộ các component mới vào `templates/dashboard.html`, hãy thêm các phần sau:

---

## 1️⃣ Add CSS & Script Imports (In `<head>`)

```html
<!-- Enhanced UI Styles -->
<link rel="stylesheet" href="/static/enhanced-ui.css">

<!-- Chart.js for real-time charts -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>
```

---

## 2️⃣ Tab Content for "Tự Động Hóa" (Automation)

**Replace or update the automation tab content:**

```html
<div id="automation-tab" class="tab-content">
    <div class="section-header">
        <h2>🤖 Tự Động Hóa Thiết Bị</h2>
        <p>Quản lý lịch trình bật/tắt và tối ưu hóa tự động</p>
    </div>

    <!-- Peak Hour Indicator -->
    <div id="peak-hour-indicator" class="peak-inactive">
        <span>✅ Giờ thấp điểm</span>
        <span>(00:00)</span>
    </div>

    <!-- ECO Mode Button -->
    <div class="section-actions">
        <button id="btn-eco-mode" class="btn-large btn-eco">
            🌱 Kích Hoạt Chế Độ ECO
        </button>
        <button id="btn-add-schedule" class="btn-large btn-primary">
            ➕ Thêm Lịch Trình
        </button>
    </div>

    <!-- Schedules List -->
    <div class="section-content">
        <h3>📅 Lịch Trình Hiện Tại</h3>
        <div id="automation-schedules-list" class="schedules-container">
            <div class="skeleton-container">
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-rect"></div>
            </div>
        </div>
    </div>
</div>
```

---

## 3️⃣ Tab Content for "Phân Tích Gemini" (AI Analysis)

**Replace or update the Gemini analysis tab:**

```html
<div id="gemini-tab" class="tab-content">
    <div class="section-header">
        <h2>🤖 Phân Tích Gemini AI</h2>
        <p>Nhận lời khuyên tối ưu hóa năng lượng từ AI</p>
    </div>

    <!-- Quick Questions -->
    <div class="quick-questions">
        <h4>💡 Câu Hỏi Nhanh:</h4>
        <div class="quick-buttons">
            <button class="quick-question-btn" data-question="Phân tích xem hệ thống có đang lãng phí điện không?">
                📊 Phân tích lãng phí
            </button>
            <button class="quick-question-btn" data-question="Hãy gợi ý 3 cách để tiết kiệm điện.">
                💡 Gợi ý tiết kiệm
            </button>
            <button class="quick-question-btn" data-question="Dự báo tiêu thụ điện cho tuần tới.">
                📈 Dự báo tuần tới
            </button>
            <button class="quick-question-btn" data-question="Thiết bị nào tiêu thụ nhiều điện nhất?">
                ⚡ Top consumers
            </button>
        </div>
    </div>

    <!-- AI Chat Interface -->
    <div class="analysis-interface">
        <div class="input-section">
            <textarea 
                id="analysis-query-input" 
                placeholder="Hỏi tôi bất cứ điều gì về năng lượng..."
                rows="3"
            ></textarea>
            <button id="btn-send-analysis" class="btn-primary">
                🚀 Gửi
            </button>
        </div>

        <!-- Analysis Result -->
        <div id="analysis-result" class="analysis-result">
            <p style="color: var(--text-light);">Hãy gửi một câu hỏi để bắt đầu phân tích...</p>
        </div>

        <!-- Analysis History -->
        <div class="analysis-history">
            <div class="history-header">
                <h4>📜 Lịch Sử Phân Tích</h4>
                <button id="btn-clear-history" class="btn-small">🗑️ Xóa</button>
            </div>
            <div id="analysis-history" class="history-list">
                <p style="color: var(--text-light);">Chưa có lịch sử</p>
            </div>
        </div>
    </div>
</div>
```

---

## 4️⃣ Tab Content for "Cấu Hình Hệ Thống" (Settings)

**Replace or update the settings tab with advanced features:**

```html
<div id="settings-tab" class="tab-content">
    <div class="section-header">
        <h2>⚙️ Cấu Hình Hệ Thống</h2>
        <p>Thiết lập ngưỡng cảnh báo và cài đặt</p>
    </div>

    <!-- Real-time Status -->
    <div class="settings-section">
        <h3>🔴 Trạng Thái Thực Tế</h3>
        <div id="realtime-display" class="realtime-display">
            <div class="skeleton-container">
                <div class="skeleton skeleton-rect"></div>
                <div class="skeleton skeleton-rect"></div>
            </div>
        </div>
    </div>

    <!-- Settings Form -->
    <div class="settings-section">
        <h3>⚙️ Cài Đặt</h3>

        <div class="form-grid">
            <!-- Threshold Setting -->
            <div class="setting-item">
                <label for="threshold-slider">
                    ⚡ Ngưỡng Cảnh Báo Công Suất
                </label>
                <p>Khi công suất vượt giá trị này, hệ thống sẽ cảnh báo</p>
                
                <input 
                    type="range" 
                    id="threshold-slider"
                    min="1" 
                    max="15" 
                    step="0.5"
                    class="slider"
                >
                <div style="display: flex; justify-content: space-between; margin-top: 8px;">
                    <span id="threshold-display">5.0 kW</span>
                    <div class="threshold-indicator">
                        <div id="threshold-indicator" class="progress-fill"></div>
                    </div>
                </div>

                <input 
                    type="number" 
                    id="threshold-input"
                    min="1" 
                    max="15" 
                    step="0.5"
                    placeholder="kW"
                    style="margin-top: 12px;"
                >
            </div>

            <!-- Price Setting -->
            <div class="setting-item">
                <label for="price-per-kwh-input">
                    💰 Giá Tiền Điện
                </label>
                <p>Chi phí cho mỗi kWh (₫/kWh)</p>
                
                <input 
                    type="number" 
                    id="price-per-kwh-input"
                    min="0" 
                    max="10000"
                    placeholder="₫/kWh"
                >
            </div>

            <!-- Schedule Off -->
            <div class="setting-item">
                <label for="schedule-off-input">
                    🕐 Giờ Tắt Mặc Định
                </label>
                <p>Giờ hệ thống tự động tắt (nếu có lệnh)</p>
                
                <input 
                    type="time" 
                    id="schedule-off-input"
                    value="22:00"
                >
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="settings-actions">
            <button id="btn-apply-settings" class="btn-primary">
                💾 Lưu Cài Đặt
            </button>
            <button id="btn-reset-settings" class="btn-secondary">
                🔄 Đặt Lại Mặc Định
            </button>
        </div>
    </div>

    <!-- Alerts Section -->
    <div class="settings-section">
        <h3>⚠️ Cảnh Báo</h3>
        
        <div class="alerts-header" style="display: flex; justify-content: space-between; margin-bottom: 16px;">
            <h4>Cảnh báo gần đây</h4>
            <button id="btn-clear-alerts" class="btn-small">
                🗑️ Xóa Tất Cả
            </button>
        </div>

        <div id="alerts-container" class="alerts-container">
            <div class="skeleton-container">
                <div class="skeleton skeleton-rect"></div>
                <div class="skeleton skeleton-rect"></div>
                <div class="skeleton skeleton-rect"></div>
            </div>
        </div>
    </div>
</div>
```

---

## 5️⃣ Enhanced Analytics Tab (Optional)

**Add ML forecasting to analytics:**

```html
<div id="analytics-tab" class="tab-content">
    <div class="section-header">
        <h2>📊 Phân Tích Dữ Liệu</h2>
        <p>Các biểu đồ thống kê và dự báo</p>
    </div>

    <!-- Time Range Selector -->
    <div class="analytics-controls">
        <label>Khoảng Thời Gian:</label>
        <select id="time-range-selector">
            <option value="24">24 Giờ</option>
            <option value="168">7 Ngày</option>
            <option value="720">30 Ngày</option>
        </select>
    </div>

    <!-- Charts Section -->
    <div class="charts-grid">
        <!-- Consumption Chart -->
        <div class="chart-container">
            <h3>⚡ Tiêu Thụ Điện</h3>
            <canvas id="consumptionChart"></canvas>
        </div>

        <!-- Forecast Chart -->
        <div class="chart-container">
            <h3>📈 Dự Báo 24 Giờ</h3>
            <canvas id="forecastChart"></canvas>
        </div>

        <!-- Device Breakdown -->
        <div class="chart-container">
            <h3>🔍 Phân Tích Theo Thiết Bị</h3>
            <div id="device-breakdown">
                <div class="skeleton-container">
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Anomalies Detection -->
    <div class="analytics-section">
        <h3>🚨 Bất Thường Phát Hiện</h3>
        <div id="anomalies-list">
            <p style="color: var(--text-light);">Đang tải...</p>
        </div>
    </div>
</div>
```

---

## 6️⃣ Add Scripts before `</body>`

```html
<!-- Automation Manager -->
<script src="/static/Automation.js"></script>

<!-- Gemini AI Analysis -->
<script src="/static/GeminiAnalysis.js"></script>

<!-- Advanced Settings -->
<script src="/static/Settings.js"></script>

<!-- Real-time Updates -->
<script>
    // Update real-time stats every 30 seconds
    setInterval(async () => {
        try {
            const response = await fetch('/api/realtime/current');
            const data = await response.json();
            
            if (data.success) {
                // Update dashboard stats
                const pwr = document.getElementById('val-pwr');
                const tmp = document.getElementById('val-tmp');
                
                if (pwr) pwr.textContent = data.current_pwr.toFixed(2);
                if (tmp) tmp.textContent = data.temp.toFixed(1);
            }
        } catch (error) {
            console.error('Error updating real-time stats:', error);
        }
    }, 30000);  // Every 30 seconds
</script>
```

---

## 7️⃣ CSS Classes Reference

**Main Containers:**
- `.section-header` - Section title area
- `.section-content` - Main content area
- `.section-actions` - Action buttons area
- `.tab-content` - Each tab panel

**Components:**
- `.skeleton-container` - Loading skeleton
- `.card` - Content card
- `.btn-primary`, `.btn-secondary` - Button styles
- `.modal-overlay` - Modal background
- `.notification` - Toast notification

---

## 8️⃣ Complete HTML Template (Minimal Example)

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SED V2.1</title>
    <link rel="stylesheet" href="/static/style.css">
    <link rel="stylesheet" href="/static/enhanced-ui.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>
</head>
<body>
    <!-- Sidebar Navigation -->
    <aside class="sidebar">
        <!-- Menu items -->
    </aside>

    <!-- Main Content -->
    <main class="main-content">
        <!-- Stats Cards -->
        <div class="stats-grid">
            <!-- Stat boxes -->
        </div>

        <!-- Tabs -->
        <div class="tabs">
            <div class="tab-buttons">
                <button onclick="switchTab('overview')" class="tab-btn active">📊 Tổng Quan</button>
                <button onclick="switchTab('automation')" class="tab-btn">🤖 Tự Động Hóa</button>
                <button onclick="switchTab('gemini')" class="tab-btn">🤖 Phân Tích AI</button>
                <button onclick="switchTab('settings')" class="tab-btn">⚙️ Cài Đặt</button>
            </div>

            <!-- Tab Contents -->
            <div class="tabs-content">
                <!-- Automation Tab -->
                <div id="automation-tab" class="tab-content">
                    <!-- Content from section 2️⃣ above -->
                </div>

                <!-- Gemini Tab -->
                <div id="gemini-tab" class="tab-content">
                    <!-- Content from section 3️⃣ above -->
                </div>

                <!-- Settings Tab -->
                <div id="settings-tab" class="tab-content">
                    <!-- Content from section 4️⃣ above -->
                </div>
            </div>
        </div>
    </main>

    <!-- Scripts -->
    <script src="/static/Automation.js"></script>
    <script src="/static/GeminiAnalysis.js"></script>
    <script src="/static/Settings.js"></script>
    <script src="/static/main.js"></script>
</body>
</html>
```

---

## ✅ Verification Checklist

After adding all components, verify:

- [ ] `static/Automation.js` loads without error
- [ ] `static/GeminiAnalysis.js` loads without error
- [ ] `static/Settings.js` loads without error
- [ ] `static/enhanced-ui.css` loads without error
- [ ] All HTML `id` attributes match JavaScript references
- [ ] Flask routes are accessible: 
  - [ ] `/api/automation/schedule`
  - [ ] `/api/ai/gemini-analyze`
  - [ ] `/api/settings/update`
  - [ ] `/api/realtime/current`
- [ ] Database includes sample data (run `python init_db.py`)
- [ ] Notifications appear correctly
- [ ] No console errors (F12 → Console)

---

## 🎨 Styling Tips

**Override colors:**
```css
:root {
    --primary: #3b82f6;        /* Primary blue */
    --accent: #10b981;         /* Success green */
    --bg-dark: #0f172a;        /* Background */
    --text-main: #f1f5f9;      /* Main text */
}
```

**Responsive design:**
```css
@media (max-width: 768px) {
    .charts-grid {
        grid-template-columns: 1fr;
    }
}
```

---

**✅ Integration Complete! Your dashboard is now using SED V2.1 features.**
