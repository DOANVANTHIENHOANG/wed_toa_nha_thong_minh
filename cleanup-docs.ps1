# Smart Energy Dashboard - Documentation Cleanup
Write-Host "🧹 Starting Documentation Cleanup..." -ForegroundColor Cyan

# Create folders
New-Item -ItemType Directory -Path "docs/archive" -Force | Out-Null
Write-Host "✅ Created /docs and /docs/archive" -ForegroundColor Green

# Copy 7 main files
Write-Host "`n📋 Copying main documentation..." -ForegroundColor Cyan
$mainFiles = @("README_V2.1_PROFESSIONAL.md", "QUICK_START.md", "API_DOCUMENTATION.md", "ARCHITECTURE.md", "GAP_ANALYSIS_VI.md", "ACTION_ITEMS_VI.md", "INTEGRATION_EXAMPLES.md")
$mainFiles | ForEach-Object {
    if (Test-Path $_) {
        Copy-Item $_ "docs/" -Force
        Write-Host "  ✅ $_" -ForegroundColor Green
    }
}

# Move all other .md files to archive
Write-Host "`n📦 Moving old files to archive..." -ForegroundColor Cyan
Get-ChildItem -Filter "*.md" -File | Where-Object { $_.Name -notin $mainFiles -and $_.Name -ne "README_CURRENT_STATE.md" } | ForEach-Object {
    Move-Item $_.Name "docs/archive/" -Force
    Write-Host "  📦 $($_.Name)" -ForegroundColor Gray
}

# Copy README_CURRENT_STATE to root
if (Test-Path "docs/README_CURRENT_STATE.md") {
    Copy-Item "docs/README_CURRENT_STATE.md" "./" -Force
    Write-Host "`n✅ Created README_CURRENT_STATE.md" -ForegroundColor Green
}

Write-Host "`n✨ Done! Files organized in /docs/" -ForegroundColor Cyan

