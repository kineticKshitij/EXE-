# PostgreSQL Database Creation Script for EXE+
Write-Host "🗄️  PostgreSQL Database Setup" -ForegroundColor Cyan

# Add PostgreSQL to PATH
$env:Path = "C:\Program Files\PostgreSQL\18\bin;$env:Path"

Write-Host "`n📋 This script will create the 'exe_db' database." -ForegroundColor Yellow
Write-Host "You will be prompted for the PostgreSQL 'postgres' user password." -ForegroundColor Yellow

# Option 1: Create database using createdb
Write-Host "`nAttempting to create database 'exe_db'..." -ForegroundColor Yellow
$result = & createdb -U postgres exe_db 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database 'exe_db' created successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Database creation via createdb failed or database already exists." -ForegroundColor Yellow
    Write-Host "`nTrying alternative method using psql..." -ForegroundColor Yellow
    
    # Option 2: Create database using psql
    $sqlCommand = "CREATE DATABASE exe_db;"
    $checkCommand = "SELECT 1 FROM pg_database WHERE datname = 'exe_db';"
    
    # Check if database exists
    $exists = & psql -U postgres -t -c $checkCommand postgres 2>&1
    
    if ($exists -match "1") {
        Write-Host "✅ Database 'exe_db' already exists!" -ForegroundColor Green
    } else {
        & psql -U postgres -c $sqlCommand postgres
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database 'exe_db' created successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to create database. Please create it manually." -ForegroundColor Red
            Write-Host "`nManual steps:" -ForegroundColor Yellow
            Write-Host "1. Open pgAdmin or psql" -ForegroundColor White
            Write-Host "2. Connect to PostgreSQL" -ForegroundColor White
            Write-Host "3. Run: CREATE DATABASE exe_db;" -ForegroundColor White
            exit 1
        }
    }
}

Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Update .env file with your PostgreSQL password" -ForegroundColor White
Write-Host "2. Run: python manage.py migrate" -ForegroundColor White
Write-Host "3. Run: python manage.py createsuperuser" -ForegroundColor White

# Test connection
Write-Host "`n🔍 Testing database connection..." -ForegroundColor Yellow
$testCommand = "\l"
$testResult = & psql -U postgres -d exe_db -c $testCommand 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Connection to 'exe_db' successful!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Could not connect to database. Please check your password." -ForegroundColor Yellow
}
