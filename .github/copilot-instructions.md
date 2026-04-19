# Smart Building Energy Management System - Copilot Instructions

> **Project**: Smart Building Energy Management System  
> **Type**: Flask web application for real-time energy monitoring, ML forecasting, and optimization  
> **Stack**: Python 3.x, Flask, scikit-learn, JavaScript/HTML/CSS  
> **Updated**: 2026-04-04

## 🎯 Project Overview

This is a comprehensive smart building energy management platform that provides:
- **Real-time Monitoring**: Live power consumption, temperature, and device status tracking
- **ML Forecasting**: LinearRegression-based monthly energy consumption predictions
- **Optimization**: Overload detection, ECO mode suggestions, and alert management
- **Analytics**: Device breakdown, energy hog identification, historical comparisons
- **AI Analysis**: Contextual AI chat and automated energy insights
- **Role-Based Access**: Admin/User differentiation with custom decorators
- **Report Export**: JSON-based comprehensive energy analysis reports

**Note**: Vietnamese language throughout UI (device names, locations, user interfaces).

---

## 📂 Architecture & Code Organization

### Directory Structure
```
├── app.py                    # Main Flask application (routes, business logic)
├── templates/               # HTML templates (Jinja2)
│   ├── index.html          # Landing page
│   ├── login.html          # Authentication
│   ├── dashboard.html      # Main monitoring dashboard
│   ├── auth.html           # Auth wrapper
│   ├── home.html           # User home
│   └── setup.html          # System configuration
├── static/                  # Frontend assets
│   ├── style.css           # Bootstrap-based styling
│   └── main.js             # Frontend logic (charts, real-time updates)
├── data/
│   └── energy_data.json    # Historical energy consumption records
├── build/ & dist/          # PyInstaller compilation artifacts
└── .venv/                  # Python virtual environment
```

### Core Data Models (In-Memory)

**Users Database** (`users_db`):
- Keys: username (string)
- Fields: email, phone, password (hashed), building_id, meter_id, role
- Roles: "admin" (full access), "user" (view-only dashboard)

**System Data** (`system_data`):
- `devices`: Dict of connected devices with id, name, location, code, power (kW), status
- `today_kwh`: Daily consumption counter
- `month_kwh`: Monthly consumption counter
- `settings`: Threshold (kW), price_per_kwh (₫), schedule_off (HH:MM)

**Real-Time Data** (`realtime_data`):
- `current_pwr`: Current system power (kW)
- `temp`: Temperature (°C)
- `history`: List of power readings for time-series display

**Alert Logs** (`alert_logs`):
- Sequential list of {timestamp, message, severity, device_id} objects
- Persisted during session; cleared on restart

---

## 🚀 Development Commands

### Setup Environment
```bash
# Activate virtual environment (Windows)
. .venv\Scripts\Activate.ps1

# Or (Linux/Mac)
source .venv/bin/activate

# Install dependencies
pip install flask scikit-learn werkzeug numpy
```

### Run Application
```bash
# Development (debug mode)
python app.py

# Default: http://192.168.1.19:3000
# Access: admin/123 or user/123
```

### Build Executable (PyInstaller)
```bash
# Create executable
pyinstaller app.spec

# Artifact: dist/app.exe
```

---

## 🏗️ Common Development Patterns

### 1. **Route Protection (Decorators)**

Use `@require_login` for authenticated routes and `@require_admin` for admin-only operations:

```python
@app.route('/api/admin-settings', methods=['POST'])
@require_admin
def update_settings():
    # Only admin can access
    pass

@app.route('/api/user-dashboard')
@require_login
def dashboard():
    # Authenticated users only
    pass
```

### 2. **API Response Format**

Standard JSON response structure:
```python
# Success
return jsonify({'status': 'success', 'data': {...}})

# Error
return jsonify({'error': 'Error message'}), 400
return jsonify({'error': 'Unauthorized'}), 401
```

### 3. **Energy Calculations**

Energy consumption is stored/calculated as:
- **Unit**: kWh (kilowatt-hours)
- **Cost**: kWh × price_per_kwh (₫/kWh)
- **Threshold**: Alert triggered when current power > threshold setting

### 4. **Device Management**

Devices follow this structure:
```python
{
    'id': int,                    # Unique identifier
    'name': str,                  # Vietnamese device name
    'location': str,              # Floor/area (e.g., "Tầng 01")
    'code': str,                  # Equipment code (e.g., "CB-L1-02")
    'power': float,               # Current power draw (kW)
    'status': bool                # On/Off state
}
```

---

## 📊 Key API Endpoints

### Analytics (`/api/analytics/*`)
- `GET /api/analytics/comparison` → Compare consumption across periods
- `GET /api/analytics/device-consumption` → Breakdown by device
- `GET /api/analytics/energy-hogs` → Top 5 consumers
- `GET /api/analytics/forecast` → ML prediction for next month (scikit-learn LinearRegression)

### Optimization (`/api/optimization/*`)
- `POST /api/optimization/check-overload` → Check power vs. threshold
- `POST /api/optimization/eco-mode` → Get device shutdown suggestions

### AI Analysis (`/api/ai-*`)
- `GET /api/ai-analysis` → Generate contextual insights
- `POST /api/ai-chat` → Interactive chat with context from system data

