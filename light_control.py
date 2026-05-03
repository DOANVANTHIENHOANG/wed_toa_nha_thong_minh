# -*- coding: utf-8 -*-
"""
Lighting Control Service for Smart Energy System
Quản lý điều khiển chiếu sáng tự động dựa trên:
- Mức ánh sáng hiện tại (từ IoT sensors)
- Phát hiện chuyển động (occupancy)
- Lịch trình (schedule)
- Tiêu thụ năng lượng
"""

import random
from datetime import datetime, time
from typing import Dict, List, Optional
from enum import Enum

class LightMode(Enum):
    """Lighting Operating Modes"""
    OFF = "off"
    MANUAL = "manual"
    AUTO = "auto"
    ECO = "eco"
    SCHEDULE = "schedule"

class LightZone:
    """Đại diện cho một zone chiếu sáng (có thể là 1 phòng hoặc nhóm phòng)"""
    
    def __init__(self, zone_id: int, zone_name: str, location: str, rooms: List[int]):
        self.zone_id = zone_id
        self.zone_name = zone_name
        self.location = location
        self.rooms = rooms
        
        # Lighting Status
        self.mode = LightMode.AUTO
        self.is_on = False
        self.brightness = 0  # 0-100%
        self.color_temp = 4000  # Kelvin (2700-6500K)
        self.power_consumption = 0.0  # kW
        
        # Sensor Data (from IoT)
        self.light_level = 50  # 0-100% (from light sensor)
        self.occupancy = False  # From occupancy sensor
        
        # Auto control settings
        self.auto_mode_enabled = True
        self.light_threshold = 30  # % (turn on if below this)
        self.occupancy_threshold = 0  # Min occupants
        self.min_brightness = 20  # Minimum when in use
        self.max_brightness = 100  # Maximum
        
        # Schedule
        self.schedule_enabled = False
        self.schedule_on_time = time(6, 0)  # 06:00
        self.schedule_off_time = time(22, 0)  # 22:00
        
        self.last_update = datetime.now().isoformat()
    
    def update_sensor_data(self, light_level: float, occupancy: bool):
        """Cập nhật dữ liệu từ IoT sensors"""
        self.light_level = light_level
        self.occupancy = occupancy
        self.last_update = datetime.now().isoformat()
    
    def calculate_power(self):
        """Tính toán tiêu thụ năng lượng dựa trên brightness"""
        if not self.is_on or self.mode == LightMode.OFF:
            self.power_consumption = 0.0
        else:
            # Base consumption per lamp: 0.01kW (10W LED)
            # Assuming 4 lamps per zone
            num_lamps = 4
            per_lamp_base = 0.01
            brightness_factor = (self.brightness / 100.0)
            self.power_consumption = round(
                num_lamps * per_lamp_base * brightness_factor, 3
            )
    
    def set_brightness(self, brightness: int):
        """Đặt độ sáng (0-100%)"""
        brightness = max(0, min(100, brightness))
        self.brightness = brightness
        self.is_on = brightness > 0
        self.calculate_power()
    
    def auto_control(self, force_schedule_check: bool = True):
        """
        Tự động điều khiển chiếu sáng
        
        Logic:
        1. Nếu có người (occupancy) + ánh sáng yếu → Bật đèn
        2. Nếu không có người → Tắt đèn
        3. Điều chỉnh độ sáng dựa trên ánh sáng môi trường
        4. Kiểm tra lịch trình (6h-22h)
        """
        if self.mode == LightMode.OFF or not self.auto_mode_enabled:
            self.is_on = False
            self.brightness = 0
            self.calculate_power()
            return
        
        # Check schedule
        if force_schedule_check:
            now = datetime.now()
            in_schedule = (
                self.schedule_on_time <= now.time() <= self.schedule_off_time
            )
        else:
            in_schedule = True
        
        if not in_schedule:
            self.is_on = False
            self.brightness = 0
            self.calculate_power()
            return
        
        # Occupancy-based control
        if self.occupancy:
            # Turn on lights if occupancy detected and ambient light is low
            if self.light_level < self.light_threshold:
                self.is_on = True
                # Calculate brightness based on ambient light
                # If very dark (0-10%), use max brightness
                # If moderate (30-50%), use medium
                # If bright (50%+), use low supplemental
                if self.light_level < 10:
                    target_brightness = self.max_brightness
                elif self.light_level < 30:
                    target_brightness = 75
                else:
                    target_brightness = 40
                self.set_brightness(target_brightness)
            else:
                # Ambient light sufficient, turn off
                self.is_on = False
                self.brightness = 0
                self.calculate_power()
        else:
            # No occupancy - turn off
            self.is_on = False
            self.brightness = 0
            self.calculate_power()
    
    def manual_set_brightness(self, brightness: int):
        """Đặt độ sáng thủ công"""
        self.mode = LightMode.MANUAL
        self.set_brightness(brightness)
    
    def get_status(self) -> Dict:
        """Lấy trạng thái hiện tại"""
        return {
            'zone_id': self.zone_id,
            'zone_name': self.zone_name,
            'location': self.location,
            'mode': self.mode.value,
            'is_on': self.is_on,
            'brightness': self.brightness,
            'color_temp': self.color_temp,
            'power_consumption': self.power_consumption,
            'light_level': round(self.light_level, 1),
            'occupancy': self.occupancy,
            'auto_mode_enabled': self.auto_mode_enabled,
            'last_update': self.last_update
        }

