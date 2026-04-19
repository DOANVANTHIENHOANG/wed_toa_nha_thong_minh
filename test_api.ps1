# SED V2.1 - API Test Suite (PowerShell)
# Chạy các test để kiểm tra Backend hoạt động bình thường

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "SED V2.1 - API Test Suite (PowerShell)" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

$API_URL = "http://127.0.0.1:3000"
$headers = @{"Content-Type" = "application/json"; "Accept" = "application/json"}

Write-Host "[1] Testing if Backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_URL/login" -Method GET -Headers $headers -ErrorAction SilentlyContinue
    Write-Host "✓ Backend is running - HTTP Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend is NOT running or not accessible" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "FIX: Run 'python app.py' in another PowerShell window"
    exit 1
}
Write-Host ""

Write-Host "[2] Testing /api/stats (requires login)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_URL/api/stats" -Method GET -Headers $headers -ErrorAction SilentlyContinue
    Write-Host "Response Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    Write-Host "Note: 401 Unauthorized is expected (must login first)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "[3] Testing /api/devices (requires login)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_URL/api/devices" -Method GET -Headers $headers -ErrorAction SilentlyContinue
    Write-Host "Response Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "[4] Testing /api/user (requires login)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_URL/api/user" -Method GET -Headers $headers -ErrorAction SilentlyContinue
    Write-Host "Response Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "[5] Testing /api/ai-chat with POST..." -ForegroundColor Yellow
$payload = @{message = "Tổng công suất?" } | ConvertTo-Json
try {
    $response = Invoke-WebRequest -Uri "$API_URL/api/ai-chat" `
        -Method POST `
        -Headers $headers `
        -Body $payload `
        -ErrorAction SilentlyContinue
    Write-Host "Response Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Test completed!" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ If HTTP 200 or 401: Backend is working correctly" -ForegroundColor Green
Write-Host "✓ If HTTP 401: Login required - this is expected" -ForegroundColor Green
Write-Host "✗ If connection refused: Backend is NOT running" -ForegroundColor Red
Write-Host ""
Write-Host "NEXT STEP: Open 192.168.1.19:3000login in your browser" -ForegroundColor Cyan
