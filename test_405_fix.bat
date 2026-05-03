@echo off
REM Test script for Windows PowerShell - Verify 405 fix

setlocal enabledelayedexpansion

set BASE_URL=http://localhost:3000
set REGISTER_URL=%BASE_URL%/register

echo.
echo ========================================
echo Test: Fix loi 405 Method Not Allowed
echo ========================================
echo.

echo [TEST 1] GET request - Fetch register form
echo Expected: 200 OK - HTML form page
echo.

powershell -Command "
try {
    `$response = Invoke-WebRequest -Uri 'http://localhost:3000/register' -Method GET -ErrorAction Stop
    Write-Host '✓ TEST 1 PASSED: GET 200 OK' -ForegroundColor Green
    Write-Host 'Status: '$response.StatusCode
} catch {
    Write-Host '✗ TEST 1 FAILED:' $_.Exception.Message -ForegroundColor Red
}
"

echo.
echo [TEST 2] POST request - Submit form with valid credentials
echo Expected: 201 Created (success) or 400 (validation error, but NOT 405)
echo.

powershell -Command "
try {
    `$body = @{
        fullname = 'Nguyen Van Anh'
        contact = 'john@example.com'
        room_code = 'CB-L1-1'
        meter_code = 'CT-L1-001'
        address = 'Quan Thanh Khe'
        password = 'Password123!'
    } | ConvertTo-Json
    
    `$response = Invoke-WebRequest -Uri 'http://localhost:3000/register' -Method POST `
        -ContentType 'application/json' `
        -Body `$body -ErrorAction Stop
    
    Write-Host '✓ TEST 2 PASSED: POST request successful' -ForegroundColor Green
    Write-Host 'Status: '$response.StatusCode
    Write-Host 'Response: '`$response.Content
} catch {
    `$statusCode = `$_.Exception.Response.StatusCode.Value__
    if (`$statusCode -eq 405) {
        Write-Host '✗ TEST 2 FAILED: 405 Method Not Allowed - FIX NOT APPLIED' -ForegroundColor Red
    } elseif (`$statusCode -eq 400 -or `$statusCode -eq 201) {
        Write-Host '✓ TEST 2 PASSED: POST endpoint working (Status: '$statusCode')' -ForegroundColor Green
    } else {
        Write-Host '⚠ TEST 2 PARTIAL: Unexpected status '$statusCode -ForegroundColor Yellow
    }
}
"

echo.
echo ========================================
echo Tests completed!
echo ========================================
echo.
