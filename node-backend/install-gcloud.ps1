# Google Cloud CLI Installation Script for Windows
# Run this script as Administrator

Write-Host "🚀 Installing Google Cloud CLI for Windows..." -ForegroundColor Green
Write-Host ""

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Set execution policy
Write-Host "📋 Setting execution policy..." -ForegroundColor Blue
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# Create temp directory
$tempDir = "$env:TEMP\gcloud-install"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Download Google Cloud CLI
Write-Host "📥 Downloading Google Cloud CLI..." -ForegroundColor Blue
$downloadUrl = "https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe"
$installerPath = "$tempDir\GoogleCloudSDKInstaller.exe"

try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "✅ Download completed!" -ForegroundColor Green
} catch {
    Write-Host "❌ Download failed: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install Google Cloud CLI
Write-Host "🔨 Installing Google Cloud CLI..." -ForegroundColor Blue
Write-Host "Please follow the installation wizard..." -ForegroundColor Yellow

try {
    Start-Process -FilePath $installerPath -ArgumentList "/S" -Wait
    Write-Host "✅ Installation completed!" -ForegroundColor Green
} catch {
    Write-Host "❌ Installation failed: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Clean up
Write-Host "🧹 Cleaning up temporary files..." -ForegroundColor Blue
Remove-Item $tempDir -Recurse -Force

# Refresh environment variables
Write-Host "🔄 Refreshing environment variables..." -ForegroundColor Blue
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Verify installation
Write-Host "🔍 Verifying installation..." -ForegroundColor Blue
try {
    $gcloudVersion = gcloud --version 2>$null
    if ($gcloudVersion) {
        Write-Host "✅ Google Cloud CLI installed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Next steps:" -ForegroundColor Yellow
        Write-Host "1. Close and reopen your terminal/PowerShell" -ForegroundColor White
        Write-Host "2. Run: gcloud init" -ForegroundColor White
        Write-Host "3. Or run the setup script: setup-google-cloud.bat" -ForegroundColor White
    } else {
        Write-Host "⚠️ Installation may need a terminal restart to take effect" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Installation completed, but verification failed" -ForegroundColor Yellow
    Write-Host "Please restart your terminal and try: gcloud --version" -ForegroundColor White
}

Write-Host ""
Write-Host "🎉 Installation script completed!" -ForegroundColor Green
Read-Host "Press Enter to exit"
