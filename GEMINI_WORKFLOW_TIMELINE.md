# 🎯 Smart Energy V2.1 - Gemini Workflow - QUICK REFERENCE

## Timeline: From Alert Modal to Success Message

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW EXECUTION TIMELINE                          │
├─────────────────────────────────────────────────────────────────────────┤

T0: 0ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User sees device with RED status (Critical)
  Device: Phòng 101, Power: 4.5 kW
  Status: 🔴 Tới hạn (Critical)
  
Button visible: ⚠️ Cảnh báo

┌─────────────────────────────────────────────────────────────────────────┐
│                         User Action: CLICK                              │
│                    ⚠️ Cảnh báo (Alert Button)                          │
└─────────────────────────────────────────────────────────────────────────┘

T0 + 0ms: MODAL APPEARS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Modal Dialog Created + Displayed:

  ┌─────────────────────────────────────────────────────┐
  │  ⚠️                                                  │
  │  CẢNH BÁO TỚI HẠN                                  │
  │  Thiết bị đang tiêu thụ quá mức công suất          │
  │                                                      │
  │  ┌──────────────────────────────────────────────┐  │
  │  │ Phòng: Phòng 101                             │  │
  │  │ Tầng: Tầng 1                                 │  │
  │  │ Mã thiết bị: CB-L1-01                        │  │
  │  │ Công suất: 4.50 kW                           │  │
  │  └──────────────────────────────────────────────┘  │
  │                                                      │
  │  [✓ Đóng]         [🤖 Hỏi Gemini]                │
  └─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         User Action: CLICK                              │
│                    🤖 Hỏi Gemini (Ask Gemini)                          │
└─────────────────────────────────────────────────────────────────────────┘

T0 + 50ms: BUTTON FUNCTION EXECUTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
openGeminiForDevice() called in DeviceControl.js:

  1. window.currentAlertDevice = {
       id: "P101",
       name: "Phòng 101",
       floor: 1,
       location: "Tầng 1",
       code: "CB-L1-01",
       power: 4.5,
       status: true,
       load_status: { level: "critical", label: "Tới hạn", color: "#ff6b35" },
       last_updated: "2025-04-04T10:30:25.123Z"
     }

  2. geminiNav.click() → Switch to Gemini tab
  
  3. Modal closed automatically

T0 + 50-150ms: TAB SWITCH ANIMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Browser renders Gemini tab, makes it visible

T0 + 150ms: EVENT LISTENER TRIGGERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[data-tab="ai"].addEventListener('click', ...) fires

  → setTimeout(initGeminiChat, 100);

T0 + 250ms: initGeminiChat() BEGINS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Function checks window.currentAlertDevice:
  
  ✅ windowcurrentAlertDevice is NOT null
  ✅ window.currentAlertDevice.id exists ("P101")
  
  → Call showConnecting(device)
  → Fetch ai-response div
  → Generate connection HTML

T0 + 250ms: "CONNECTING" STATE DISPLAYED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User sees immediately (NO BLACK SCREEN):

  ┌──────────────────────────────────────────────────────┐
  │  🤖 AI Phân tích    [Other Tabs...]                 │
  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
  │                                                       │
  │  Content:                                            │
  │                                                       │
  │         ⟲ (spinning)                                 │
  │                                                       │
  │  🤖 Đang kết nối với hệ thống Phòng 101...         │
  │                                                       │
  │  Mã thiết bị: CB-L1-01                              │
  │  Công suất: 4.50 kW                                 │
  │                                                       │
  │  ▓░░░░░░░░░░░░░░░░ (progress bar)                  │
  │                                                       │
  │  ⚙️ Đang phân tích dữ liệu...                       │
  │                                                       │
  └──────────────────────────────────────────────────────┘

  Console output:
    📱 initGeminiChat() - currentAlertDevice: {id: "P101", ...}
    ✅ Processing alert for: Phòng 101

T0 + 250ms → T0 + 1750ms: WAITING PERIOD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User sees spinning animation + progress bar
  Duration: 1500ms (1.5 seconds)
  Animations:
    - gemini-spin: 1.2s rotating spinner
    - gemini-scan: 1.5s progress bar sweep

