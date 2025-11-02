# 🎤 Interview System - Complete Implementation

## Overview

A comprehensive AI-powered mock interview system built with Django REST Framework. Features include AI-generated questions, automated evaluation, real-time feedback, and interview templates.

---

## 📊 Database Models

### 1. **Interview Model**

Main interview session model tracking the entire interview lifecycle.

**Fields:**

- `user`: Foreign key to User (interviewer)
- `title`: Interview title
- `description`: Detailed description
- `interview_type`: Choice field (technical, behavioral, system_design, coding, hr)
- `difficulty`: Choice field (easy, medium, hard)
- `job_role`: Target job role (e.g., "Senior Frontend Developer")
- `company_name`: Company name (optional)
- `job_description`: Detailed job description
- `required_skills`: JSON array of required skills
- `duration_minutes`: Interview duration (default: 30)
- `total_questions`: Number of questions (default: 5)
- `use_ai`: Boolean for AI question generation and evaluation
- `enable_video`: Boolean for video recording
- `enable_audio`: Boolean for audio recording
- `status`: Choice field (scheduled, in_progress, completed, cancelled)
- `scheduled_at, started_at, completed_at`: Timestamps
- `total_score, max_score, percentage`: Scoring fields
- `overall_feedback`: AI-generated feedback
- `strengths, weaknesses, recommendations`: JSON arrays

**Methods:**

- `calculate_score()`: Calculate total score from all responses

---

### 2. **InterviewQuestion Model**

Questions asked during the interview.

**Fields:**

- `interview`: Foreign key to Interview
- `question_text`: The question content
- `question_type`: Choice field (technical, behavioral, coding, system_design, general)
- `difficulty`: Easy, medium, or hard
- `expected_duration_minutes`: Expected time to answer (default: 5)
- `expected_answer`: Sample answer or key points
- `evaluation_criteria`: JSON array of criteria
- `order`: Question order in interview
- `is_ai_generated`: Boolean flag

---

### 3. **InterviewResponse Model**

User's responses to interview questions.

**Fields:**

- `interview`: Foreign key to Interview
- `question`: Foreign key to InterviewQuestion
- `text_response`: Text answer
- `audio_url`: URL to audio recording (optional)
- `video_url`: URL to video recording (optional)
- `code_response`: Code solution for coding questions
- `time_taken_seconds`: Time taken to answer
- `started_at, submitted_at`: Timestamps
- `score`: Float (0.0 to 10.0)
- `ai_feedback`: AI-generated feedback
- `evaluation_metrics`: JSON dict with metrics (clarity, accuracy, depth, etc.)
- `is_evaluated`: Boolean flag
- `needs_review`: Flag for manual review

---

### 4. **InterviewTemplate Model**

Reusable interview templates for common scenarios.

**Fields:**

- `title`: Template title
- `description`: Template description
- `interview_type`: Type of interview
- `difficulty`: Difficulty level
- `duration_minutes`: Suggested duration
- `questions`: JSON array of question templates
- `times_used`: Usage counter
- `average_score`: Average score across all uses
- `is_active`: Visibility flag
- `is_premium`: Premium feature flag
- `created_by`: Foreign key to User

---

## 🛠️ API Endpoints

### Authentication

```
POST /api/v1/auth/login/
Body: {"username": "string", "password": "string"}
Response: {"access": "token", "refresh": "token", "user": {...}}
```

### Interviews

#### List Interviews

```http
GET /api/v1/interviews/
Query Parameters:
  - status: scheduled|in_progress|completed|cancelled
  - type: technical|behavioral|system_design|coding|hr
  - difficulty: easy|medium|hard

Response: {
  "count": 10,
  "next": "url",
  "previous": null,
  "results": [...]
}
```

#### Create Interview

```http
POST /api/v1/interviews/
Body: {
  "title": "Frontend Developer Interview",
  "description": "Interview for React position",
  "interview_type": "technical",
  "difficulty": "medium",
  "job_role": "Senior Frontend Developer",
  "company_name": "TechCorp",
  "required_skills": ["React", "TypeScript", "Redux"],
  "duration_minutes": 45,
  "total_questions": 5,
  "use_ai": true,
  "enable_video": false,
  "enable_audio": true
}

Response: {
  "message": "Interview created successfully",
  "interview": {...}
}
```

#### Get Interview Details

```http
GET /api/v1/interviews/{id}/

Response: {
  "id": 1,
  "title": "...",
  "description": "...",
  "interview_type": "technical",
  "difficulty": "medium",
  "job_role": "...",
  "company_name": "...",
  "status": "scheduled",
  "questions": [...],
  "total_score": 0.0,
  "percentage": 0.0,
  ...
}
```

#### Start Interview

