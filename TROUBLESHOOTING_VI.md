# SED V2.1 - Troubleshooting Checklist & Debug Guide

## 🚨 Common Issues & Solutions

### Issue 1: "Backend server not available" message in Frontend

**Symptoms:**
- Frontend shows "Backend server not available" error
- Console shows "Failed to fetch" errors
- Dashboard doesn't load any data

**Diagnosis Steps:**
```powershell
# Step 1: Check if Backend is running
python app.py
# Expected: "Running on http://127.0.0.1:3000"

# Step 2: Test API endpoint
Invoke-WebRequest 192.168.1.19:3000login -ErrorAction SilentlyContinue
# Expected: HTTP 200 response

# Step 3: Run test script
. .\test_api.ps1
```

**Solutions:**

✅ **Solution A: Start Backend**
```powershell
# In a NEW PowerShell window:
cd "d:\wed toà nhà thông minh"
. .\.venv\Scripts\Activate.ps1
python app.py

# Should see: "Running on http://127.0.0.1:3000"
```

✅ **Solution B: Check Port 5000**
```powershell
# Check if port 5000 is in use
netstat -ano | findstr :3000

# If port is in use:
# Kill the process: taskkill /PID <PID> /F
```

✅ **Solution C: Verify CORS is enabled**
- Open Browser Console (F12)
- Look for error: "Access to XMLHttpRequest blocked by CORS"
- If seen: `app.py` doesn't have CORS enabled
- Fix: Check app.py lines 17-23 have `from flask_cors import CORS`

✅ **Solution D: Clear Browser Cache**
```javascript
// In Browser Console:
localStorage.clear()
sessionStorage.clear()
// Then refresh page
```

---

### Issue 2: KeyError: 'today_kwh' in Terminal

**Symptoms:**
- Terminal shows: `KeyError: 'today_kwh'` at line 357
- Frontend shows 500 error when loading stats
- Dashboard stat cards are empty

**Root Cause:** Backend is trying to access dict key that doesn't exist

**Solution:**
```python
# Check if app.py line 357-363 has safe access pattern:
system_data.get('today_kwh', 14.5)  # ✓ CORRECT - has default
system_data['today_kwh']             # ✗ WRONG - raises KeyError

# Verify all these lines exist in get_stats():
today_kwh = system_data.get('today_kwh', 14.5)
month_kwh = system_data.get('month_kwh', 420.8)
temp = realtime_data.get('temp', 24.5)
current_pwr = realtime_data.get('current_pwr', 1.8)
```

**Fix:**
```powershell
# Restart Backend to reload app.py
# Stop current process: Ctrl+C
# Restart: python app.py
```

---

### Issue 3: "Unauthorized" / "Please login" message

**Symptoms:**
- All API calls return 401 Unauthorized
- Redirected to /login page on every action
- Dashboard is blank

**Root Cause:** Session not set or expired

**Solution:**

✅ **Step 1: Login with correct credentials**
- Username: `admin`
- Password: `123`
- (or username: `user`, password: `123`)

✅ **Step 2: Check Browser Cookies**
```javascript
// In Browser Console:
document.cookie
// Should show "session=..." value

// If empty, login again
```

✅ **Step 3: Verify @require_login decorator**
```python
# Check app.py has decorator on all /api/* routes:
@app.route('/api/stats')
@require_login  # ✓ Must be present
def get_stats():
    pass
```

---

### Issue 4: Chart not displaying or empty

**Symptoms:**
- Chart canvas renders but no data shown
- Chart shows blank or loading state
- Console error about Chart.js

**Solution:**

✅ **Verify Chart.js library is loaded:**
```html
<!-- Check in dashboard.html:-->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

✅ **Check initChart() function:**
```javascript
// Browser Console:
console.log(energyChart)  // Should not be undefined
console.log(energyChart.data.labels)  // Should have data
energyChart.update()  // Force refresh
```

✅ **Manual test endpoint:**
```powershell
# Call API directly
$response = Invoke-WebRequest 192.168.1.19:3000api/stats `
    -Headers @{"Content-Type" = "application/json"}
$response.Content | ConvertFrom-Json  # Check if data exists
```

---

### Issue 5: "AI Chat" returns empty or weird responses

**Symptoms:**
- AI Chat queries return "Không thể xác định"
- Responses don't match questions
- API returns empty data

**Solution:**

✅ **Check ai_chat() function in app.py (lines ~560-610):**
```python
# Should have keywords for Vietnamese responses:
if 'công suất' in message.lower():
    return {'response': 'Công suất hiện tại...'}

if 'nhiệt độ' in message.lower():
    return {'response': 'Nhiệt độ hiện tại...'}
```