class LightingController:
    """Bộ điều khiển chiếu sáng chính cho toàn bộ hệ thống"""
    
    def __init__(self):
        self.zones = {}
        self._init_zones()
        self.global_mode = LightMode.AUTO
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
            self.zones[zone_id] = LightZone(zone_id, name, location, rooms)
    
    def auto_control(self):
        """
        Tự động điều khiển chiếu sáng cho tất cả zones
        Lấy dữ liệu từ IoT sensors và điều chỉnh ánh sáng tự động
        """
        if not self.system_enabled:
            return
        
        for zone_id, zone in self.zones.items():
            # Simulate IoT sensor data (in real app, fetch from /api/iot/sensor)
            light_level = 20 + random.uniform(-10, 40)  # 10-60%
            occupancy = random.random() > 0.5  # 50% chance occupied
            
            zone.update_sensor_data(light_level, occupancy)
            
            if self.energy_saving_mode:
                # Eco mode: More aggressive light reduction
                zone.mode = LightMode.ECO
                zone.light_threshold = 50  # Higher threshold for turning on
            else:
                zone.mode = LightMode.AUTO
                zone.light_threshold = 30  # Standard threshold
            
            zone.auto_control()
    
    def enable_eco_mode(self):
        """Kích hoạt chế độ tiết kiệm năng lượng"""
        self.energy_saving_mode = True
        self.global_mode = LightMode.ECO
        for zone in self.zones.values():
            zone.mode = LightMode.ECO
        return {
            'status': 'success',
            'message': 'ECO mode activated',
            'expected_savings': '20-30% energy',
            'higher_light_threshold': True
        }
    
    def disable_eco_mode(self):
        """Tắt chế độ tiết kiệm năng lượng"""
        self.energy_saving_mode = False
        self.global_mode = LightMode.AUTO
        for zone in self.zones.values():
            zone.mode = LightMode.AUTO
        return {
            'status': 'success',
            'message': 'ECO mode deactivated',
            'standard_light_threshold': True
        }
    
    def set_zone_brightness(self, zone_id: int, brightness: int):
        """Đặt độ sáng cho một zone"""
        if zone_id not in self.zones:
            return {'status': 'error', 'message': f'Zone {zone_id} not found'}
        
        zone = self.zones[zone_id]
        zone.manual_set_brightness(brightness)
        return {
            'status': 'success',
            'message': f'Zone {zone_id} brightness set to {brightness}%',
            'zone_name': zone.zone_name,
            'brightness': brightness,
            'is_on': zone.is_on
        }
    
    def set_global_brightness(self, brightness: int):
        """Đặt độ sáng cho tất cả zones"""
        if not (0 <= brightness <= 100):
            return {'status': 'error', 'message': 'Brightness must be 0-100'}
        
        for zone in self.zones.values():
            zone.manual_set_brightness(brightness)
        
        return {
            'status': 'success',
            'message': f'Global brightness set to {brightness}%',
            'affected_zones': len(self.zones)
        }
    
    def enable_auto_mode(self, zone_id: Optional[int] = None):
        """Bật chế độ tự động (toàn bộ hoặc một zone)"""
        if zone_id:
            if zone_id in self.zones:
                self.zones[zone_id].mode = LightMode.AUTO
                self.zones[zone_id].auto_mode_enabled = True
                return {
                    'status': 'success',
                    'message': f'Zone {zone_id} auto mode enabled'
                }
            return {'status': 'error', 'message': f'Zone {zone_id} not found'}
        else:
            for zone in self.zones.values():
                zone.mode = LightMode.AUTO
                zone.auto_mode_enabled = True
            return {
                'status': 'success',
                'message': 'Auto mode enabled for all zones'
            }
    
    def disable_auto_mode(self, zone_id: Optional[int] = None):
        """Tắt chế độ tự động (toàn bộ hoặc một zone)"""
        if zone_id:
            if zone_id in self.zones:
                self.zones[zone_id].auto_mode_enabled = False
                return {
                    'status': 'success',
                    'message': f'Zone {zone_id} auto mode disabled'
                }
            return {'status': 'error', 'message': f'Zone {zone_id} not found'}
        else:
            for zone in self.zones.values():
                zone.auto_mode_enabled = False
            return {
                'status': 'success',
                'message': 'Auto mode disabled for all zones'
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
                sum(zone.power_consumption for zone in self.zones.values()), 3
            ),
            'zones': [zone.get_status() for zone in self.zones.values()],
            'timestamp': datetime.now().isoformat()
        }
    
    def get_energy_stats(self) -> Dict:
        """Lấy thống kê tiêu thụ năng lượng chiếu sáng"""
        total_power = sum(zone.power_consumption for zone in self.zones.values())
        active_zones = sum(1 for zone in self.zones.values() if zone.is_on)
        
        return {
            'total_power_consumption': round(total_power, 3),
            'active_zones': active_zones,
            'inactive_zones': len(self.zones) - active_zones,
            'avg_brightness': round(
                sum(z.brightness for z in self.zones.values()) / len(self.zones), 1
            ),
            'estimated_monthly_cost': round(total_power * 24 * 30 * 2500, 0),  # 2500 VND/kWh
            'energy_saving_active': self.energy_saving_mode,
            'recommendation': 'Enable ECO mode to reduce consumption' if total_power > 0.15 else 'System running efficiently'
        }

# Global instance
lighting_controller = LightingController()
