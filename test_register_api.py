#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Test Script: API Đăng ký tài khoản
Test các case:
1. ✓ Đăng ký thành công với thông tin khớp
2. ✗ Thất bại nếu room_code sai
3. ✗ Thất bại nếu meter_code sai
4. ✗ Thất bại nếu address sai
5. ✗ Thất bại nếu password không đủ mạnh
"""

import requests
import sqlite3
import json

BASE_URL = "http://localhost:3000"  # Thay đổi port nếu cần
API_ENDPOINT = f"{BASE_URL}/api/auth/register"

def get_device_info(device_id=1):
    """Lấy thông tin device từ database"""
    conn = sqlite3.connect('smart_energy.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, room_name, room_code, meter_code, address
        FROM devices WHERE id = ?
    ''', (device_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    return dict(row) if row else None

def test_register(fullname, contact, room_code, meter_code, address, password, test_name):
    """Test đăng ký API"""
    print(f"\n{'='*60}")
    print(f"TEST: {test_name}")
    print(f"{'='*60}")
    
    payload = {
        "fullname": fullname,
        "contact": contact,
        "room_code": room_code,
        "meter_code": meter_code,
        "address": address,
        "password": password
    }
    
    print(f"Request Body:")
    print(json.dumps(payload, indent=2, ensure_ascii=False))
    
    try:
        response = requests.post(API_ENDPOINT, json=payload, timeout=5)
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response:")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
        return response.status_code in [200, 201]
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    print("\n" + "="*60)
    print("🧪 API REGISTER TEST SUITE")
    print("="*60)
    
    # Get device info from DB
    device = get_device_info(1)
    if not device:
        print("❌ Không thể lấy thông tin device từ database!")
        return
    
    print(f"\n📋 Device Test Data (ID=1):")
    print(f"   Room Name: {device['room_name']}")
    print(f"   Room Code: {device['room_code']}")
    print(f"   Meter Code: {device['meter_code']}")
    print(f"   Address: {device['address']}")
    
    # Test 1: ✓ Successful registration with correct info
    test_register(
        fullname="Nguyễn Văn Anh",
        contact="john@example.com",
        room_code=device['room_code'],
        meter_code=device['meter_code'],
        address=device['address'],
        password="Password123!",
        test_name="✓ Đăng ký thành công (thông tin khớp)"
    )
    
    # Test 2: ✗ Wrong room_code
    test_register(
        fullname="Trần Thị Bình",
        contact="jane@example.com",
        room_code="WRONG-CODE",
        meter_code=device['meter_code'],
        address=device['address'],
        password="Password123!",
        test_name="✗ Mã phòng sai"
    )
    
    # Test 3: ✗ Wrong meter_code
    test_register(
        fullname="Lê Minh Chiến",
        contact="chiến@example.com",
        room_code=device['room_code'],
        meter_code="WRONG-METER",
        address=device['address'],
        password="Password123!",
        test_name="✗ Mã công tơ sai"
    )
    
    # Test 4: ✗ Wrong address
    test_register(
        fullname="Phạm Thanh Dũng",
        contact="dung@example.com",
        room_code=device['room_code'],
        meter_code=device['meter_code'],
        address="Quận Không Tồn Tại",
        password="Password123!",
        test_name="✗ Địa chỉ sai"
    )
    
    # Test 5: ✗ Password without uppercase
    test_register(
        fullname="Vũ Đặng Em",
        contact="em@example.com",
        room_code=device['room_code'],
        meter_code=device['meter_code'],
        address=device['address'],
        password="password123!",
        test_name="✗ Mật khẩu không có chữ hoa"
    )
    
    # Test 6: ✗ Password without number
    test_register(
        fullname="Hoàng Minh Giang",
        contact="giang@example.com",
        room_code=device['room_code'],
        meter_code=device['meter_code'],
        address=device['address'],
        password="Password!",
        test_name="✗ Mật khẩu không có chữ số"
    )
    
    # Test 7: ✗ Password without special character
    test_register(
        fullname="Hà Đức Hiệu",
        contact="hieu@example.com",
        room_code=device['room_code'],
        meter_code=device['meter_code'],
        address=device['address'],
        password="Password123",
        test_name="✗ Mật khẩu không có ký tự đặc biệt"
    )
    
    print("\n" + "="*60)
    print("✅ Test suite completed!")
    print("="*60)

if __name__ == '__main__':
    main()
