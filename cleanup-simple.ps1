# Cleanup Script - Simple Version
Write-Host "Starting cleanup..." -ForegroundColor Cyan

# Create folders
New-Item -ItemType Directory -Path "docs/archive" -Force | Out-Null

# Copy main 7 files
Copy-Item "README_V2.1_PROFESSIONAL.md" "docs/" -Force -ErrorAction SilentlyContinue
Copy-Item "QUICK_START.md" "docs/" -Force -ErrorAction SilentlyContinue
Copy-Item "API_DOCUMENTATION.md" "docs/" -Force -ErrorAction SilentlyContinue
Copy-Item "ARCHITECTURE.md" "docs/" -Force -ErrorAction SilentlyContinue
Copy-Item "GAP_ANALYSIS_VI.md" "docs/" -Force -ErrorAction SilentlyContinue
Copy-Item "ACTION_ITEMS_VI.md" "docs/" -Force -ErrorAction SilentlyContinue
Copy-Item "INTEGRATION_EXAMPLES.md" "docs/" -Force -ErrorAction SilentlyContinue

Write-Host "Copied main files to docs/" -ForegroundColor Green

# Move all other .md files (except README_CURRENT_STATE.md) to archive
$excluded = @("README_V2.1_PROFESSIONAL.md", "QUICK_START.md", "API_DOCUMENTATION.md", "ARCHITECTURE.md", "GAP_ANALYSIS_VI.md", "ACTION_ITEMS_VI.md", "INTEGRATION_EXAMPLES.md", "README_CURRENT_STATE.md", "cleanup-docs.ps1")

Get-ChildItem -Filter "*.md" -File | Where-Object { $_.Name -notin $excluded } | Move-Item -Destination "docs/archive/" -Force

Write-Host "Moved old files to archive" -ForegroundColor Green

# Copy README_CURRENT_STATE to root
Copy-Item "docs/README_CURRENT_STATE.md" "./" -Force -ErrorAction SilentlyContinue

Write-Host "Cleanup Complete!" -ForegroundColor Cyan
