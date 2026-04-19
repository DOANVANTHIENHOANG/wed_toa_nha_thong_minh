"""
SED V2.1 - Database Helper
Các hàm tiện ích để tương tác với SQLite database
"""

import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
import json

DB_PATH = Path(__file__).parent / 'smart_energy.db'

def get_db():
    """Lấy connection tới database"""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

# ===== ENERGY CONSUMPTION =====

def log_energy_consumption(device_id, device_name, location, power_kw, temperature, humidity, occupancy):
    """Ghi lại tiêu thụ điện"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO energy_consumption 
        (device_id, device_name, location, power_kw, temperature, humidity, occupancy, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (device_id, device_name, location, power_kw, temperature, humidity, occupancy, datetime.now().isoformat()))
    
    conn.commit()
    conn.close()

def get_energy_history(hours=24, device_id=None):
    """Lấy lịch sử tiêu thụ điện"""
    conn = get_db()
    cursor = conn.cursor()
    
    since = (datetime.now() - timedelta(hours=hours)).isoformat()
    
    if device_id:
        cursor.execute('''
            SELECT * FROM energy_consumption
            WHERE timestamp > ? AND device_id = ?
            ORDER BY timestamp ASC
        ''', (since, device_id))
    else:
        cursor.execute('''
            SELECT * FROM energy_consumption
            WHERE timestamp > ?
            ORDER BY timestamp ASC
        ''', (since,))
    
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def get_energy_statistics(hours=24):
    """Tính toán thống kê tiêu thụ điện"""
    conn = get_db()
    cursor = conn.cursor()
    
    since = (datetime.now() - timedelta(hours=hours)).isoformat()
    
    cursor.execute('''
        SELECT 
            COUNT(*) as total_records,
            SUM(power_kw) as total_power,
            AVG(power_kw) as avg_power,
            MAX(power_kw) as max_power,
            MIN(power_kw) as min_power,
            AVG(temperature) as avg_temp,
            AVG(humidity) as avg_humidity
        FROM energy_consumption
        WHERE timestamp > ?
    ''', (since,))
    
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            'total_records': row['total_records'],
            'total_power': round(row['total_power'] or 0, 2),
            'avg_power': round(row['avg_power'] or 0, 2),
            'max_power': round(row['max_power'] or 0, 2),
            'min_power': round(row['min_power'] or 0, 2),
            'avg_temp': round(row['avg_temp'] or 0, 1),
            'avg_humidity': round(row['avg_humidity'] or 0, 1)
        }
    
    return {}

def get_device_breakdown(hours=24):
    """Phân tích tiêu thụ theo thiết bị"""
    conn = get_db()
    cursor = conn.cursor()
    
    since = (datetime.now() - timedelta(hours=hours)).isoformat()
    
    cursor.execute('''
        SELECT 
            device_id,
            device_name,
            location,
            COUNT(*) as count,
            SUM(power_kw) as total,
            AVG(power_kw) as avg,
            MAX(power_kw) as max
        FROM energy_consumption
        WHERE timestamp > ?
        GROUP BY device_id, device_name
        ORDER BY total DESC
    ''', (since,))
    
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

# ===== DEVICE SCHEDULE =====

def add_schedule(device_id, device_name, location, day_of_week, start_time, end_time, action):
    """Thêm lịch trình cho thiết bị"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO device_schedule 
        (device_id, device_name, location, day_of_week, start_time, end_time, action)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (device_id, device_name, location, day_of_week, start_time, end_time, action))
    
    conn.commit()
    conn.close()
    
    return True

def get_schedules(device_id=None):
    """Lấy danh sách lịch trình"""
    conn = get_db()
    cursor = conn.cursor()
    
    if device_id:
        cursor.execute('''
            SELECT * FROM device_schedule
            WHERE device_id = ? AND is_enabled = 1
            ORDER BY day_of_week, start_time
        ''', (device_id,))
    else:
        cursor.execute('''
            SELECT * FROM device_schedule
            WHERE is_enabled = 1
            ORDER BY device_id, day_of_week, start_time
        ''')
    
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def delete_schedule(schedule_id):
    """Xóa lịch trình"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('UPDATE device_schedule SET is_enabled = 0 WHERE id = ?', (schedule_id,))
    
    conn.commit()
    conn.close()
    
    return True

# ===== THRESHOLD SETTINGS =====

def get_setting(setting_key):
    """Lấy giá trị cài đặt"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('SELECT setting_value FROM threshold_settings WHERE setting_key = ?', (setting_key,))
    
    row = cursor.fetchone()
    conn.close()
    
    return row['setting_value'] if row else None

