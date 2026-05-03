import sqlite3
import pandas as pd

# Kết nối vào file Database của sếp
conn = sqlite3.connect('smart_energy.db')

# Dùng dấu * để lôi TẤT CẢ các cột ra xem cho sướng mắt, khỏi sợ gọi sai tên
query = "SELECT * FROM devices"
df = pd.read_sql_query(query, conn)

print("="*80)
print("DANH SÁCH BÍ MẬT 25 PHÒNG CỦA SẾP HOÀNG")
print("="*80)
print(df.to_string(index=False))
print("="*80)

conn.close()