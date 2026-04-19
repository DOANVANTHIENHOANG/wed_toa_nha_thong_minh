# ✅ Smart Energy V2.1 - Gemini Fix VERIFICATION CHECKLIST

## Pre-Testing Setup

- [ ] Dashboard accessible at `http://192.168.1.19:3000`
- [ ] Can login with `admin` / `123`
- [ ] Device table visible with multiple rooms (Phòng 101, 102, etc.)
- [ ] Browser Developer Tools (F12) ready to check console
- [ ] Clear any cache (Ctrl+Shift+Delete) if on same domain

---

## Step 1: Locate Critical Device (🔴 RED Status)

### What to look for:
- Device with **RED** color indicator
- Status label shows: **Tới hạn** (Critical)
- Mức tải column shows: **🔴 Tới hạn**
- Power value typically > 4.0 kW

### Verification:
- [ ] Found at least one device with red status
- [ ] Device power visible (e.g., "4.5 kW")
- [ ] Device name visible (e.g., "Phòng 101")
- [ ] ⚠️ Button visible (should say "⚠️ Cảnh báo")

### If no red devices:
- Filter by Mức tải: Select "Cao" or "Tới hạn"
- Or wait 30 seconds for power to fluctuate to critical
- Or manually edit in browser DevTools to test

---

## Step 2: Click Alert Button (🔄 Modal Opens)

### Action:
1. Click **⚠️ Cảnh báo** button on critical device row
2. Modal dialog should appear overlaying the entire screen

### Verify Modal Content:
- [ ] Modal appears with dark background (rgba(0,0,0,0.7))
- [ ] ⚠️ Icon displayed (large, 50px font-size)
- [ ] Title: "CẢNH BÁO TỚI HẠN" (in red)
- [ ] Subtitle: "Thiết bị đang tiêu thụ quá mức công suất"
- [ ] Red box containing device info visible:
  - [ ] "Phòng: [Name]" shown correctly
  - [ ] "Tầng: [Floor]" shown correctly
  - [ ] "Mã thiết bị: [Code]" shown correctly
  - [ ] "Công suất: [Power] kW" shown correctly
- [ ] Two buttons at bottom:
  - [ ] ✓ Đóng (Close button - left)
  - [ ] 🤖 Hỏi Gemini (Ask Gemini button - right)

### Browser Console at this step:
- No new errors expected
- Previous logs should be visible

---

## Step 3: Click "Hỏi Gemini" Button (🔄 Gemini Tab Opens)

### Action:
1. Click **🤖 Hỏi Gemini** button on modal
2. Immediately observe what happens next

### Verify Initial State (Should be INSTANT - no delay):
- [ ] Modal closes automatically
- [ ] Browser switches to Gemini tab (🤖 AI Phân tích becomes active)
- [ ] **TAB NOT BLANK** - content appears immediately
- [ ] **NO BLACK SCREEN** should appear

### Verify "Connecting" Message:
Expected to see:

```
          ⟲ (spinning circle)
         
🤖 Đang kết nối với hệ thống [Room Name]...

Mã thiết bị: [Code]
Công suất: [Power] kW

▓░░░░░░░░░░░░░░░░ (progress bar animating left-to-right)

⚙️ Đang phân tích dữ liệu...
```

### Verify Animation:
- [ ] Spinner rotates continuously
- [ ] Progress bar scans across
- [ ] Message is readable (good contrast)
- [ ] All text visible, not cut off

### Browser Console at this step:
- [ ] See log: `✓ GeminiAnalysis module loading...`
- [ ] See log: `🔄 Gemini tab clicked, initializing...`
- [ ] See log: `📱 initGeminiChat() - currentAlertDevice: {id: "...", ...}`
- [ ] See log: `✅ Processing alert for: [Room Name]`

---

## Step 4: Wait for Analysis (⏱️ 1.5 Seconds)

### Action:
1. Wait approximately 1.5 seconds
2. Watch "Connecting" state change to advisory
3. **Do not click anything during this wait**

### Verify Transition Timing:
- [ ] "Connecting" message visible for ~1.5s
- [ ] Animation continues smoothly
- [ ] No freezing or lag
- [ ] Then advisory appears

### Verify Advisory Display:
After 1.5 seconds, should see:

```
┌───────────────────────────────────┐
│ 🤖 PHÂN TÍCH GEMINI AI           │
│ Thiết bị: [Room Name]             │
│                                   │
│ ⚠️ Nguyên nhân                   │
│ [Red box with explanation]        │
│                                   │
│ 🔥 Rủi ro                        │
│ [Red box with bullet points]      │
│                                   │
│ 🛠️ Giải pháp                     │
│ [Red box with solution]           │
│                                   │
│ ⏰ [Time] | 📊 Cấp độ: NGAY...  │
└───────────────────────────────────┘

[❌ Đóng]  [✅ Áp dụng...]
```

