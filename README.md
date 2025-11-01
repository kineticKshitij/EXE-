# EXE+ AI Interview Platform

> AI-powered exam and interview simulation platform to help candidates ace their technical interviews and assessments.

[![Django](https://img.shields.io/badge/Django-5.2.7-green.svg)](https://www.djangoproject.com/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.4-blue.svg)](https://reactnative.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🚀 Features

### Current Features (v0.1)
- ✅ **User Authentication** - JWT-based secure authentication system
- ✅ **Multi-role Support** - Student, Teacher, Recruiter, and Admin roles
- ✅ **Dark Theme UI** - Modern, responsive dark-themed interface
- ✅ **Cross-platform** - Web, iOS, and Android support via React Native
- ✅ **Real-time API** - RESTful API with comprehensive documentation

### Coming Soon
- 🔜 **AI-Powered Interviews** - Practice with AI interviewer
- 🔜 **Exam Simulations** - Take mock exams with instant feedback
- 🔜 **Performance Analytics** - Track your progress over time
- 🔜 **Smart Recommendations** - Get personalized improvement suggestions
- 🔜 **Video Interviews** - Record and analyze interview sessions

## 📋 Prerequisites

### Backend Requirements
- Python 3.13+
- PostgreSQL 18+
- Redis (for Celery and Channels)
- pip and virtualenv

### Frontend Requirements
- Node.js 18+ and npm
- Expo CLI
- iOS/Android development environment (optional)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/kineticKshitij/EXE-.git
cd EXE-
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd exe
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

#### Configure Environment
Create a `.env` file in the `exe` directory:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=exe_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081,http://localhost:19006
```

#### Setup Database
```bash
# Create PostgreSQL database
createdb exe_db

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

#### Start Backend Server
```bash
python manage.py runserver
```

Backend will be available at: `http://127.0.0.1:8000`

API Documentation: `http://127.0.0.1:8000/api/docs/`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd AI-Interview
npm install
```

#### Configure Environment
Create a `.env` file in the `AI-Interview` directory:
```env
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```

#### Start Frontend
```bash
npx expo start
```

- Press `w` to open in web browser
- Scan QR code with Expo Go app for mobile
- Press `a` for Android emulator
- Press `i` for iOS simulator

## 📱 Tech Stack

### Backend
- **Framework**: Django 5.2.7
- **API**: Django REST Framework 3.15.2
- **Database**: PostgreSQL 18
- **Authentication**: JWT (djangorestframework-simplejwt 5.3.1)
- **Task Queue**: Celery 5.4.0 + Redis 5.2.0
- **WebSocket**: Channels 4.1.0 + Daphne 4.1.2
- **Documentation**: drf-spectacular 0.27.2

### Frontend
- **Framework**: React Native 0.81.4
- **Platform**: Expo SDK 54.0.1
- **Routing**: Expo Router 6.0.0
- **Language**: TypeScript 5.9.2
- **Styling**: NativeWind 4.0.1 (Tailwind CSS)
- **HTTP Client**: Axios
- **Storage**: AsyncStorage

### AI/ML (Planned)
- OpenAI API
- Speech-to-Text / Text-to-Speech

## 🏗️ Project Structure

```
EXE+/
├── exe/                          # Django Backend
│   ├── apps/
│   │   ├── users/               # User management
│   │   ├── exams/               # Exam system
│   │   ├── interview/           # Interview features
│   │   ├── ai_engine/           # AI integration
│   │   ├── analytics/           # Performance analytics
│   │   ├── notifications/       # Notification system
│   │   └── payments/            # Payment processing
│   ├── exe/                     # Project settings
│   ├── manage.py
│   └── requirements.txt
│
├── AI-Interview/                # React Native Frontend
│   ├── src/
│   │   ├── app/                 # Screens (Expo Router)
│   │   ├── components/          # Reusable components
│   │   ├── config/              # API configuration
│   │   ├── context/             # React Context
│   │   ├── services/            # API services
│   │   └── utils/               # Utility functions
│   ├── package.json
│   └── tsconfig.json
│
├── PROJECT_TASKS.md             # Task tracking
└── README.md                    # This file
```

## 🔑 API Endpoints

### Authentication
- `POST /api/v1/auth/register/` - User registration
- `POST /api/v1/auth/login/` - User login
- `POST /api/v1/auth/logout/` - User logout
- `POST /api/v1/auth/token/refresh/` - Refresh JWT token

### Users
- `GET /api/v1/users/me/` - Get current user profile
- `PATCH /api/v1/users/update_profile/` - Update user profile
- `POST /api/v1/users/change_password/` - Change password
- `GET /api/v1/users/sessions/` - List active sessions

### Documentation
- `GET /api/docs/` - Swagger UI documentation
- `GET /api/schema/` - OpenAPI schema

## 🎨 Screenshots

### Dashboard
Modern dark-themed dashboard with performance stats, quick actions, and recent activity.

### Authentication
Secure login and registration with comprehensive error handling.

### Custom Cursor
Premium custom cursor effect on web platform.

## 🧪 Testing

### Backend Tests
```bash
cd exe
python manage.py test
```

### Frontend Tests
```bash
cd AI-Interview
npm test
```

## 📊 Current Progress

- ✅ Project setup and infrastructure (100%)
- ✅ Authentication system (100%)
- ✅ Dark themed UI (100%)
- 🔄 Exam system (0%)
- 🔄 Interview features (0%)
- 🔄 AI integration (0%)
- 🔄 Analytics (0%)

See [PROJECT_TASKS.md](PROJECT_TASKS.md) for detailed task tracking.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Kshitij**
- GitHub: [@kineticKshitij](https://github.com/kineticKshitij)

## 🙏 Acknowledgments

- Django and Django REST Framework teams
- React Native and Expo teams
- PostgreSQL community
- All open-source contributors

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

## 🗺️ Roadmap

### Phase 1 (Current) - Authentication & UI ✅
- User registration and login
- JWT authentication
- Dark themed dashboard

### Phase 2 - Core Features 🔄
- Exam management system
- Interview simulation
- AI question generation

### Phase 3 - Analytics & Reports
- Performance tracking
- Detailed analytics
- Export functionality

### Phase 4 - Premium Features
- Subscription tiers
- Advanced AI features
- Video interviews

### Phase 5 - Social & Gamification
- Leaderboards
- Achievements
- Study groups

---

Made with ❤️ by Kshitij
