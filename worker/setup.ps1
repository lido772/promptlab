# PromptUp Worker Setup Script (PowerShell)
# This script automates KV namespace creation and configuration for Windows

Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  PromptUp Worker Setup Script          ║" -ForegroundColor Cyan
Write-Host "║  Cloudflare Workers Configuration     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if wrangler is installed
Write-Host "🔧 Checking Wrangler installation..." -ForegroundColor Yellow
$wrangler = Get-Command wrangler -ErrorAction SilentlyContinue

if (-not $wrangler) {
    Write-Host "❌ Wrangler not found. Installing globally..." -ForegroundColor Red
    npm install -g wrangler
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Wrangler" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Wrangler installed" -ForegroundColor Green
wrangler --version
Write-Host ""

# Step 1: Verify authentication
Write-Host "🔐 Checking Cloudflare authentication..." -ForegroundColor Yellow
$authCheck = wrangler whoami 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Authenticated with Cloudflare" -ForegroundColor Green
} else {
    Write-Host "❌ Not authenticated. Please run: wrangler login" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Create KV namespaces
Write-Host "📦 Creating KV namespaces..." -ForegroundColor Yellow

# Production namespace
Write-Host "  Creating PRODUCTION namespace..." -ForegroundColor Cyan
$prodOutput = wrangler kv:namespace create "RATE_LIMIT_KV" 2>&1

# Extract ID from output (format varies)
$prodId = ""

# Try parsing JSON style: "id": "abc123"
if ($prodOutput -match 'id[\s]*[:=][\s]*["\']([a-f0-9]{16})["\']') {
    $prodId = $matches[1]
} elseif ($prodOutput -match '\b([a-f0-9]{16})\b') {
    $prodId = $matches[1]
}

if ($prodId) {
    Write-Host "    ✅ Production ID: $prodId" -ForegroundColor Green
} else {
    Write-Host "    ❌ Failed to create production namespace" -ForegroundColor Red
    Write-Host "    Output: $prodOutput" -ForegroundColor Red
    exit 1
}

# Preview namespace
Write-Host "  Creating PREVIEW namespace..." -ForegroundColor Cyan
$previewOutput = wrangler kv:namespace create "RATE_LIMIT_KV" --preview 2>&1

$previewId = ""

# Extract ID
if ($previewOutput -match 'id[\s]*[:=][\s]*["\']([a-f0-9]{16})["\']') {
    $previewId = $matches[1]
} elseif ($previewOutput -match '\b([a-f0-9]{16})\b') {
    $previewId = $matches[1]
}

if ($previewId) {
    Write-Host "    ✅ Preview ID: $previewId" -ForegroundColor Green
} else {
    Write-Host "    ⚠️  Could not extract preview ID. Using production ID" -ForegroundColor Yellow
    $previewId = $prodId
}

Write-Host ""

# Step 3: Update wrangler.toml
Write-Host "📝 Updating wrangler.toml..." -ForegroundColor Yellow

$wranglerFile = "wrangler.toml"

if (-not (Test-Path $wranglerFile)) {
    Write-Host "    ❌ wrangler.toml not found in current directory" -ForegroundColor Red
    Write-Host "    Current directory: $(Get-Location)" -ForegroundColor Red
    exit 1
}

# Create backup
$backupFile = "$wranglerFile.backup"
Copy-Item $wranglerFile -Destination $backupFile
Write-Host "  ✅ Backup created: $backupFile" -ForegroundColor Green

# Read file
$content = Get-Content $wranglerFile -Raw

# Replace placeholder IDs
$content = $content -replace 'id = "your-kv-namespace-id-here"', "id = ""$prodId"""
$content = $content -replace 'preview_id = "your-preview-kv-namespace-id-here"', "preview_id = ""$previewId"""

# Write back
$content | Set-Content $wranglerFile
Write-Host "  ✅ Updated KV namespace IDs in wrangler.toml" -ForegroundColor Green

Write-Host ""

# Step 4: Display summary
Write-Host "✓ Configuration Summary:" -ForegroundColor Green
Write-Host "  Production ID: $prodId" -ForegroundColor Gray
Write-Host "  Preview ID:   $previewId" -ForegroundColor Gray
Write-Host "  Config File:  $wranglerFile" -ForegroundColor Gray
Write-Host ""

# Step 5: Configure secrets
Write-Host "🔑 Configuring secrets..." -ForegroundColor Yellow

$setGemini = Read-Host "  Do you want to set GEMINI_API_KEY secret now? (y/n)"

if ($setGemini -eq "y" -or $setGemini -eq "Y") {
    Write-Host "  ⚠️  You'll be prompted to enter your Gemini API key securely" -ForegroundColor Yellow
    wrangler secret put GEMINI_API_KEY
    Write-Host "    ✅ GEMINI_API_KEY configured" -ForegroundColor Green
} else {
    Write-Host "    ⏭️  Skipped. You can set it later with:" -ForegroundColor Yellow
    Write-Host "      wrangler secret put GEMINI_API_KEY" -ForegroundColor Gray
}

Write-Host ""

# Step 6: Ready to deploy
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ Setup Complete!                    ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Deploy: wrangler deploy" -ForegroundColor Gray
Write-Host "  2. Copy the worker URL from the output" -ForegroundColor Gray
Write-Host "  3. Update index.html with your worker URL" -ForegroundColor Gray
Write-Host "  4. Deploy frontend to GitHub Pages" -ForegroundColor Gray
Write-Host ""

Write-Host "To verify configuration:" -ForegroundColor Cyan
Write-Host "  Get-Content wrangler.toml | Select-String 'RATE_LIMIT_KV' -A 3" -ForegroundColor Gray
Write-Host "  wrangler secret list" -ForegroundColor Gray
Write-Host ""

# Step 7: Ask to deploy now
$deploy = Read-Host "Ready to deploy now? (y/n)"
if ($deploy -eq "y" -or $deploy -eq "Y") {
    Write-Host ""
    Write-Host "🚀 Deploying worker..." -ForegroundColor Yellow
    wrangler deploy
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Deployment successful!" -ForegroundColor Green
        Write-Host "Your worker is now live!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Deployment failed. Check logs above." -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "When ready to deploy, run:" -ForegroundColor Yellow
    Write-Host "  wrangler deploy" -ForegroundColor Gray
}

Write-Host ""
