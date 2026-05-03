# -*- coding: utf-8 -*-
"""
HVAC Auto Control Service for Smart Energy System
Quản lý điều hòa không khí tự động dựa trên:
- Nhiệt độ hiện tại (từ IoT sensors)
- Chiếm dụng (occupancy)
- Lịch trình (schedule)
- Tiêu thụ năng lượng
"""

import random
from datetime import datetime, time
from typing import Dict, List, Optional, Tuple
from enum import Enum

class HVACMode(Enum):
    """HVAC Operating Modes"""
    OFF = "off"
    COOLING = "cooling"
    HEATING = "heating"
    AUTO = "auto"
    ECO = "eco"

class HVACZone:
    """Đại diện cho một zone điều hòa (có thể là 1 phòng hoặc nhóm phòng)"""
    
    def __init__(self, zone_id: int, zone_name: str, location: str, rooms: List[int]):
        self.zone_id = zone_id
        self.zone_name = zone_name
        self.location = location
        self.rooms = rooms  # List of room IDs in this zone
        
        # HVAC Settings
        self.mode = HVACMode.AUTO
        self.target_temp = 22.0  # Mục tiêu nhiệt độ
        self.current_temp = 22.0
        self.is_on = True
        self.power_consumption = 0.0  # kW
        self.fan_speed = 50  # 0-100%
        
        # Schedule
        self.schedule_enabled = False
        self.schedule_on_time = time(8, 0)  # 08:00
        self.schedule_off_time = time(22, 0)  # 22:00
        
        # Auto control settings
        self.auto_adjust = True
        self.tolerance = 1.0  # ±1°C
        self.occupancy_threshold = 0  # Min occupants to activate
        
        self.last_update = datetime.now().isoformat()
    
    def update_temperature(self, current_temp: float):
        """Cập nhật nhiệt độ hiện tại"""
        self.current_temp = current_temp
        self.last_update = datetime.now().isoformat()
    
    def calculate_power(self):
        """Tính toán tiêu thụ năng lượng dựa trên fan speed"""
        if not self.is_on or self.mode == HVACMode.OFF:
            self.power_consumption = 0.0
        else:
            # Base consumption: 0.5kW, scaling with fan speed
            base = 0.5
            speed_factor = (self.fan_speed / 100.0)
            self.power_consumption = round(base * speed_factor, 2)
    
    def adjust_fan_speed(self, target_temp: float, current_temp: float):
        """Tự động điều chỉnh tốc độ quạt dựa trên sự khác biệt nhiệt độ"""
        diff = abs(current_temp - target_temp)
        
        if diff < self.tolerance:
            self.fan_speed = 30  # Tối thiểu, duy trì nhiệt độ
        elif diff < 2.0:
            self.fan_speed = 50  # Vừa phải
        elif diff < 4.0:
            self.fan_speed = 75  # Cao
        else:
            self.fan_speed = 100  # Tối đa
        
        self.calculate_power()
    
    def get_status(self) -> Dict:
        """Lấy trạng thái hiện tại"""
        return {
            'zone_id': self.zone_id,
            'zone_name': self.zone_name,
            'location': self.location,
            'mode': self.mode.value,
            'is_on': self.is_on,
            'current_temp': round(self.current_temp, 1),
            'target_temp': self.target_temp,
            'fan_speed': self.fan_speed,
            'power_consumption': self.power_consumption,
            'auto_adjust': self.auto_adjust,
            'last_update': self.last_update
        }

