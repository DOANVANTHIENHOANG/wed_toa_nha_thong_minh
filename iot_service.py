# -*- coding: utf-8 -*-
"""
IoT Sensor Service for Smart Energy System
Quản lý dữ liệu từ các cảm biến (nhiệt độ, ánh sáng, chiếm dụng, etc)

Cấu trúc:
- 25 phòng (rooms)
- Mỗi phòng có: nhiệt độ, ánh sáng, chiếm dụng, độ ẩm
- Dữ liệu được cập nhật real-time (simulate)
"""

import random
from datetime import datetime
from typing import Dict, List, Optional

class SensorData:
    """Đại diện cho dữ liệu từ một cảm biến"""
    def __init__(self, sensor_id: str, sensor_type: str, room_id: int, room_name: str):
        self.sensor_id = sensor_id
        self.sensor_type = sensor_type  # 'temperature', 'light', 'occupancy', 'humidity'
        self.room_id = room_id
        self.room_name = room_name
        self.value = 0.0
        self.unit = ""
        self.timestamp = datetime.now().isoformat()
        self.status = "OK"
        
    def to_dict(self):
        return {
            'sensor_id': self.sensor_id,
            'sensor_type': self.sensor_type,
            'room_id': self.room_id,
            'room_name': self.room_name,
            'value': round(self.value, 2),
            'unit': self.unit,
            'timestamp': self.timestamp,
            'status': self.status
        }


class RoomSensors:
    """Tập hợp tất cả cảm biến trong một phòng"""
    def __init__(self, room_id: int, room_name: str, location: str):
        self.room_id = room_id
        self.room_name = room_name
        self.location = location
        self.sensors = {}
        self._init_sensors()
        
    def _init_sensors(self):
        """Khởi tạo cảm biến cho phòng"""
        # Temperature sensor (18-28°C)
        temp_sensor = SensorData(
            f"TEMP-R{self.room_id}",
            "temperature",
            self.room_id,
            self.room_name
        )
        temp_sensor.value = random.uniform(18.0, 28.0)
        temp_sensor.unit = "°C"
        self.sensors['temperature'] = temp_sensor
        
        # Light sensor (0-100%)
        light_sensor = SensorData(
            f"LIGHT-R{self.room_id}",
            "light",
            self.room_id,
            self.room_name
        )
        light_sensor.value = random.uniform(0, 100)
        light_sensor.unit = "%"
        self.sensors['light'] = light_sensor
        
        # Occupancy sensor (0 or 1)
        occupancy_sensor = SensorData(
            f"OCC-R{self.room_id}",
            "occupancy",
            self.room_id,
            self.room_name
        )
        occupancy_sensor.value = random.choice([0, 1])
        occupancy_sensor.unit = "people"
        self.sensors['occupancy'] = occupancy_sensor
        
        # Humidity sensor (30-80%)
        humidity_sensor = SensorData(
            f"HUM-R{self.room_id}",
            "humidity",
            self.room_id,
            self.room_name
        )
        humidity_sensor.value = random.uniform(30, 80)
        humidity_sensor.unit = "%"
        self.sensors['humidity'] = humidity_sensor
    
    def update_sensors(self):
        """Cập nhật giá trị cảm biến (simulate thay đổi)"""
        # Temperature: thay đổi nhỏ (±0.5°C)
        temp = self.sensors['temperature']
        temp.value = max(18, min(28, temp.value + random.uniform(-0.5, 0.5)))
        temp.timestamp = datetime.now().isoformat()
        
        # Light: thay đổi 0-5%
        light = self.sensors['light']
        light.value = max(0, min(100, light.value + random.uniform(-5, 5)))
        light.timestamp = datetime.now().isoformat()
        
        # Occupancy: random detect
        occupancy = self.sensors['occupancy']
        occupancy.value = random.choice([0, 1])
        occupancy.timestamp = datetime.now().isoformat()
        
        # Humidity: thay đổi nhỏ (±2%)
        humidity = self.sensors['humidity']
        humidity.value = max(30, min(80, humidity.value + random.uniform(-2, 2)))
        humidity.timestamp = datetime.now().isoformat()
    
    def get_sensor(self, sensor_type: str) -> Optional[Dict]:
        """Lấy dữ liệu từ một cảm biến"""
        if sensor_type in self.sensors:
            return self.sensors[sensor_type].to_dict()
        return None
    
    def get_all_sensors(self) -> Dict:
        """Lấy dữ liệu từ tất cả cảm biến"""
        return {
            'room_id': self.room_id,
            'room_name': self.room_name,
            'location': self.location,
            'sensors': {
                sensor_type: sensor.to_dict()
                for sensor_type, sensor in self.sensors.items()
            }
        }