✅ **Test AI endpoint directly:**
```powershell
$payload = @{message = "Tổng công suất?"} | ConvertTo-Json
Invoke-WebRequest 192.168.1.19:3000api/ai-chat `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $payload
```

✅ **Check message parameter:**
```javascript
// In dashboard.html askAI() function - should send:
{message: query}  // ✓ CORRECT
// NOT:
{query: query}    // ✗ WRONG
```

---

### Issue 6: Frontend shows "Loading..." forever

**Symptoms:**
- Dashboard stuck on "Loading..." message
- Spinner spinning forever
- No data appears

**Root Cause:** API call never completes (timeout or no response)

**Solution:**

✅ **Check API endpoint timeout:**
```javascript
// In main.js, increase fetch timeout:
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000);  // 10 seconds

fetch(url, { signal: controller.signal })
    .finally(() => clearTimeout(timeoutId))
```

✅ **Check network tab (F12 → Network):**
- Look for /api/stats request
- If "pending" or red: Backend not responding
- If 200: Response body should show data

✅ **Manual API test:**
```powershell
# Time the response
Measure-Command {
    Invoke-WebRequest 192.168.1.19:3000api/stats
}
# Should complete in <1 second
```

---

## 🔧 Quick Diagnostic Commands

### Check Python environment:
```powershell
python --version  # Should be 3.x
pip list | findstr -E "Flask|scikit-learn|flask-cors"  # Check packages
```

### Check port 5000:
```powershell
# Find what's using port 5000
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue

# Kill process using port 5000
Get-Process -Name "python" | Stop-Process -Force
```

### Clear all data and reset:
```powershell
# Stop Backend (Ctrl+C in Flask terminal)
# Delete cache
Remove-Item -Path "D:\wed_toa_nha_thong_minh\.pytest_cache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "D:\wed_toa_nha_thong_minh\__pycache__" -Recurse -Force -ErrorAction SilentlyContinue

# Restart Backend
python app.py
```

---

## 📋 Full Debugging Workflow

When something breaks:

1. **Check Backend is running:**
   ```powershell
   # Terminal 1: Does Flask show "Running on..."?
   ```

2. **Test API with curl/PowerShell:**
   ```powershell
   # Terminal 2: Test raw API
   . .\test_api.ps1
   ```

3. **Check Browser Console (F12):**
   - JavaScript errors?
   - Network tab shows failed requests?
   - CORS errors?

4. **Check Flask Terminal Output:**
   - Any Python exceptions?
   - KeyError messages?
   - Traceback showing line numbers?

5. **Review app.py**
   - All @require_login decorators present?
   - Safe dict access with .get()?
   - CORS configuration enabled?

6. **Clear browser cache and logout/login:**
   ```javascript
   // Browser Console:
   localStorage.clear()
   sessionStorage.clear()
   // Then manually logout and login again
   ```

---

## ✅ Verification Checklist

Run through this to confirm everything works:

- [ ] Backend running: `python app.py` shows "Running on http://127.0.0.1:3000"
- [ ] Frontend accessible: Browser shows login page at 192.168.1.19:3000login
- [ ] Login works: Admin login with admin/123 goes to dashboard
- [ ] Stats load: Stat cards show power, temperature, today kWh, month kWh values
- [ ] Chart displays: Energy chart shows time-series line graph
- [ ] Device list loads: Device list in "Thiết bị & Tải" tab shows 5+ devices
- [ ] AI chat works: Message "Công suất?" returns response without error
- [ ] Settings save: Update threshold value and browser shows "Cập nhật thành công"
- [ ] No console errors: Browser F12 console is clean (no red errors)
- [ ] No terminal exceptions: Flask terminal shows only request logs, no Python errors

---

## 📞 If All Else Fails

1. **Complete reset:**
   ```powershell
   # Delete venv and recreate
   Remove-Item .venv -Recurse -Force
   python -m venv .venv
   . .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   python app.py
   ```

2. **Check disk/memory:**
   ```powershell
   # Port 5000 might conflict with other apps
   netstat -ano | findstr :3000
   ```

3. **Test with different browser:**
   - Try Chrome, Firefox, Edge
   - Some browsers cache more aggressively

4. **Contact support with these logs:**
   - Output of: `python app.py 2>&1 | Tee-Object debug.log`
   - Browser console errors (F12 → Console → Right-click → Save as)
   - Network tab request/response bodies (F12 → Network)

---

**Last Updated:** 2026-04-04
**Status:** All issues documented with solutions
