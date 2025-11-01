# Quick Database Setup Guide

## Option 1: Using pgAdmin (Recommended for Windows)

1. Open **pgAdmin 4** (installed with PostgreSQL)
2. Connect to your PostgreSQL server
3. Right-click on "Databases"
4. Select "Create" → "Database"
5. Name it: `exe_db`
6. Click "Save"

## Option 2: Using psql Command Line

```powershell
# Add PostgreSQL to PATH (for current session)
$env:Path = "C:\Program Files\PostgreSQL\18\bin;$env:Path"

# Connect to PostgreSQL and create database
psql -U postgres
# Then in psql prompt, run:
CREATE DATABASE exe_db;
\q
```

## Option 3: Using the provided script

```powershell
cd D:\Exe+\exe
.\create_db.ps1
```

## Update Your Password

After creating the database, update the `.env` file with your actual PostgreSQL password:

```env
DB_PASSWORD=your_actual_postgres_password
```

## Verify Database Creation

```powershell
# List all databases
psql -U postgres -l

# Or connect to the database
psql -U postgres -d exe_db
```

## Run Migrations

Once the database is created and password is set:

```powershell
cd D:\Exe+\exe
.\venv\Scripts\Activate.ps1
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Troubleshooting

### Password Authentication Failed

If you get "password authentication failed":

1. Check your PostgreSQL password
2. Update `DB_PASSWORD` in `.env`
3. Or reset PostgreSQL password using pgAdmin

### Connection Refused

If PostgreSQL is not running:

1. Open Windows Services (Win + R → `services.msc`)
2. Find "postgresql-x64-18"
3. Start the service

### Database Already Exists

If database already exists, that's fine! Just skip to running migrations.
