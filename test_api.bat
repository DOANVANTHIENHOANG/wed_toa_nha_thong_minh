@echo off
REM Test script cho SED V2.1 API
REM Chạy các test để kiểm tra Backend hoạt động bình thường

echo ===================================
echo SED V2.1 - API Test Suite
echo ===================================
echo.

REM Chắc chắn Backend đang chạy trên port 5000
set API_URL=http://127.0.0.1:3000

echo [1] Testing if Backend is running...
curl -s -o nul -w "HTTP Status: %%{http_code}\n" %API_URL%/login
echo.

echo [2] Testing /api/stats (requires login)...
curl -s -w "\nHTTP Status: %%{http_code}\n" %API_URL%/api/stats -H "Content-Type: application/json"
echo.

echo [3] Testing /api/devices (requires login)...
curl -s -w "\nHTTP Status: %%{http_code}\n" %API_URL%/api/devices -H "Content-Type: application/json"
echo.

echo [4] Testing /api/user (requires login)...
curl -s -w "\nHTTP Status: %%{http_code}\n" %API_URL%/api/user -H "Content-Type: application/json"
echo.

echo [5] Testing /api/ai-chat with POST...
curl -X POST %API_URL%/api/ai-chat ^
  -H "Content-Type: application/json" ^
  -d "{\"message\": \"Tổng công suất?\"}" ^
  -w "\nHTTP Status: %%{http_code}\n"
echo.

echo ===================================
echo Test completed!
echo ===================================
echo.
echo If you see 200 or 401 (unauthorized), backend is working.
echo If you see connection refused, backend is NOT running.
echo.
echo To fix: Run "python app.py" in another PowerShell window
pause