### Verify Content:
- [ ] Advisory box has RED border (#ff6b35)
- [ ] Advisory background has red tint (rgba(255,107,53,0.08))
- [ ] 🤖 icon visible
- [ ] "PHÂN TÍCH GEMINI AI" title visible
- [ ] Thiết bị name shown
- [ ] Three sections present:
  - [ ] ⚠️ Nguyên nhân with explanation
  - [ ] 🔥 Rủi ro with bullet list
  - [ ] 🛠️ Giải pháp with recommendation
- [ ] Bottom shows: Timestamp + "Cấp độ khuyến cáo: NGAY LẬP TỨC"
- [ ] Two buttons:
  - [ ] ❌ Đóng (Close - light gray)
  - [ ] ✅ Áp dụng phương pháp xử lý (Apply - RED button)

### Browser Console at this step:
- [ ] See log: `📊 Generating analysis for: {...}`

### Advisory Content Verification (Critical Status):
- [ ] **Cause**: Mentions "vượt ngưỡng an toàn" + power > 4.0 kW
- [ ] **Risk**: Lists dangers (chập cháy, linh kiện, tuổi thọ)
- [ ] **Solution**: Mentions "cắt giảm 50% công suất"
- [ ] **Recommendation**: Shows "NGAY LẬP TỨC" (red label)

### Color Scheme Verification:
For CRITICAL severity:
- [ ] Primary color is RED (#ff6b35)
- [ ] Border is RED
- [ ] Section backgrounds have red tint
- [ ] Text is readable (white/light gray on dark)

---

## Step 5: Click Apply Button (⚡ Fix Executes)

### Action:
1. Click **✅ Áp dụng phương pháp xử lý** button
2. Observe what happens next

### Verify Immediate Feedback:
- [ ] Toast notification appears (top-right):
  - [ ] Message: "🔧 Cấu hình lại dòng điện cho [Room Name]..."
  - [ ] Color: Blue (#3b82f6)
  - [ ] Auto-disappears after 3 seconds
- [ ] Toast has slide-in animation (from right)

### Verify Success Message (after ~500ms):
Should see:

```
            ✅ (pop animation)
            
FIX THÀNH CÔNG
[Room Name] đã được cấu hình.
Mức tải: Tới hạn → Bình thường

Quay lại Thiết bị & Tải sau 2 giây...
```

### Verify Success Display:
- [ ] ✅ checkmark appears with pop animation
- [ ] Background has green tint (rgba(16,185,129,0.12))
- [ ] Border is GREEN (#10b981)
- [ ] Title: "FIX THÀNH CÔNG"
- [ ] Room name displayed
- [ ] Shows status change: "Tới hạn → Bình thường"
- [ ] Countdown message visible: "Quay lại Thiết bị & Tải sau 2 giây..."

### Browser Console at this step:
- [ ] See log: `⚡ Applying fix: [Room ID]`
- [ ] See log: `🔧 Cấu hình lại dòng điện...`
- [ ] See log: `✅ Device updated: {old_power: X, new_power: Y, old_status: "critical", new_status: "normal"}`
- [ ] See log: `✅ Fix thành công!` (in success toast)

### Verify Success Toast:
- [ ] Another toast appears (top-right):
  - [ ] Message: "✅ Fix thành công!"
  - [ ] Color: Green (#10b981)
  - [ ] Auto-disappears after 3 seconds

---

## Step 6: Auto-Navigation (🔄 Return to Devices)

### Action:
1. Wait 2 seconds after success message
2. **Do not click anything** - auto-navigation should happen

### Verify Auto-Navigation:
- [ ] After 2 seconds, automatically switches to "Thiết bị & Tải" tab
- [ ] Gemini tab is deselected
- [ ] Devices table is now visible
- [ ] No user interaction needed (fully automatic)

### Browser Console at this step:
- [ ] See any auto-nav logs if implemented

---

## Step 7: Verify Device Modification

### What to look for in device table:

#### BEFORE FIX:
```
Phòng 101 | Tầng 1 | CB-L1-01 | 4.50 kW | 🔴 Tới hạn | ⚠️ Cảnh báo
```

#### AFTER FIX:
```
Phòng 101 | Tầng 1 | CB-L1-01 | 2.25 kW | 🟢 Bình thường | 🔧 Xử lý
```

### Verify All Changes:
- [ ] **Power changed**: 4.50 → 2.25 kW (50% reduction for critical)
- [ ] **Status color**: RED (🔴) → GREEN (🟢)
- [ ] **Status text**: "Tới hạn" → "Bình thường"
- [ ] **Status label**: Now shows green "Bình thường"
- [ ] **Button changed**: "⚠️ Cảnh báo" → "🔧 Xử lý"
- [ ] **Timestamp updated**: Last updated time is recent (just now)

### Row Styling Verification:
- [ ] Row NOT highlighted in red anymore
- [ ] Row shows normal colors
- [ ] All text readable
- [ ] No visual artifacts

---

## Full Workflow Test Summary

### ✅ Complete Success Checklist:

- [ ] Device with red status found
- [ ] Alert modal opens with correct info
- [ ] Clicking "Hỏi Gemini" closes modal instantly
- [ ] Gemini tab opens (NO BLACK SCREEN)
- [ ] "Đang kết nối..." message appears immediately
- [ ] Spinner and progress bar animate
- [ ] Advisory displays after 1.5 seconds
- [ ] Advisory has red styling (critical)
- [ ] Content shows Cause/Risk/Solution
- [ ] Apply button visible and clickable
- [ ] Clicking apply shows success toast
- [ ] Success message appears with green styling
- [ ] Auto-navigation to Devices tab after 2 seconds
- [ ] Device table shows updated power (50% reduction)
- [ ] Device status changed RED → GREEN
- [ ] Device button changed from alert to handle
- [ ] Console logs show expected messages
- [ ] No error messages in console
- [ ] No black screens at any point
- [ ] All animations smooth, no lag

---

## 🚨 Troubleshooting Guide

### Issue: BLACK SCREEN on Gemini tab

**Likely causes:**
1. GeminiAnalysis.js not loaded
2. Event listener not attached
3. `ai-response` div missing or hidden

**Fix:**
1. Check console: `typeof initGeminiChat` should show `"function"`
2. Check: `document.querySelector('[data-tab="ai"]')` should return element
3. Check: `document.querySelector('#ai-response')` should return div
4. Clear cache (Ctrl+Shift+Delete) and reload

### Issue: "Hỏi Gemini" button doesn't switch tabs

**Likely causes:**
1. `openGeminiForDevice()` not defined
2. Gemini tab selector wrong

**Fix:**
1. Check console: `typeof deviceUI.openGeminiForDevice` should be `"function"`
2. Verify tab selector: `document.querySelector('[data-tab="ai"]')` returns element
3. Check DeviceControl.js loaded before GeminiAnalysis.js

### Issue: "Đang kết nối..." appears but advisory never shows

**Likely causes:**
1. `generateAnalysis()` not defined
2. API call failing (if applicable)
3. Timing issue (analyzed not running after 1.5s)

**Fix:**
1. Wait 2 full seconds, not just 1.5
2. Check console for error messages
3. Click date field to see if currentAlertDevice still has data

### Issue: Apply button doesn't reduce power

**Likely causes:**
1. `deviceUI.applyAIFix()` not found
2. Device object missing from `window.currentAlertDevice`

**Fix:**
1. Check console: `typeof deviceUI` should be `"object"`
2. Check: `typeof deviceUI.applyAIFix` should be `"function"`
3. Before clicking apply, check: `window.currentAlertDevice` in console

### Issue: Device doesn't update in table

**Likely causes:**
1. `updateDeviceRow()` not updating UI
2. Device registry not refreshed
3. Table cached

**Fix:**
1. Manually click a filter to refresh table
2. Reload page
3. Check that database device object was modified (console: `deviceDatabase.getDevice('P101').power`)

---

## Success Indicators (All Should Be Present)

| Indicator | Status | Expected |
|-----------|--------|----------|
| No black screen | ✅ | Tab loads with content |
| Instant "connecting" | ✅ | Message within 250ms |
| Advisory displays | ✅ | Full content after 1.5s |
| Colors match severity | ✅ | Red for critical |
| Animations smooth | ✅ | No lag, continuous |
| Apply button works | ✅ | Success message appears |
| Power reduces | ✅ | 4.5 → 2.25 (critical) |
| Status changes | ✅ | RED → GREEN |
| Auto-navigates | ✅ | Back to Devices after 2s |
| Console clean | ✅ | No undefined/errors |
| Mobile responsive | ✅ | Works on mobile too |

---

## Final Verification

Once all steps pass, the Gemini analysis workflow is **FULLY FUNCTIONAL**.

🎉 **Celebrate!** The black screen bug is fixed!

If any step fails, refer to troubleshooting and report specific console errors.

