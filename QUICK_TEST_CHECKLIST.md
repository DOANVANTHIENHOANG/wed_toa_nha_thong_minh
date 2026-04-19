# ⚡ QUICK TEST CHECKLIST

**Last Updated**: April 8, 2026

---

## 🚀 BEFORE YOU START

```
1. Press Ctrl+Shift+R (Hard Refresh - Clear Cache)
2. Press F12 (Open Developer Tools)
3. Go to Console tab (keep it open)
4. Ready? Let's test!
```

---

## ✅ TEST MATRIX (5 min setup)

### **Tab 1: OVERVIEW** (1 min)
```
Expected:
  ☐ Charts visible
  ☐ Stats showing (Power, Temp, Daily, Monthly)
Console:
  ☐ No errors
```
**Action**: Click "📊 Tổng quan" tab

---

### **Tab 2: DEVICES** (2 min)
```
Expected:
  ☐ 25 devices shown in table
  ☐ Text doesn't overlap
  ☐ Status badges colored correctly
  ☐ ⚠️ buttons visible for critical
Console:
  ☐ No errors
  ☐ Logs: "Loading devices..."
```
**Action**: Click "⚙️ Thiết bị & Tải" tab, scroll down

---

### **Tab 3: GEMINI WORKFLOW** (3 min - MOST IMPORTANT)
```
Expected:
  ☐ Find device with 🔴 RED (critical)
  ☐ Click ⚠️ button
  ☐ Modal appears
  ☐ Click "🤖 Hỏi Gemini" button
  ☐ Modal closes (dark overlay gone)
  ☐ Gemini tab switches
  ☐ "🤖 Đang kết nối..." shows
  ☐ After 1.5s: Advisory appears (3 sections)
  ☐ Click "✅ Áp dụng" button
  ☐ Power drops 50% (3.17 → 1.59)
  ☐ Status: 🔴 → 🟢
  ☐ Auto-navigate to Devices tab
Console:
  ☐ Log: "Opening Gemini for device:"
  ☐ Log: "Gemini tab clicked"
  ☐ Log: "Processing alert for:"
  ☐ No errors
```
**Action**: Go to Devices tab, find 🔴 device, follow workflow

---

### **Tab 4: AUTOMATION** (1 min)
```
Expected:
  ☐ 3 scenario cards visible
  ☐ Each has toggle switch
  ☐ Stats show counts
  ☐ No errors in loading
Console:
  ☐ Log: "AutomationManager V5.0"
  ☐ No errors
```
**Action**: Click "🤖 Tự động hóa" tab

---

### **Tab 5: ANALYTICS** (30 sec)
```
Expected:
  ☐ Charts/comparisons visible
  ☐ No layout breaks
Console:
  ☐ No errors
```
**Action**: Click "📈 Phân tích" tab

---

### **Tab 6: SETTINGS** (30 sec)
```
Expected:
  ☐ Settings form visible
  ☐ Input fields visible
Console:
  ☐ No errors
```
**Action**: Click "⚙️ Cài đặt" tab

---

## 🎯 PASS/FAIL CRITERIA

### ✅ ALL TESTS PASS IF:
- [ ] All 6 tabs switch smoothly
- [ ] Devices table shows 25 items with no overlaps
- [ ] Gemini workflow works end-to-end
- [ ] Power changes from 🔴 to 🟢
- [ ] Auto-navigation back to Devices works
- [ ] Console shows NO RED ERRORS

### ❌ TEST FAILS IF:
- [ ] Any tab doesn't switch
- [ ] Text overlaps in devices table
- [ ] Modal doesn't close when clicking button
- [ ] Gemini tab doesn't switch automatically
- [ ] Advisory doesn't appear after 1.5s
- [ ] Apply button doesn't work
- [ ] Any RED error in console (F12)

---

## 🔴 IF ERROR: Diagnostic Steps

### **Error: "Gemini tab doesn't switch"**
```
Console check:
  Type: currentAlertDevice
  Should show: {id: "...", name: "Phòng...", ...}
  
If shows null or undefined → Device data not passed
```

### **Error: "Dark overlay stays"**
```
Console check:
  Inspect modal: document.getElementById('critical-alert-modal-...')
  Should be: null (after clicking)
  
If exists → Modal not removed properly
```

### **Error: "Advisory doesn't appear"**
```
Console check:
  Look for: "initGeminiChat()"
  Should show: "Processing alert for: [Device Name]"
  
If missing → Event listener not triggered
```

### **Error: "Red console errors"**
```
Report exact error message:
  - Function name if "undefined function"
  - Element ID if "element not found"
  - Line number from error trace
```

---

## 💡 QUICK FIXES

| Problem | Quick Fix |
|---------|-----------|
| Page looks wrong | F5 reload or Ctrl+Shift+R hard refresh |
| Scripts not loaded | Check Network tab in DevTools (F12 Network) |
| Functions undefined | Make sure all 3 JS files loaded: DeviceControl, GeminiAnalysis, Automation |
| Modal stuck | Reload page, cookies might be cached |

---

## 📊 Console Commands for Advanced Testing

```javascript
// List all devices
deviceDatabase.devices

// Count devices
Object.keys(deviceDatabase.devices).length

// Get a specific device
deviceDatabase.getDevice('phong_101')

// Test modal creation
deviceUI.showCriticalAlertModal(deviceDatabase.getDevice('phong_202'))

// Test Gemini init manually
window.currentAlertDevice = deviceDatabase.getDevice('phong_202')
window.switchTab(document.querySelector('[data-tab="ai"]'))
initGeminiChat()

// Check Automation manager
window.automationManagerV5
window.automationManagerV5.scenarios
```

---

## ✨ EXPECTED CONSOLE OUTPUT

Open F12 → Console during page load:
```
🚀 Loading devices...
✓ Device loading complete
✅ Gemini tab event listener attached
🚀 AutomationManager V5.0 - Enhanced Professional Edition
```

When testing Gemini workflow:
```
🔄 Opening Gemini for device: phong_202 {id: "phong_202", name: "Phòng 202", ...}
🤖 Clicking Gemini tab to trigger analysis...
🔄 Gemini tab clicked, initializing...
📱 initGeminiChat() - currentAlertDevice: {id: "phong_202", ...}
✅ Processing alert for: Phòng 202
```

---

## ⏱️ EXPECTED TIMINGS

| Action | Duration |
|--------|----------|
| Page load | < 2 seconds |
| Device table render | < 1 second |
| Tab switch | Instant (< 200ms) |
| Modal open | Instant |
| "Đang kết nối..." to Advisory | 1.5 seconds |
| Apply button to success toast | 0.5 seconds |
| Auto-navigate delay | 2 seconds |
| Automation load | 2-3 seconds |

---

## 🎓 WHAT WAS FIXED

1. ✅ Modal doesn't stick (overlay clears)
2. ✅ Button properly calls function
3. ✅ Table text doesn't overlap
4. ✅ Gemini tab switches automatically
5. ✅ Event listeners attach correctly
6. ✅ Automation initializes properly

**Result**: All tabs and all workflows should work perfectly!

---

**Questions? Check console (F12) for specific error messages!**
