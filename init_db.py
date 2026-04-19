"""
SED V2.1 - Database Initialization
Tạo SQLite database cho lưu trữ lịch sử tiêu thụ điện và cấu hình
"""
# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import sqlite3
import os
import json
from datetime import datetime, timedelta
from pathlib import Path

DB_PATH = Path(__file__).parent / 'smart_energy.db'
DATA_DIR = Path(__file__).parent / 'data'

# Tạo thư mục data nếu chưa tồn tại
DATA_DIR.mkdir(parents=True, exist_ok=True)

def init_database():
    """Khởi tạo database và tạo các bảng"""
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # ===== TABLE: energy_consumption (Lịch sử tiêu thụ điện) =====
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS energy_consumption (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            device_id INTEGER,
            device_name TEXT,
            location TEXT,
            power_kw REAL,
            temperature REAL,
            humidity REAL,
            occupancy INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # ===== TABLE: device_schedule (Lịch trình bật/tắt thiết bị) =====
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS device_schedule (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_id INTEGER,
            device_name TEXT,
            location TEXT,
            day_of_week TEXT,
            start_time TEXT,
            end_time TEXT,
            is_enabled BOOLEAN DEFAULT 1,
            action TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # ===== TABLE: threshold_settings (Cấu hình ngưỡng cảnh báo) =====
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS threshold_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            setting_key TEXT UNIQUE,
            setting_value REAL,
            description TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # ===== TABLE: alerts (Lịch sử cảnh báo) =====
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            alert_type TEXT,
            device_id INTEGER,
            device_name TEXT,
            current_value REAL,
            threshold_value REAL,
            message TEXT,
            severity TEXT,
            is_resolved BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # ===== TABLE: ai_analysis (Lịch sử phân tích AI) =====
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ai_analysis (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            user_query TEXT,
            ai_response TEXT,
            data_snapshot TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # ===== TABLE: optimization_logs (Lịch sử tối ưu hóa) =====
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS optimization_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            action TEXT,
            affected_devices TEXT,
            power_saved_kw REAL,
            optimization_type TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # ===== TABLE: hourly_summary (Tóm tắt hàng giờ) =====
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS hourly_summary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hour_start DATETIME,
            hour_end DATETIME,
            total_consumption_kwh REAL,
            avg_power_kw REAL,
            max_power_kw REAL,
            min_power_kw REAL,
            peak_occupancy INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # ===== TABLE: ml_training_data (Dữ liệu huấn luyện ML) =====
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ml_training_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME,
            temperature REAL,
            humidity REAL,
            occupancy INTEGER,
            power_consumption_kw REAL,
            is_peak_hour BOOLEAN,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # ===== TABLE: devices (Danh sách thiết bị/phòng) =====
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS devices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_name TEXT NOT NULL,
            floor INTEGER NOT NULL,
            room_code TEXT UNIQUE,
            power_status TEXT DEFAULT 'OFF',
            current_power REAL DEFAULT 0.0,
            load_status TEXT DEFAULT 'Chờ',
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    
    # ===== INSERT DEFAULT THRESHOLD SETTINGS =====
    defaults = [
        ('threshold_power_kw', 5.0, 'Ngưỡng cảnh báo công suất (kW)'),
        ('price_per_kwh', 2500, 'Giá tiền điện (₫/kWh)'),
        ('temp_max', 28.0, 'Nhiệt độ cảnh báo tối đa (°C)'),
        ('temp_min', 16.0, 'Nhiệt độ cảnh báo tối thiểu (°C)'),
        ('humidity_max', 80.0, 'Độ ẩm cảnh báo tối đa (%)'),
        ('peak_hour_start', 18.0, 'Giờ cao điểm bắt đầu'),
        ('peak_hour_end', 21.0, 'Giờ cao điểm kết thúc'),
    ]
    
    for key, value, desc in defaults:
        cursor.execute('''
            INSERT OR IGNORE INTO threshold_settings (setting_key, setting_value, description)
            VALUES (?, ?, ?)
        ''', (key, value, desc))
    
    conn.commit()
    
    print(f"✅ Database initialized at: {DB_PATH}")
    print(f"✅ Tables created successfully")
    
    conn.close()
    return DB_PATH

def insert_sample_data():
    """Chèn dữ liệu mẫu cho test"""
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Dữ liệu mẫu cho 7 ngày vừa qua
    devices = [
        (1, 'Sảnh chính', 'Tầng trệt'),
        (2, 'Văn phòng A', 'Tầng 01'),
        (3, 'Server', 'Tầng 02'),
        (4, 'Phòng họp', 'Tầng 01'),
        (5, 'HVAC', 'Tầng mái'),
    ]
    
    now = datetime.now()
    
    # Tạo 168 records (7 ngày × 24 giờ) cho mỗi thiết bị
    for device_id, device_name, location in devices:
        for hours_ago in range(168, 0, -1):
            timestamp = now - timedelta(hours=hours_ago)
            
            # Simulate realistic patterns
            hour = timestamp.hour
            power = 1.0 + (hour % 24) * 0.1  # Varies by hour
            temp = 22.0 + (hour % 24) * 0.2
            
            cursor.execute('''
                INSERT INTO energy_consumption 
                (timestamp, device_id, device_name, location, power_kw, temperature, humidity, occupancy)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                timestamp.isoformat(),
                device_id,
                device_name,
                location,
                power,
                temp,
                65.0 + (hour % 24) * 1.5,
                max(0, 5 - abs(12 - hour))  # Peak occupancy at noon
            ))
    
    conn.commit()
    print(f"✅ Inserted sample data for {len(devices)} devices × 168 hours")
    
    conn.close()

def get_db_connection():
    """Lấy connection tới database"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def seed_data():
    """Nạp dữ liệu 25 phòng cho 5 tầng vào database"""
    import random

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Xóa dữ liệu cũ trong bảng devices
    cursor.execute('DELETE FROM devices')

    # Tạo 25 phòng cho 5 tầng (5 phòng/tầng)
    rooms_data = []

    for floor in range(1, 6):  # Tầng 1-5
        for room in range(1, 6):  # Phòng 1-5
            room_name = f"Phòng {floor}0{room}"
            room_code = f"CB-L{floor}-{room}"
            # Random trạng thái ban đầu (70% ON, 30% OFF)
            power_status = "ON" if random.random() > 0.3 else "OFF"
            # Random công suất nếu ON, 0 nếu OFF
            current_power = round(random.uniform(0.5, 6.0), 2) if power_status == "ON" else 0.0

            # Tính load_status dựa trên current_power
            if current_power == 0:
                load_status = "Chờ"
            elif current_power < 2.0:
                load_status = "Bình thường"
            elif current_power < 4.0:
                load_status = "Cao"
            else:
                load_status = "Tới hạn"

            rooms_data.append((
                room_name,
                floor,
                room_code,
                power_status,
                current_power,
                load_status
            ))

    # Chèn dữ liệu
    cursor.executemany('''
        INSERT INTO devices (room_name, floor, room_code, power_status, current_power, load_status)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', rooms_data)

    conn.commit()

    # Đếm số bản ghi đã chèn
    cursor.execute('SELECT COUNT(*) FROM devices')
    count = cursor.fetchone()[0]

    conn.close()

    print(f"✅ Seed data: Đã chèn {count} phòng vào database")
    return count

def get_all_devices_from_db():
    """Lấy tất cả thiết bị từ database"""
    conn = get_db_connection()
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
    conn = get_db_connection()
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

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        UPDATE devices
        SET power_status = ?, current_power = ?, load_status = ?, last_updated = ?
        WHERE id = ?
    ''', (power_status, current_power, load_status, datetime.now().isoformat(), device_id))

    conn.commit()
    conn.close()

    return True

def seed_energy_history():
    """Nạp dữ liệu lịch sử công suất cho mỗi phòng"""
    import random

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Xóa dữ liệu cũ
    cursor.execute('DELETE FROM energy_consumption')

    # Lấy tất cả phòng
    cursor.execute('SELECT id, room_name, floor, room_code FROM devices')
    rooms = cursor.fetchall()

    now = datetime.now()

    # Mỗi phòng có 10 bản ghi công suất ngẫu nhiên
    for room_id, room_name, floor, room_code in rooms:
        for i in range(10):
            # Giờ trước (từ -9 đến 0)
            hours_ago = 9 - i
            timestamp = (now - timedelta(hours=hours_ago)).isoformat()

            # Công suất ngẫu nhiên 0.5-6.0 kW
            power = round(random.uniform(0.5, 6.0), 2)
            temperature = round(random.uniform(22, 28), 1)
            humidity = round(random.uniform(45, 75), 1)
            occupancy = random.randint(0, 10)

            cursor.execute('''
                INSERT INTO energy_consumption
                (timestamp, device_id, device_name, location, power_kw, temperature, humidity, occupancy)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                timestamp,
                room_id,
                room_name,
                f"Tầng {floor}",
                power,
                temperature,
                humidity,
                occupancy
            ))

    conn.commit()

    # Đếm số bản ghi
    cursor.execute('SELECT COUNT(*) FROM energy_consumption')
    count = cursor.fetchone()[0]

    conn.close()

    print(f"✅ Seed energy history: {count} records created")
    return count

def init_and_seed():
    """Khởi tạo database và nạp tất cả dữ liệu mẫu"""
    print("🔄 Dropping all tables and recreating...")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Xóa tất cả bảng cũ
    cursor.execute('DROP TABLE IF EXISTS devices')
    cursor.execute('DROP TABLE IF EXISTS energy_consumption')
    cursor.execute('DROP TABLE IF EXISTS device_schedule')
    cursor.execute('DROP TABLE IF EXISTS threshold_settings')
    cursor.execute('DROP TABLE IF EXISTS alerts')
    cursor.execute('DROP TABLE IF EXISTS ai_analysis')
    cursor.execute('DROP TABLE IF EXISTS optimization_logs')
    cursor.execute('DROP TABLE IF EXISTS hourly_summary')
    cursor.execute('DROP TABLE IF EXISTS ml_training_data')

    conn.close()
    print("✅ Old tables dropped")

    # Tạo lại database
    init_database()

    # Seed 25 phòng
    seed_data()

    # Seed lịch sử công suất cho biểu đồ
    seed_energy_history()

    # Kiểm tra dữ liệu
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute('SELECT COUNT(*) FROM devices')
    device_count = cursor.fetchone()[0]

    cursor.execute('SELECT COUNT(*) FROM energy_consumption')
    history_count = cursor.fetchone()[0]

    conn.close()

    print()
    print("=" * 50)
    print("📊 DATABASE SUMMARY")
    print("=" * 50)
    print(f"✅ Devices: {device_count} rooms")
    print(f"✅ Energy History: {history_count} records")
    print(f"✅ Each room has 10 power records for chart")
    print("=" * 50)

if __name__ == '__main__':
    print("=" * 50)
    print("SED V2.1 - Complete Database Initialization")
    print("=" * 50)
    print()

    # Chạy init + seed đầy đủ
    init_and_seed()

    print()
    print("✅ Complete database ready!")
    print(f"📁 Location: {DB_PATH}")
