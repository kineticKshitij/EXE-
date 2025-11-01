# EXE+ Backend Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.10+** - [Download](https://www.python.org/downloads/)
- **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)
- **Redis** (optional, for Celery & WebSocket) - [Download](https://redis.io/download)
- **Git** - [Download](https://git-scm.com/downloads)

---

## 🚀 Quick Start

### 1. Clone and Navigate

```powershell
cd D:\Exe+\exe
```

### 2. Run Setup Script

```powershell
.\setup.ps1
```

The script will:
- ✅ Create virtual environment
- ✅ Install dependencies
- ✅ Run database migrations
- ✅ Prompt for superuser creation

---

## 🗄️ Database Setup

### Create PostgreSQL Database

```powershell
# Using psql
psql -U postgres
CREATE DATABASE exe_db;
\q

# Or using createdb command
createdb -U postgres exe_db
```

### Configure Database Connection

Update `.env` file with your PostgreSQL credentials:

```env
DB_NAME=exe_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

---

## 🔧 Manual Setup (Alternative)

If you prefer manual setup:

### 1. Create Virtual Environment

```powershell
python -m venv venv
```

### 2. Activate Virtual Environment

```powershell
.\venv\Scripts\Activate.ps1
```

### 3. Upgrade pip

```powershell
python -m pip install --upgrade pip
```

### 4. Install Dependencies

```powershell
pip install -r requirements.txt
```

### 5. Configure Environment Variables

Copy `.env.example` to `.env` and update values:

```powershell
cp .env.example .env
```

### 6. Run Migrations

```powershell
python manage.py makemigrations
python manage.py migrate
```

### 7. Create Superuser

```powershell
python manage.py createsuperuser
```

### 8. Start Development Server

```powershell
python manage.py runserver
```

---

## 📚 API Documentation

Once the server is running, access:

- **Swagger UI**: http://localhost:8000/api/docs/
- **API Schema**: http://localhost:8000/api/schema/
- **Admin Panel**: http://localhost:8000/admin/

---

## 🔐 Authentication Endpoints

### Register New User

```http
POST /api/v1/auth/register/
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "user_type": "student"
}
```

### Login

```http
POST /api/v1/auth/login/
Content-Type: application/json

{
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    ...
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  },
  "message": "Login successful!"
}
```

### Get Current User Profile

```http
GET /api/v1/users/me/
Authorization: Bearer <access_token>
```

### Refresh Token

```http
POST /api/v1/auth/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Logout

```http
POST /api/v1/auth/logout/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## 🎯 User Types

The system supports four user types:

- **student** - Takes exams and interviews
- **teacher** - Creates and manages exams
- **recruiter** - Conducts interviews and reviews candidates
- **admin** - Full system access

---

## 🔧 Development Tools

### Create Migrations

```powershell
python manage.py makemigrations
```

### Apply Migrations

```powershell
python manage.py migrate
```

### Create Superuser

```powershell
python manage.py createsuperuser
```

### Run Tests

```powershell
python manage.py test
```

### Start Celery Worker (for async tasks)

```powershell
celery -A exe worker -l info
```

### Start Celery Beat (for scheduled tasks)

```powershell
celery -A exe beat -l info
```

---

## 📁 Project Structure

```
exe/
├── apps/
│   ├── users/          # User authentication & profiles
│   ├── exams/          # Exam management
│   ├── interview/      # Interview system
│   ├── ai_engine/      # AI integration (Gemini/OpenAI)
│   ├── analytics/      # Performance analytics
│   ├── notifications/  # Real-time notifications
│   └── payments/       # Subscription & payments
├── exe/
│   ├── settings.py     # Django settings
│   ├── urls.py         # Main URL configuration
│   ├── asgi.py         # ASGI config (WebSocket)
│   └── wsgi.py         # WSGI config
├── manage.py           # Django management script
├── requirements.txt    # Python dependencies
└── .env                # Environment variables
```

---

## 🐛 Troubleshooting

### Database Connection Error

```
django.db.utils.OperationalError: could not connect to server
```

**Solution:**
- Ensure PostgreSQL is running: `pg_ctl status`
- Check `.env` database credentials
- Verify PostgreSQL accepts connections on port 5432

### Import Error: rest_framework

```
ModuleNotFoundError: No module named 'rest_framework'
```

**Solution:**
- Activate virtual environment: `.\venv\Scripts\Activate.ps1`
- Reinstall dependencies: `pip install -r requirements.txt`

### Migration Errors

```
django.db.migrations.exceptions.InconsistentMigrationHistory
```

**Solution:**
- Drop and recreate database
- Delete migration files (except `__init__.py`)
- Run `makemigrations` and `migrate` again

---

## 🌐 Environment Variables

Key environment variables in `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | Auto-generated |
| `DEBUG` | Debug mode | `True` |
| `DB_NAME` | Database name | `exe_db` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `GEMINI_API_KEY` | Google Gemini API key | - |

---

## 📞 Support

For issues or questions:
- Check the [Troubleshooting](#-troubleshooting) section
- Review API documentation at `/api/docs/`
- Check Django logs for detailed error messages

---

## ✅ Next Steps

After setup:

1. ✅ Test authentication endpoints
2. ✅ Create test users via API or admin panel
3. ✅ Implement exam models
4. ✅ Implement interview models
5. ✅ Integrate AI engine
6. ✅ Build frontend integration
