from db_helper import get_db

def create_ai_logs_table():
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Lệnh tạo bảng ai_logs nếu chưa có
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS ai_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                room_name TEXT,
                action_taken TEXT,
                energy_saved_kwh REAL,
                reason TEXT,
                status TEXT,
                timestamp TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
        print("✅ THÀNH CÔNG! Đã tạo xong bảng ai_logs trong Database!")
        print("Sếp có thể quay lại trang web để test tính năng Tối ưu AI rồi nhé!")
    except Exception as e:
        print(f"❌ Lỗi rồi sếp ơi: {e}")

if __name__ == '__main__':
    create_ai_logs_table()