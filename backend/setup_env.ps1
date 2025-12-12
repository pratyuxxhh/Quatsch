# PowerShell script to set up environment variables for authentication
# Run this script before starting the backend server

Write-Host "=== Quatsch Authentication Setup ===" -ForegroundColor Cyan
Write-Host ""

# Get email address
$email = Read-Host "Enter your Gmail address"
if (-not $email) {
    Write-Host "Error: Email address is required!" -ForegroundColor Red
    exit 1
}

# Get app password
Write-Host ""
Write-Host "To get your App Password:" -ForegroundColor Yellow
Write-Host "1. Go to: https://myaccount.google.com/apppasswords" -ForegroundColor Yellow
Write-Host "2. Generate an App Password for 'Mail'" -ForegroundColor Yellow
Write-Host "3. Copy the 16-character password" -ForegroundColor Yellow
Write-Host ""
$appPassword = Read-Host "Enter your Gmail App Password (16 characters)" -AsSecureString
$appPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($appPassword)
)

# Generate secret key
$secretKey = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Set environment variables
$env:EMAIL_ADDRESS = $email
$env:EMAIL_PASSWORD = $appPasswordPlain
$env:SECRET_KEY = $secretKey

Write-Host ""
Write-Host "✅ Environment variables set successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the backend server, run:" -ForegroundColor Cyan
Write-Host "  python app/main.py" -ForegroundColor White
Write-Host ""
Write-Host "Note: These environment variables are only set for this PowerShell session." -ForegroundColor Yellow
Write-Host "To make them permanent, add them to your system environment variables." -ForegroundColor Yellow