```http
POST /api/v1/interviews/{id}/start/

Response: {
  "message": "Interview started successfully",
  "interview": {
    "status": "in_progress",
    "started_at": "2025-11-02T10:30:00Z",
    ...
  }
}
```

#### Get Questions

```http
GET /api/v1/interviews/{id}/questions/

Response: [
  {
    "id": 1,
    "question_text": "Explain React hooks...",
    "question_type": "technical",
    "difficulty": "medium",
    "expected_duration_minutes": 5,
    "order": 1,
    "is_ai_generated": true
  },
  ...
]
```

#### Submit Response

```http
POST /api/v1/interviews/{id}/submit_response/
Body: {
  "question_id": 1,
  "text_response": "React hooks are functions that...",
  "audio_url": "https://...",  // optional
  "video_url": "https://...",  // optional
  "code_response": "function useCustomHook() {...}",  // optional
  "time_taken_seconds": 180
}

Response: {
  "message": "Response submitted successfully",
  "response": {
    "id": 1,
    "score": 7.5,
    "ai_feedback": "Good explanation. Consider adding more examples.",
    "evaluation_metrics": {
      "clarity": 8,
      "relevance": 7,
      "depth": 7,
      "technical_accuracy": 8
    },
    "is_evaluated": true,
    ...
  }
}
```

#### Complete Interview

```http
POST /api/v1/interviews/{id}/complete/

Response: {
  "message": "Interview completed successfully",
  "interview": {
    "status": "completed",
    "completed_at": "2025-11-02T11:15:00Z",
    "total_score": 32.5,
    "percentage": 81.25,
    "overall_feedback": "Excellent performance...",
    "strengths": ["Clear communication", "Technical depth"],
    "weaknesses": ["Could provide more examples"],
    "recommendations": ["Practice system design", "Study advanced patterns"],
    ...
  }
}
```

#### Get Results

```http
GET /api/v1/interviews/{id}/results/

Response: {
  "id": 1,
  "title": "...",
  "interview_type": "technical",
  "total_score": 32.5,
  "percentage": 81.25,
  "overall_feedback": "...",
  "strengths": [...],
  "weaknesses": [...],
  "recommendations": [...],
  "questions": [...],  // with expected answers
  "responses": [...]   // with user answers and scores
}
```

#### My Interview History

```http
GET /api/v1/interviews/my_interviews/

Response: [
  {
    "id": 1,
    "title": "...",
    "status": "completed",
    "percentage": 81.25,
    "created_at": "2025-11-02T10:00:00Z",
    ...
  },
  ...
]
```

### Templates

#### List Templates

```http
GET /api/v1/templates/
Query Parameters:
  - type: technical|behavioral|system_design|coding|hr
  - difficulty: easy|medium|hard

Response: [
  {
    "id": 1,
    "title": "Frontend Developer Interview",
    "description": "...",
    "interview_type": "technical",
    "difficulty": "medium",
    "duration_minutes": 45,
    "questions": [...],
    "times_used": 15,
    "average_score": 75.3,
    "is_premium": false
  },
  ...
]
```

#### Get Template Details

```http
GET /api/v1/templates/{id}/

Response: {
  "id": 1,
  "title": "...",
  "description": "...",
  "questions": [
    {
      "question": "Explain React hooks...",
      "type": "technical",
      "difficulty": "medium",
      "expected_answer": "..."
    },
    ...
  ],
  ...
}
```

#### Use Template

```http
POST /api/v1/templates/{id}/use_template/
Body: {
  "job_role": "Frontend Developer",
  "company_name": "TechCorp"
}

Response: {
  "message": "Interview created from template",
  "interview": {
    "id": 5,
    "title": "Frontend Developer Interview",
    "questions": [...],  // questions from template
    "status": "scheduled",
    ...
  }
}
```

---

## 📁 File Structure

```
exe/apps/interview/
├── __init__.py
├── admin.py              # Django admin configuration
├── apps.py
├── models.py             # Interview, Question, Response, Template models
├── serializers.py        # DRF serializers
├── urls.py               # URL routing
├── views.py              # API ViewSets
└── migrations/
    └── 0001_initial.py   # Database migration
```

---

## 🧪 Sample Data

**Templates Created:**

1. Frontend Developer Interview (4 questions, medium, technical)
2. Python Backend Engineer (5 questions, hard, technical)
3. System Design Interview (3 questions, hard, system_design)
4. Behavioral Interview (5 questions, easy, behavioral)

**Sample Interviews:**

1. **Frontend Developer at TechCorp** (scheduled)
   - 5 technical questions about React, TypeScript, APIs

2. **Backend Engineer at StartupX** (completed)
   - 4 questions about Django, databases, caching
   - Score: 80% (32/40 points)

