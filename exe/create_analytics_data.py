"""
Initialize analytics data for the test user
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exe.settings')
django.setup()

from apps.users.models import User
from apps.analytics.models import UserAnalytics, ActivityLog, PerformanceTrend
from django.utils import timezone
from datetime import timedelta


def create_analytics_data():
    """Create sample analytics data for testuser"""
    
    # Get the test user
    try:
        user = User.objects.get(username='testuser')
        print(f"✓ Found user: {user.username}")
    except User.DoesNotExist:
        print("✗ Test user not found. Please create testuser first.")
        return
    
    # Create or update user analytics
    analytics, created = UserAnalytics.objects.get_or_create(user=user)
    print(f"{'✓ Created' if created else '✓ Found'} UserAnalytics for {user.username}")
    
    # Recalculate analytics from existing data
    analytics.recalculate_all()
    print(f"✓ Recalculated analytics:")
    print(f"  - Total Exams: {analytics.total_exams_taken}")
    print(f"  - Average Exam Score: {analytics.average_exam_score:.2f}%")
    print(f"  - Total Interviews: {analytics.total_interviews_taken}")
    print(f"  - Average Interview Score: {analytics.average_interview_score:.2f}%")
    
    # Create some activity logs
    activity_logs_created = 0
    
    # Log recent login
    if not ActivityLog.objects.filter(user=user, activity_type='login').exists():
        ActivityLog.objects.create(
            user=user,
            activity_type='login',
            description='User logged in'
        )
        activity_logs_created += 1
    
    # Log exam activities from existing attempts
    from apps.exams.models import ExamAttempt
    for attempt in ExamAttempt.objects.filter(user=user, status='completed')[:5]:
        if not ActivityLog.objects.filter(user=user, activity_type='exam_completed', exam_attempt_id=attempt.id).exists():
            ActivityLog.objects.create(
                user=user,
                activity_type='exam_completed',
                description=f'Completed exam: {attempt.exam.title}',
                exam_attempt_id=attempt.id,
                metadata={
                    'score': attempt.score,
                    'time_taken': attempt.time_taken,
                }
            )
            activity_logs_created += 1
    
    # Log interview activities
    from apps.interview.models import Interview
    for interview in Interview.objects.filter(user=user, status='completed')[:5]:
        if not ActivityLog.objects.filter(user=user, activity_type='interview_completed', interview_id=interview.id).exists():
            ActivityLog.objects.create(
                user=user,
                activity_type='interview_completed',
                description=f'Completed interview: {interview.position} at {interview.company}',
                interview_id=interview.id,
                metadata={
                    'score': interview.total_score,
                    'interview_type': interview.interview_type,
                }
            )
            activity_logs_created += 1
    
    print(f"✓ Created {activity_logs_created} activity logs")
    
    # Create performance trends for the last 4 weeks
    trends_created = 0
    today = timezone.now().date()
    
    for week_offset in range(4):
        period_start = today - timedelta(weeks=week_offset+1)
        period_end = today - timedelta(weeks=week_offset)
        
        trend, created = PerformanceTrend.objects.get_or_create(
            user=user,
            period_type='weekly',
            period_start=period_start,
            defaults={
                'period_end': period_end,
                'exams_taken': max(0, 3 - week_offset),
                'exams_passed': max(0, 2 - week_offset),
                'average_exam_score': 75.0 + (week_offset * 5),
                'interviews_taken': max(0, 2 - week_offset),
                'interviews_completed': max(0, 1),
                'average_interview_score': 80.0 + (week_offset * 3),
                'total_time_spent_minutes': 180 - (week_offset * 30),
                'questions_answered': 20 - (week_offset * 3),
            }
        )
        if created:
            trends_created += 1
    
    print(f"✓ Created {trends_created} performance trends")
    
    # Update streak
    analytics.update_streak()
    analytics.save()
    print(f"✓ Updated activity streak: {analytics.current_streak_days} days")
    
    print("\n✅ Analytics initialization complete!")


if __name__ == '__main__':
    create_analytics_data()