T0 + 1750ms: generateAnalysis() EXECUTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Analysis function generates structured html:
  
  1. Check device.load_status.level === "critical"
  2. Set colors: Red (#ff6b35), message: "NGAY LẬP TỨC"
  3. Generate HTML with:
     - ⚠️ Nguyên nhân (Reason)
     - 🔥 Rủi ro (Risk)
     - 🛠️ Giải pháp (Solution)

T0 + 1750ms: ADVISORY DISPLAYED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User sees complete analysis:

  ┌──────────────────────────────────────────────────────┐
  │  🤖 AI Phân tích    [Other Tabs...]                 │
  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
  │                                                       │
  │  ┌────────────────────────────────────────────────┐ │
  │  │ 🤖 PHÂN TÍCH GEMINI AI                        │ │
  │  │ Thiết bị: Phòng 101                           │ │
  │  │                                                │ │
  │  │ ⚠️ Nguyên nhân                               │ │
  │  │ Phòng 101 đang tiêu thụ vượt ngưỡng an     │ │
  │  │ toàn do quá tải thiết bị công suất cao.    │ │
  │  │ Công suất: 4.50 kW (Vượt quá 4.0 kW)       │ │
  │  │                                                │ │
  │  │ 🔥 Rủi ro                                    │ │
  │  │ • Nguy cơ chập cháy điện lưới tầng          │ │
  │  │ • Hỏng hóc linh kiện điện tử                │ │
  │  │ • Giảm tuổi thọ của cơ sở hạ tầng điện     │ │
  │  │                                                │ │
  │  │ 🛠️ Giải pháp                                 │ │
  │  │ Tối ưu hóa dòng điện bằng cách cắt giảm    │ │
  │  │ 50% công suất và tạm ngắt các thiết bị      │ │
  │  │ không thiết yếu.                             │ │
  │  │                                                │ │
  │  │ ⏰ 10:30:25 | 📊 Cấp độ: NGAY LẬP TỨC      │ │
  │  └────────────────────────────────────────────────┘ │
  │                                                       │
  │  [❌ Đóng]  [✅ Áp dụng phương pháp xử lý]          │
  │                                                       │
  └──────────────────────────────────────────────────────┘

  CSS Classes Applied:
    - Advisory background: rgba(255, 107, 53, 0.08) [Red tint]
    - Border: 2px solid #ff6b35 [Red]
    - Section backgrounds: rgba(X, Y, Z, 0.1) matching color

┌─────────────────────────────────────────────────────────────────────────┐
│                         User Action: CLICK                              │
│                 ✅ Áp dụng phương pháp xử lý                           │
│                   (Apply Solution Button)                              │
└─────────────────────────────────────────────────────────────────────────┘

T0 + 1750ms + [User waits X seconds]: applyGeminiFixForDevice()
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Button clicked, function executes:

  1. Check window.currentAlertDevice exists ✅
  2. Show toast: 🔧 Cấu hình lại dòng điện cho Phòng 101...
  3. Call deviceUI.applyAIFix(device.id)
     - Device power: 4.5 → 2.25 kW (50% reduction)
     - Device status: critical → normal
     - Update UI row in table
  4. Show success message after 500ms

T0 + 1750ms + X + 500ms: SUCCESS MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User sees success in Gemini tab:

  ┌──────────────────────────────────────────────────────┐
  │  🤖 AI Phân tích    [Other Tabs...]                 │
  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
  │                                                       │
  │  ┌────────────────────────────────────────────────┐ │
  │  │                                                │ │
  │  │              ✅ (pop animation)                │ │
  │  │                                                │ │
  │  │  FIX THÀNH CÔNG                               │ │
  │  │  Phòng 101 đã được cấu hình.                │ │
  │  │  Mức tải: Tới hạn → Bình thường             │ │
  │  │                                                │ │
  │  │  Quay lại Thiết bị & Tải sau 2 giây...      │ │
  │  │                                                │ │
  │  └────────────────────────────────────────────────┘ │
  │                                                       │
  └──────────────────────────────────────────────────────┘

  Also shown:
    - Toast: ✅ Fix thành công!
    - Console: ✅ Device updated: {old_power: 4.5, new_power: 2.25, ...}

T0 + 1750ms + X + 2500ms: AUTO-NAVIGATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Auto-click "Thiết bị & Tải" tab:

  devicesTab.click();
  
  Navigation: Gemini tab → Devices tab (automatic)

T0 + 1750ms + X + 2500ms: VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Device table updated in real-time:

  BEFORE FIX:
    Phòng 101  | Tầng 1     | CB-L1-01 | 4.50 kW | Last: [time] | 🔴 Tới hạn | ⚠️ Cảnh báo

  AFTER FIX:
    Phòng 101  | Tầng 1     | CB-L1-01 | 2.25 kW | Last: [time] | 🟢 Bình thường | 🔧 Xử lý

  Changes:
    ✅ Status color: 🔴 RED  → 🟢 GREEN
    ✅ Status text:  Tới hạn → Bình thường
    ✅ Power kW:     4.50    → 2.25
    ✅ Last updated: [new timestamp]
    ✅ Button:       ⚠️      → 🔧

═══════════════════════════════════════════════════════════════════════════
                         ✨ WORKFLOW COMPLETE ✨
═══════════════════════════════════════════════════════════════════════════
```

---

## Total Time from Click to Completion

| Phase | Duration | Total |
|-------|----------|-------|
| Modal → Gemini tab | ~150ms | 150ms |
| Event listener attachment | ~100ms | 250ms |
| "Connecting" displayed | Immediate | 250ms |
| Scanning animation | 1500ms | 1750ms |
| Advisory generation | Instant | 1750ms |
| User reviews (+ X) | Variable | 1750ms + X |
| Apply button click | Instant | 1750ms + X |
| Fix execution | 500ms | 2250ms + X |
| Success message | 1000ms | 2250ms + X |
| Auto-navigation | 2000ms | 4250ms + X |

**Typical workflow time: 4.25 seconds + user review time**

---

## Color Scheme by Severity

### **CRITICAL (RED)**
```css
Primary: #ff6b35
Background: rgba(255, 107, 53, 0.08)
Border: 2px solid #ff6b35
Section BG: rgba(255, 107, 53, 0.1)
Text: #cbd5e1

Recommendation: NGAY LẬP TỨC (Immediately)
Power reduction: 50%
```

### **HIGH (ORANGE)**
```css
Primary: #f59e0b
Background: rgba(245, 158, 11, 0.08)
Border: 2px solid #f59e0b
Section BG: rgba(245, 158, 11, 0.1)
Text: #cbd5e1

Recommendation: SAU 1 GIỜ (After 1 hour)
Power reduction: 30%
```

### **NORMAL (GREEN)**
```css
Primary: #10b981
Background: rgba(16, 185, 129, 0.08)
Border: 2px solid #10b981
Section BG: rgba(16, 185, 129, 0.1)
Text: #cbd5e1

Recommendation: KHÔNG CẦN (Not needed)
Power reduction: None
Buttons: No fix button (only Close)
```

---

## Key Variables & Functions

| Item | Location | Purpose |
|------|----------|---------|
| `window.currentAlertDevice` | GeminiAnalysis.js L11 | Global device storage |
| `initGeminiChat()` | GeminiAnalysis.js L30 | Main init function |
| `showConnecting()` | GeminiAnalysis.js L55 | Display connection state |
| `generateAnalysis()` | GeminiAnalysis.js L92 | Create advisory HTML |
| `applyGeminiFixForDevice()` | GeminiAnalysis.js L240 | Execute fix |
| `openGeminiForDevice()` | DeviceControl.js L346 | Modal button handler |
| `deviceUI.applyAIFix()` | DeviceControl.js L370 | Power reduction function |

---

## Browser Console Signature

When workflow executes successfully, console shows:

```javascript
✓ GeminiAnalysis module loading...
🔄 Gemini tab clicked, initializing...
📱 initGeminiChat() - currentAlertDevice: {id: "P101", name: "Phòng 101", ...}
✅ Processing alert for: Phòng 101
📊 Generating analysis for: {...}
⚡ Applying fix: P101
✅ Device updated: {old_power: 4.5, new_power: 2.25, old_status: "critical", new_status: "normal"}
✅ GeminiAnalysis V2 - Event-driven initialization loaded
```

If you see different logs, check specific issue in debugging section of main fix document.