def update_setting(setting_key, setting_value):
    """Cập nhật cài đặt"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE threshold_settings 
        SET setting_value = ?, updated_at = ?
        WHERE setting_key = ?
    ''', (setting_value, datetime.now().isoformat(), setting_key))
    
    conn.commit()
    conn.close()
    
    return True

def get_all_settings():
    """Lấy tất cả cài đặt"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('SELECT setting_key, setting_value, description FROM threshold_settings')
    
    rows = cursor.fetchall()
    conn.close()
    
    return {row['setting_key']: row['setting_value'] for row in rows}

# ===== ALERTS =====

def log_alert(alert_type, device_id, device_name, current_value, threshold_value, message, severity='WARNING'):
    """Ghi lại cảnh báo"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO alerts 
        (alert_type, device_id, device_name, current_value, threshold_value, message, severity, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (alert_type, device_id, device_name, current_value, threshold_value, message, severity, datetime.now().isoformat()))
    
    conn.commit()
    conn.close()

def get_recent_alerts(limit=10):
    """Lấy cảnh báo gần đây"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT * FROM alerts
        WHERE is_resolved = 0
        ORDER BY timestamp DESC
        LIMIT ?
    ''', (limit,))
    
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def resolve_alert(alert_id):
    """Đánh dấu cảnh báo là đã xử lý"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('UPDATE alerts SET is_resolved = 1 WHERE id = ?', (alert_id,))
    
    conn.commit()
    conn.close()
    
    return True

# ===== AI ANALYSIS =====

def log_ai_analysis(user_query, ai_response, data_snapshot):
    """Ghi lại phân tích AI"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO ai_analysis
        (user_query, ai_response, data_snapshot, timestamp)
        VALUES (?, ?, ?, ?)
    ''', (user_query, ai_response, json.dumps(data_snapshot), datetime.now().isoformat()))
    
    conn.commit()
    conn.close()

def get_ai_history(limit=10):
    """Lấy lịch sử phân tích AI"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT * FROM ai_analysis
        ORDER BY timestamp DESC
        LIMIT ?
    ''', (limit,))
    
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

# ===== OPTIMIZATION =====

def log_optimization(action, affected_devices, power_saved_kw, opt_type):
    """Ghi lại tối ưu hóa"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO optimization_logs
        (action, affected_devices, power_saved_kw, optimization_type, timestamp)
        VALUES (?, ?, ?, ?, ?)
    ''', (action, json.dumps(affected_devices), power_saved_kw, opt_type, datetime.now().isoformat()))
    
    conn.commit()
    conn.close()

def get_optimization_history(limit=10):
    """Lấy lịch sử tối ưu hóa"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT * FROM optimization_logs
        ORDER BY timestamp DESC
        LIMIT ?
    ''', (limit,))

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]

# ===== DEVICES (NEW) =====

def get_all_devices():
    """Lấy tất cả thiết bị từ database"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT id, room_name, floor, room_code, power_status,
               current_power, load_status, last_updated
        FROM devices
        ORDER BY floor, room_name
    ''')

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]

def get_device_by_id(device_id):
    """Lấy thông tin một thiết bị theo ID"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM devices WHERE id = ?', (device_id,))

    row = cursor.fetchone()
    conn.close()

    return dict(row) if row else None

def update_device_power(device_id, power_status, current_power):
    """Cập nhật trạng thái và công suất thiết bị"""
    # Tính load_status dựa trên current_power
    if current_power == 0:
        load_status = "Chờ"
    elif current_power < 2.0:
        load_status = "Bình thường"
    elif current_power < 4.0:
        load_status = "Cao"
    else:
        load_status = "Tới hạn"

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('''
        UPDATE devices
        SET power_status = ?, current_power = ?, load_status = ?, last_updated = datetime('now')
        WHERE id = ?
    ''', (power_status, current_power, load_status, device_id))

    conn.commit()
    conn.close()

    return True