class IoTService:
    """Service chính quản lý tất cả IoT sensors trong hệ thống"""
    
    def __init__(self):
        self.rooms = {}
        self._init_all_rooms()
    
    def _init_all_rooms(self):
        """Khởi tạo 25 phòng với cảm biến"""
        # Tầng trệt (5 phòng)
        rooms_data = [
            (1, "Sảnh chính", "Tầng trệt"),
            (2, "Văn phòng A", "Tầng 01"),
            (3, "Server", "Tầng 02"),
            (4, "Nhà vệ sinh", "Tầng trệt"),
            (5, "Thang máy", "Tầng trệt"),
            # Tầng 01 (5 phòng)
            (6, "Phòng họp A", "Tầng 01"),
            (7, "Phòng họp B", "Tầng 01"),
            (8, "Phòng làm việc 01", "Tầng 01"),
            (9, "Phòng làm việc 02", "Tầng 01"),
            (10, "Kho lạnh", "Tầng 01"),
            # Tầng 02 (5 phòng)
            (11, "Phòng quản lý", "Tầng 02"),
            (12, "Phòng làm việc 03", "Tầng 02"),
            (13, "Phòng làm việc 04", "Tầng 02"),
            (14, "Thư viện", "Tầng 02"),
            (15, "Phòng nghỉ", "Tầng 02"),
            # Tầng 03 (5 phòng)
            (16, "Phòng giám đốc", "Tầng 03"),
            (17, "Phòng làm việc 05", "Tầng 03"),
            (18, "Phòng làm việc 06", "Tầng 03"),
            (19, "Phòng hội thảo", "Tầng 03"),
            (20, "Phòng chờ", "Tầng 03"),
            # Tầng 04 (5 phòng)
            (21, "Phòng tổng giám đốc", "Tầng 04"),
            (22, "Phòng làm việc 07", "Tầng 04"),
            (23, "Phòng làm việc 08", "Tầng 04"),
            (24, "Phòng làm việc 09", "Tầng 04"),
            (25, "Sân thượng", "Tầng 04"),
        ]
        
        for room_id, room_name, location in rooms_data:
            self.rooms[room_id] = RoomSensors(room_id, room_name, location)
    
    def update_all(self):
        """Cập nhật dữ liệu tất cả cảm biến"""
        for room in self.rooms.values():
            room.update_sensors()
    
    def get_room_sensors(self, room_id: int) -> Optional[Dict]:
        """Lấy tất cả cảm biến của một phòng"""
        if room_id in self.rooms:
            return self.rooms[room_id].get_all_sensors()
        return None
    
    def get_sensor(self, room_id: int, sensor_type: str) -> Optional[Dict]:
        """Lấy dữ liệu từ một cảm biến cụ thể"""
        if room_id in self.rooms:
            return self.rooms[room_id].get_sensor(sensor_type)
        return None
    
    def get_all_rooms(self) -> List[Dict]:
        """Lấy dữ liệu tất cả phòng"""
        return [room.get_all_sensors() for room in self.rooms.values()]
    
    def get_room_by_name(self, room_name: str) -> Optional[Dict]:
        """Tìm phòng theo tên"""
        for room in self.rooms.values():
            if room.room_name.lower() == room_name.lower():
                return room.get_all_sensors()
        return None
    
    def get_average_temperature(self) -> float:
        """Lấy nhiệt độ trung bình của tòa nhà"""
        temps = [
            room.sensors['temperature'].value
            for room in self.rooms.values()
        ]
        return round(sum(temps) / len(temps), 2) if temps else 0.0
    
    def get_average_light(self) -> float:
        """Lấy ánh sáng trung bình"""
        lights = [
            room.sensors['light'].value
            for room in self.rooms.values()
        ]
        return round(sum(lights) / len(lights), 2) if lights else 0.0
    
    def get_occupied_rooms(self) -> int:
        """Đếm số phòng có người"""
        return sum(
            1 for room in self.rooms.values()
            if room.sensors['occupancy'].value > 0
        )
    
    def get_summary(self) -> Dict:
        """Lấy tóm tắt toàn bộ hệ thống"""
        self.update_all()
        return {
            'timestamp': datetime.now().isoformat(),
            'total_rooms': len(self.rooms),
            'occupied_rooms': self.get_occupied_rooms(),
            'avg_temperature': self.get_average_temperature(),
            'avg_light': self.get_average_light(),
            'rooms': self.get_all_rooms()
        }


# Global instance
iot_service = IoTService()