class HVACController:
    """Bộ điều khiển HVAC chính cho toàn bộ hệ thống"""
    
    def __init__(self):
        self.zones = {}
        self._init_zones()
        self.global_mode = HVACMode.AUTO
        self.system_enabled = True
        self.energy_saving_mode = False
    
    def _init_zones(self):
        """Khởi tạo 5 zones (mỗi tầng một zone)"""
        zones_config = [
            (1, "Tầng Trệt", "Ground Floor", [1, 4, 5]),
            (2, "Tầng 01", "Floor 1", [6, 7, 8, 9, 10]),
            (3, "Tầng 02", "Floor 2", [11, 12, 13, 14, 15]),
            (4, "Tầng 03", "Floor 3", [16, 17, 18, 19, 20]),
            (5, "Tầng 04", "Floor 4", [21, 22, 23, 24, 25]),
        ]
        
        for zone_id, name, location, rooms in zones_config:
            self.zones[zone_id] = HVACZone(zone_id, name, location, rooms)
    
    def auto_control(self, iot_data: Optional[Dict] = None):
        """
        Tự động điều khiển HVAC dựa trên dữ liệu IoT
        
        Logic:
        1. Nếu có người (occupancy > 0) → Bật HVAC, set nhiệt độ 22°C
        2. Nếu không có người → Tắt HVAC (ECO mode)
        3. Theo lịch trình (8h-22h)
        4. Tiết kiệm năng lượng nếu tổng công suất > ngưỡng
        """
        if not self.system_enabled:
            return
        
        now = datetime.now()
        current_hour = now.hour
        
        # Kiểm tra lịch trình
        in_schedule = 8 <= current_hour < 22  # 8h-22h
        
        for zone_id, zone in self.zones.items():
            # Simulate room temperature update (IoT data)
            zone.update_temperature(
                20 + random.uniform(-2, 4)  # 18-24°C
            )
            
            # Occupancy check
            occupied = random.random() > 0.3  # 70% chance occupied
            
            if not self.system_enabled:
                zone.is_on = False
                zone.mode = HVACMode.OFF
                zone.calculate_power()
            elif self.energy_saving_mode:
                # Eco mode: Chỉ duy trì nhiệt độ, không tích cực điều chỉnh
                zone.is_on = occupied and in_schedule
                zone.mode = HVACMode.ECO
                zone.target_temp = 24.0  # Relaxed target
                zone.adjust_fan_speed(zone.target_temp, zone.current_temp)
            else:
                # Normal mode: Active control
                zone.is_on = occupied and in_schedule
                zone.mode = HVACMode.AUTO
                zone.target_temp = 22.0  # Comfortable temperature
                zone.adjust_fan_speed(zone.target_temp, zone.current_temp)
    
    def enable_eco_mode(self):
        """Kích hoạt chế độ tiết kiệm năng lượng"""
        self.energy_saving_mode = True
        self.global_mode = HVACMode.ECO
        return {
            'status': 'success',
            'message': 'ECO mode activated',
            'expected_savings': '15-20% energy',
            'target_temp': 24.0
        }
    
    def disable_eco_mode(self):
        """Tắt chế độ tiết kiệm năng lượng"""
        self.energy_saving_mode = False
        self.global_mode = HVACMode.AUTO
        return {
            'status': 'success',
            'message': 'ECO mode deactivated',
            'target_temp': 22.0
        }
    
    def set_global_temperature(self, target_temp: float):
        """Đặt nhiệt độ mục tiêu cho toàn hệ thống"""
        if 18 <= target_temp <= 28:
            for zone in self.zones.values():
                zone.target_temp = target_temp
            return {
                'status': 'success',
                'message': f'Global temperature set to {target_temp}°C',
                'affected_zones': len(self.zones)
            }
        return {
            'status': 'error',
            'message': 'Temperature must be between 18°C and 28°C'
        }
    
    def set_zone_temperature(self, zone_id: int, target_temp: float):
        """Đặt nhiệt độ mục tiêu cho một zone"""
        if zone_id not in self.zones:
            return {'status': 'error', 'message': f'Zone {zone_id} not found'}
        
        if 18 <= target_temp <= 28:
            self.zones[zone_id].target_temp = target_temp
            return {
                'status': 'success',
                'message': f'Zone {zone_id} temperature set to {target_temp}°C',
                'zone_name': self.zones[zone_id].zone_name
            }
        return {
            'status': 'error',
            'message': 'Temperature must be between 18°C and 28°C'
        }
    
    def get_zone_status(self, zone_id: int) -> Optional[Dict]:
        """Lấy trạng thái của một zone"""
        if zone_id in self.zones:
            return self.zones[zone_id].get_status()
        return None
    
    def get_all_zones_status(self) -> Dict:
        """Lấy trạng thái tất cả zones"""
        return {
            'system_enabled': self.system_enabled,
            'global_mode': self.global_mode.value,
            'energy_saving_mode': self.energy_saving_mode,
            'total_power_consumption': round(
                sum(zone.power_consumption for zone in self.zones.values()), 2
            ),
            'zones': [zone.get_status() for zone in self.zones.values()],
            'timestamp': datetime.now().isoformat()
        }
    
    def get_energy_stats(self) -> Dict:
        """Lấy thống kê tiêu thụ năng lượng"""
        total_power = sum(zone.power_consumption for zone in self.zones.values())
        active_zones = sum(1 for zone in self.zones.values() if zone.is_on)
        
        return {
            'total_power_consumption': round(total_power, 2),
            'active_zones': active_zones,
            'inactive_zones': len(self.zones) - active_zones,
            'estimated_monthly_cost': round(total_power * 24 * 30 * 2500, 0),  # Assuming 2500 VND/kWh
            'energy_saving_active': self.energy_saving_mode,
            'recommendation': 'Enable ECO mode to reduce consumption' if total_power > 2.0 else 'System running efficiently'
        }

# Global instance
hvac_controller = HVACController()