3. **Full Stack Developer Interview** (in_progress)
   - 3 questions about databases, security, cloud

---

## 🔄 Interview Flow

### 1. **Create Interview**

```
POST /api/v1/interviews/ → Creates interview, generates AI questions
```

### 2. **Start Interview**

```
POST /api/v1/interviews/{id}/start/ → Changes status to 'in_progress'
```

### 3. **Get Questions**

```
GET /api/v1/interviews/{id}/questions/ → Retrieve questions to display
```

### 4. **Submit Responses** (repeat for each question)

```
POST /api/v1/interviews/{id}/submit_response/
→ Saves response, AI evaluates immediately, returns score & feedback
```

### 5. **Complete Interview**

```
POST /api/v1/interviews/{id}/complete/
→ Changes status to 'completed', calculates final score, generates overall feedback
```

### 6. **View Results**

```
GET /api/v1/interviews/{id}/results/
→ Retrieve detailed results with all responses and feedback
```

---

## 🤖 AI Integration (Placeholder)

The system has placeholder functions for AI integration:

### `_generate_ai_questions(interview)`

- Generates questions based on `job_role` and `required_skills`
- TODO: Integrate OpenAI API
- Current: Creates sample questions from skills

### `_evaluate_response(response)`

- Evaluates answer quality, relevance, clarity
- TODO: Integrate OpenAI API for evaluation
- Current: Returns sample score (7.5) and feedback

### `_generate_overall_feedback(interview)`

- Analyzes all responses for overall feedback
- TODO: Integrate OpenAI API
- Current: Returns sample feedback, strengths, weaknesses

**To integrate OpenAI:**

```python
import openai

def _generate_ai_questions(interview):
    prompt = f"""
    Generate {interview.total_questions} interview questions for:
    - Job Role: {interview.job_role}
    - Skills: {', '.join(interview.required_skills)}
    - Difficulty: {interview.difficulty}
    - Type: {interview.interview_type}
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    
    # Parse and create questions...
```

---

## 🎯 Features

### ✅ Implemented

- 4 database models with proper relationships
- Complete REST API with 12+ endpoints
- Interview templates system
- Question ordering and difficulty levels
- Response tracking with timestamps
- Score calculation and percentage
- AI-ready architecture (placeholders)
- Filtering by status, type, difficulty
- Django admin interface
- Sample data with 4 templates and 3 interviews

### 🔄 Ready for Enhancement

- OpenAI integration for:
  - AI question generation
  - Response evaluation
  - Overall feedback
- Audio/video recording support
- Code execution for coding questions
- Real-time interview (WebSockets)
- Interview scheduling with calendar
- Email notifications
- Interview analytics dashboard
- Practice mode vs real interview mode

---

## 🧪 Testing

Run the comprehensive test script:

```powershell
.\test_interview_api.ps1
```

**Tests all endpoints:**

- ✅ Login authentication
- ✅ List interviews with filters
- ✅ Create interview
- ✅ Get interview details
- ✅ Start interview
- ✅ Get questions
- ✅ Submit response
- ✅ Complete interview
- ✅ Get results
- ✅ My interview history
- ✅ List templates
- ✅ Use template

---

## 📈 Database Statistics

- **4 Models**: Interview, InterviewQuestion, InterviewResponse, InterviewTemplate
- **4 Templates**: Covering different interview types
- **3 Sample Interviews**: Different statuses (scheduled, in_progress, completed)
- **12 Questions**: Across all interviews
- **6 Indexes**: For optimized queries on user, status, type, and timestamps

---

## 🚀 Next Steps

1. **Frontend Integration** (Task 5):
   - Create React Native interview screens
   - Voice recording component
   - Video recording component
   - Real-time timer display
   - Results visualization

2. **AI Enhancement**:
   - Integrate OpenAI API
   - Implement speech-to-text
   - Add code evaluation for coding questions

3. **Analytics** (Task 6):
   - Track interview performance over time
   - Skill gap analysis
   - Improvement recommendations

---

## 💡 Usage Examples

### Create Interview from Template

```javascript
const response = await fetch('http://192.168.1.191:8000/api/v1/templates/1/use_template/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    job_role: 'Senior React Developer',
    company_name: 'Meta'
  })
});
```

### Submit Interview Response

```javascript
const response = await fetch(`http://192.168.1.191:8000/api/v1/interviews/${interviewId}/submit_response/`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    question_id: 1,
    text_response: 'React hooks allow functional components to use state...',
    time_taken_seconds: 180
  })
});
```

---

## 🎉 Status

**Backend: COMPLETE ✅**

- All models created and migrated
- All API endpoints implemented and tested
- Sample data populated
- Admin interface configured
- Ready for frontend integration

---

*Generated: November 2, 2025*
*Project: EXE+ Interview System*
