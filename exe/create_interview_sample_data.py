"""
Script to create sample interview data
Run: python create_interview_sample_data.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exe.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.interview.models import Interview, InterviewQuestion, InterviewTemplate
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

def create_sample_data():
    # Get or create test user
    user, _ = User.objects.get_or_create(
        username='testuser',
        defaults={
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User'
        }
    )
    
    print(f"✅ User: {user.username}")
    
    # Clear existing interview data for fresh start
    Interview.objects.filter(user=user).delete()
    InterviewTemplate.objects.all().delete()
    
    # Create Interview Templates
    templates_data = [
        {
            'title': 'Frontend Developer Interview',
            'description': 'Comprehensive interview for frontend developers covering React, JavaScript, and system design',
            'interview_type': 'technical',
            'difficulty': 'medium',
            'duration_minutes': 45,
            'questions': [
                {
                    'question': 'Explain the Virtual DOM in React and how it improves performance',
                    'type': 'technical',
                    'difficulty': 'medium',
                    'expected_answer': 'The Virtual DOM is a lightweight copy of the actual DOM...'
                },
                {
                    'question': 'What are React Hooks? Explain useState and useEffect',
                    'type': 'technical',
                    'difficulty': 'medium',
                    'expected_answer': 'Hooks are functions that let you use state and lifecycle features...'
                },
                {
                    'question': 'How would you optimize a React application for performance?',
                    'type': 'technical',
                    'difficulty': 'hard',
                    'expected_answer': 'React.memo, useMemo, useCallback, code splitting...'
                },
                {
                    'question': 'Describe a time when you had to debug a complex frontend issue',
                    'type': 'behavioral',
                    'difficulty': 'medium',
                    'expected_answer': 'Use STAR method - Situation, Task, Action, Result'
                }
            ]
        },
        {
            'title': 'Python Backend Engineer',
            'description': 'Technical interview for Python backend developers focusing on Django, APIs, and databases',
            'interview_type': 'technical',
            'difficulty': 'hard',
            'duration_minutes': 60,
            'questions': [
                {
                    'question': 'Explain Django ORM and when you would use raw SQL instead',
                    'type': 'technical',
                    'difficulty': 'hard',
                    'expected_answer': 'Django ORM provides abstraction layer...'
                },
                {
                    'question': 'How do you handle database transactions in Django?',
                    'type': 'technical',
                    'difficulty': 'hard',
                    'expected_answer': 'atomic decorator, transaction.atomic()...'
                },
                {
                    'question': 'Design a REST API for a social media post system',
                    'type': 'system_design',
                    'difficulty': 'hard',
                    'expected_answer': 'Endpoints, models, relationships, caching...'
                },
                {
                    'question': 'What is your experience with async programming in Python?',
                    'type': 'technical',
                    'difficulty': 'medium',
                    'expected_answer': 'asyncio, async/await, use cases...'
                },
                {
                    'question': 'How do you ensure code quality in your projects?',
                    'type': 'behavioral',
                    'difficulty': 'easy',
                    'expected_answer': 'Testing, code reviews, linting, CI/CD...'
                }
            ]
        },
        {
            'title': 'System Design Interview',
            'description': 'System design interview covering scalability, architecture, and distributed systems',
            'interview_type': 'system_design',
            'difficulty': 'hard',
            'duration_minutes': 60,
            'questions': [
                {
                    'question': 'Design a URL shortening service like bit.ly',
                    'type': 'system_design',
                    'difficulty': 'hard',
                    'expected_answer': 'Requirements, API design, database schema, scaling...'
                },
                {
                    'question': 'How would you design a real-time chat application?',
                    'type': 'system_design',
                    'difficulty': 'hard',
                    'expected_answer': 'WebSockets, message queues, databases...'
                },
                {
                    'question': 'Explain CAP theorem and trade-offs in distributed systems',
                    'type': 'technical',
                    'difficulty': 'hard',
                    'expected_answer': 'Consistency, Availability, Partition tolerance...'
                }
            ]
        },
        {
            'title': 'Behavioral Interview',
            'description': 'Standard behavioral interview questions for any role',
            'interview_type': 'behavioral',
            'difficulty': 'easy',
            'duration_minutes': 30,
            'questions': [
                {
                    'question': 'Tell me about yourself and your career journey',
                    'type': 'behavioral',
                    'difficulty': 'easy',
                    'expected_answer': 'Professional background, key experiences, career goals'
                },
                {
                    'question': 'Describe a time when you faced a conflict with a team member',
                    'type': 'behavioral',
                    'difficulty': 'medium',
                    'expected_answer': 'STAR method - focus on resolution and learning'
                },
                {
                    'question': 'What are your strengths and weaknesses?',
                    'type': 'behavioral',
                    'difficulty': 'easy',
                    'expected_answer': 'Honest self-assessment with examples'
                },
                {
                    'question': 'Why do you want to work for our company?',
                    'type': 'behavioral',
                    'difficulty': 'easy',
                    'expected_answer': 'Research about company, alignment with values'
                },
                {
                    'question': 'Where do you see yourself in 5 years?',
                    'type': 'behavioral',
                    'difficulty': 'easy',
                    'expected_answer': 'Career goals, growth aspirations'
                }
            ]
        }
    ]
    
    templates = []
    for t_data in templates_data:
        template = InterviewTemplate.objects.create(
            title=t_data['title'],
            description=t_data['description'],
            interview_type=t_data['interview_type'],
            difficulty=t_data['difficulty'],
            duration_minutes=t_data['duration_minutes'],
            questions=t_data['questions'],
            is_active=True,
            created_by=user
        )
        templates.append(template)
        print(f"✅ Template: {template.title} ({len(t_data['questions'])} questions)")
    
    # Create Sample Interviews
    interviews_data = [
        {
            'title': 'Frontend Developer at TechCorp',
            'description': 'Interview for Senior Frontend Developer position',
            'interview_type': 'technical',
            'difficulty': 'medium',
            'job_role': 'Senior Frontend Developer',
            'company_name': 'TechCorp Inc.',
            'required_skills': ['React', 'TypeScript', 'Redux', 'Next.js'],
            'duration_minutes': 45,
            'total_questions': 5,
            'status': 'scheduled',
            'questions': [
                {
                    'text': 'Explain React hooks and their benefits',
                    'type': 'technical',
                    'difficulty': 'medium',
                    'order': 1
                },
                {
                    'text': 'How do you handle state management in large React applications?',
                    'type': 'technical',
                    'difficulty': 'hard',
                    'order': 2
                },
                {
                    'text': 'What is TypeScript and why would you use it?',
                    'type': 'technical',
                    'difficulty': 'easy',
                    'order': 3
                },
                {
                    'text': 'Describe your experience working with REST APIs',
                    'type': 'technical',
                    'difficulty': 'medium',
                    'order': 4
                },
                {
                    'text': 'Tell me about a challenging bug you fixed',
                    'type': 'behavioral',
                    'difficulty': 'medium',
                    'order': 5
                }
            ]
        },
        {
            'title': 'Backend Engineer at StartupX',
            'description': 'Backend engineering role focusing on Python and Django',
            'interview_type': 'technical',
            'difficulty': 'hard',
            'job_role': 'Backend Engineer',
            'company_name': 'StartupX',
            'required_skills': ['Python', 'Django', 'PostgreSQL', 'Redis'],
            'duration_minutes': 60,
            'total_questions': 4,
            'status': 'completed',
            'questions': [
                {
                    'text': 'How do you optimize database queries in Django?',
                    'type': 'technical',
                    'difficulty': 'hard',
                    'order': 1
                },
                {
                    'text': 'Explain Django middleware and give examples',
                    'type': 'technical',
                    'difficulty': 'medium',
                    'order': 2
                },
                {
                    'text': 'How would you implement caching in a Django application?',
                    'type': 'technical',
                    'difficulty': 'hard',
                    'order': 3
                },
                {
                    'text': 'Describe your experience with API design',
                    'type': 'behavioral',
                    'difficulty': 'medium',
                    'order': 4
                }
            ],
            'total_score': 32.0,
            'percentage': 80.0,
            'overall_feedback': 'Excellent performance! Strong understanding of Django and backend concepts.',
            'strengths': ['Deep Django knowledge', 'Clear communication', 'Problem-solving skills'],
            'weaknesses': ['Could improve on system design'],
            'recommendations': ['Study distributed systems', 'Practice more system design']
        },
        {
            'title': 'Full Stack Developer Interview',
            'description': 'General full stack developer position',
            'interview_type': 'technical',
            'difficulty': 'medium',
            'job_role': 'Full Stack Developer',
            'company_name': 'Digital Solutions Ltd',
            'required_skills': ['React', 'Node.js', 'MongoDB', 'AWS'],
            'duration_minutes': 50,
            'total_questions': 6,
            'status': 'in_progress',
            'questions': [
                {
                    'text': 'Explain the difference between SQL and NoSQL databases',
                    'type': 'technical',
                    'difficulty': 'medium',
                    'order': 1
                },
                {
                    'text': 'How do you ensure security in web applications?',
                    'type': 'technical',
                    'difficulty': 'hard',
                    'order': 2
                },
                {
                    'text': 'What is your experience with cloud platforms?',
                    'type': 'technical',
                    'difficulty': 'medium',
                    'order': 3
                }
            ]
        }
    ]
    
    for i_data in interviews_data:
        questions_data = i_data.pop('questions')
        
        # Create interview
        interview = Interview.objects.create(
            user=user,
            **{k: v for k, v in i_data.items() if k not in ['total_score', 'percentage', 'overall_feedback', 'strengths', 'weaknesses', 'recommendations']}
        )
        
        # Set timestamps based on status
        if interview.status == 'in_progress':
            interview.started_at = timezone.now() - timedelta(minutes=10)
            interview.save()
        elif interview.status == 'completed':
            interview.started_at = timezone.now() - timedelta(days=2)
            interview.completed_at = timezone.now() - timedelta(days=2, hours=-1)
            interview.total_score = i_data.get('total_score', 0)
            interview.percentage = i_data.get('percentage', 0)
            interview.overall_feedback = i_data.get('overall_feedback', '')
            interview.strengths = i_data.get('strengths', [])
            interview.weaknesses = i_data.get('weaknesses', [])
            interview.recommendations = i_data.get('recommendations', [])
            interview.save()
        
        # Create questions
        for q_data in questions_data:
            InterviewQuestion.objects.create(
                interview=interview,
                question_text=q_data['text'],
                question_type=q_data['type'],
                difficulty=q_data['difficulty'],
                order=q_data['order']
            )
        
        print(f"✅ Interview: {interview.title} ({interview.status}) - {len(questions_data)} questions")
    
    print("\n" + "="*60)
    print("🎉 Sample interview data created successfully!")
    print("="*60)
    print(f"\n📊 Summary:")
    print(f"  • Templates: {InterviewTemplate.objects.count()}")
    print(f"  • Interviews: {Interview.objects.count()}")
    print(f"  • Questions: {InterviewQuestion.objects.count()}")
    print(f"\n🔑 Test User: {user.username}")
    print(f"  • Scheduled Interviews: {Interview.objects.filter(status='scheduled').count()}")
    print(f"  • In Progress: {Interview.objects.filter(status='in_progress').count()}")
    print(f"  • Completed: {Interview.objects.filter(status='completed').count()}")

if __name__ == '__main__':
    create_sample_data()
