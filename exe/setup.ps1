# EXE+ Backend Setup Script
Write-Host "🚀 Starting EXE+ Backend Setup..." -ForegroundColor Cyan

# Check if Python is installed
Write-Host "`n📦 Checking Python installation..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Python is not installed. Please install Python 3.10+ first." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green

# Check if PostgreSQL is installed
Write-Host "`n🐘 Checking PostgreSQL installation..." -ForegroundColor Yellow
$pgVersion = psql --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  PostgreSQL is not installed or not in PATH." -ForegroundColor Yellow
    Write-Host "Please install PostgreSQL from: https://www.postgresql.org/download/" -ForegroundColor Yellow
    $continue = Read-Host "Do you want to continue anyway? (y/n)"
    if ($continue -ne 'y') {
        exit 1
    }
} else {
    Write-Host "✅ PostgreSQL found: $pgVersion" -ForegroundColor Green
}

# Create virtual environment if not exists
Write-Host "`n🔧 Setting up virtual environment..." -ForegroundColor Yellow
if (-Not (Test-Path "venv")) {
    python -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
} else {
    Write-Host "✅ Virtual environment already exists" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "`n🔄 Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Upgrade pip
Write-Host "`n📦 Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Install dependencies
Write-Host "`n📦 Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green

# Create database
Write-Host "`n🗄️  Setting up PostgreSQL database..." -ForegroundColor Yellow
Write-Host "Please ensure PostgreSQL is running and you have created the database 'exe_db'" -ForegroundColor Yellow
Write-Host "You can create it by running: createdb exe_db" -ForegroundColor Cyan

# Run migrations
Write-Host "`n🔄 Running database migrations..." -ForegroundColor Yellow
python manage.py makemigrations
python manage.py migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Migration failed. Please check your database connection." -ForegroundColor Yellow
} else {
    Write-Host "✅ Migrations completed" -ForegroundColor Green
}

# Create superuser prompt
Write-Host "`n👤 Would you like to create a superuser? (y/n)" -ForegroundColor Yellow
$createSuperuser = Read-Host
if ($createSuperuser -eq 'y') {
    python manage.py createsuperuser
}

# Setup complete
Write-Host "`n✨ Setup completed successfully!" -ForegroundColor Green
Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Update .env file with your credentials" -ForegroundColor White
Write-Host "2. Ensure PostgreSQL is running" -ForegroundColor White
Write-Host "3. Run: python manage.py runserver" -ForegroundColor White
Write-Host "4. Access API docs at: http://localhost:8000/api/docs/" -ForegroundColor White
Write-Host "5. Access admin panel at: http://localhost:8000/admin/" -ForegroundColor White
