# Run as Administrator
Write-Host "🔄 Resetting PostgreSQL Password..." -ForegroundColor Cyan

# Step 1: Stop service
Write-Host "`n1. Stopping PostgreSQL service..." -ForegroundColor Yellow
Stop-Service postgresql-x64-18

# Step 2: Backup and modify pg_hba.conf
$pgHbaPath = "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"
$backup = "$pgHbaPath.backup"
Copy-Item $pgHbaPath $backup
Write-Host "2. Backed up pg_hba.conf" -ForegroundColor Green

(Get-Content $pgHbaPath) -replace 'scram-sha-256', 'trust' | Set-Content $pgHbaPath
Write-Host "3. Modified authentication to 'trust'" -ForegroundColor Green

# Step 3: Start service
Write-Host "`n4. Starting PostgreSQL service..." -ForegroundColor Yellow
Start-Service postgresql-x64-18
Start-Sleep -Seconds 3

# Step 4: Reset password
Write-Host "`n5. Enter new password for postgres user:" -ForegroundColor Yellow
$newPassword = Read-Host "New Password" -AsSecureString
$plaintextPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($newPassword))

$env:Path = "C:\Program Files\PostgreSQL\18\bin;$env:Path"
$sql = "ALTER USER postgres WITH PASSWORD '$plaintextPassword';"
psql -U postgres -c $sql

# Step 5: Restore security
Write-Host "`n6. Restoring security settings..." -ForegroundColor Yellow
Copy-Item $backup $pgHbaPath -Force
Remove-Item $backup

# Step 6: Restart service
Write-Host "7. Restarting PostgreSQL service..." -ForegroundColor Yellow
Restart-Service postgresql-x64-18

Write-Host "`n✅ Password reset complete!" -ForegroundColor Green
Write-Host "Test with: psql -U postgres" -ForegroundColor Cyan