### Reports (`/api/export-report`)
- `GET /api/export-report` → JSON export with full analysis

---

## 🔐 Security & Access Control

### Default Test Users
- **Admin**: username=`admin`, password=`123`
  - Access: All routes, admin panels, system settings
- **User**: username=`user`, password=`123`
  - Access: Dashboard, analytics (read-only)

### Password Security
- Passwords hashed with `werkzeug.security.generate_password_hash()`
- Verification via `check_password_hash()`
- **Production**: Change `SECRET_KEY` environment variable

### Session Management
- Flask sessions stored in cookies (signed)
- `@require_login` decorator checks `session['username']`
- Logout clears session data

---

## 📝 File-Specific Guidelines

### [app.py](../app.py)
- **Purpose**: Main application file with all routes, business logic, and data models
- **When editing**:
  - Add new routes before the `if __name__ == '__main__'` block
  - Use decorators for access control (standard pattern)
  - Keep data models (dicts) at the top after imports
  - Add utility functions after decorators
  - ML forecasting logic uses `LinearRegression` from sklearn

### [templates/dashboard.html](../templates/dashboard.html)
- **Purpose**: Main monitoring interface (role-aware layout)
- **When editing**:
  - Update device display cards in sync with `system_data['devices']` in app.py
  - JavaScript calls to `/api/` endpoints via `fetch()`
  - Real-time updates via setInterval() in [static/main.js](../static/main.js)

### [static/main.js](../static/main.js)
- **Purpose**: Frontend logic (fetch data, update UI, charts, event handlers)
- **When editing**:
  - Poll endpoints like `/api/analytics/comparison` for updates
  - Handle role-based UI rendering (admin vs user)
  - Chart libraries (if used): update data fetching logic

### [data/energy_data.json](../data/energy_data.json)
- **Purpose**: Historical time-series energy records
- **Format**: Array of objects: `{timestamp, device_name, location, power_consumption, occupancy}`
- **When editing**: Maintain ISO format timestamps; ensure timestamps align with analysis period

---

## 🛠️ Development Workflow

### Adding a New Feature
1. **Define Endpoint**: Add route to `app.py` with appropriate decorator
2. **Data Logic**: Implement calculation/analysis using existing data models
3. **Test Credentials**: Use admin/123 for full access during development
4. **Update Templates**: Add UI in relevant template if needed
5. **Update Frontend**: Add fetch calls in `main.js` if frontend interaction required

### Adding a New Device
1. Add to `system_data['devices']` dict in app.py (run context restart)
2. Update [templates/dashboard.html](../templates/dashboard.html) to display new device card
3. Add historical data to [data/energy_data.json](../data/energy_data.json) for forecasting accuracy

### Testing ML Forecast
- LinearRegression requires minimum ~30 data points for accuracy
- Forecast in [data/energy_data.json](../data/energy_data.json) covers periods like "2026-03-25 08:00 → 2026-03-25 20:00"
- Use `/api/analytics/forecast` to validate predictions

---

## 🚨 Common Pitfalls & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized on routes | Missing login or session expired | Ensure `@require_login` decorator in place; test with admin/123 |
| Data not updating in UI | stale state in JavaScript | Check `setInterval()` timing in `main.js`; logs in browser console |
| ML forecast fails | Insufficient data points or NaN values | Ensure `energy_data.json` has >30 records; clean timestamps |
| Locale/encoding errors | Vietnamese characters in filenames/paths | Save files UTF-8; use `encoding='utf-8'` in file operations |
| Admin features visible to user role | Role check missing | Verify `@require_admin` decorator; test with user/123 account |

---

## 📦 Dependencies & Versions

- **Flask**: Web framework for routing and templating
- **scikit-learn**: ML (LinearRegression) for energy forecasting
- **werkzeug**: Password hashing and utilities
- **numpy**: Numerical computations for forecasting
- **PyInstaller** (optional): Executable compilation via app.spec

To install all dependencies:
```bash
pip install flask scikit-learn werkzeug numpy pyinstaller
```

---

## 🎓 Learning Path for New Contributors

1. **Understand the UI**: Access http://192.168.1.19:3000, login as admin/123, explore dashboard
2. **Review Core Data**: Read in-memory data structures at top of [app.py](../app.py)
3. **Study Routes**: Trace a simple GET route (e.g., `/`) through app.py → template
4. **Explore API**: Call endpoints with curl or browser DevTools; check response format
5. **Modify Small Feature**: Add a new device or update a threshold setting
6. **Deploy**: Test build with PyInstaller; verify app.exe runs

---

## ❓ Quick Reference Commands (Copilot Slash Commands)

When working in this workspace:

- **Ask about architecture**: "/explain how device data flows from app.py to dashboard"
- **Debug API issue**: "/debug why /api/analytics/forecast returns null"
- **Add feature**: "/implement new API endpoint for alert history"
- **Optimize code**: "/refactor duplicate device filtering logic"
- **Explain pattern**: "/explain the decorator pattern used for access control"

---

## 📞 Support & Issues

For questions or issues within the app:
- Check browser console for JavaScript errors
- Review app.py for route availability
- Verify data file paths are correct
- Test with admin account first (more permissions)
- Check Flask debug output on terminal

**Last Updated**: 2026-04-04
