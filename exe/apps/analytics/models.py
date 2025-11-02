from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.exams.models import ExamAttempt
from apps.interview.models import Interview


class UserAnalytics(models.Model):
    """
    Aggregated analytics for a user's performance
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='analytics')
    
    # Exam Statistics
    total_exams_taken = models.IntegerField(default=0)
    total_exams_passed = models.IntegerField(default=0)
    average_exam_score = models.FloatField(default=0.0)
    highest_exam_score = models.FloatField(default=0.0)
    total_exam_time_minutes = models.IntegerField(default=0)
    
    # Interview Statistics
    total_interviews_taken = models.IntegerField(default=0)
    total_interviews_completed = models.IntegerField(default=0)
    average_interview_score = models.FloatField(default=0.0)
    highest_interview_score = models.FloatField(default=0.0)
    total_interview_time_minutes = models.IntegerField(default=0)
    
    # Overall Statistics
    total_questions_answered = models.IntegerField(default=0)
    total_correct_answers = models.IntegerField(default=0)
    current_streak_days = models.IntegerField(default=0)
    longest_streak_days = models.IntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    
    # Skill Tracking (JSON field for flexibility)
    skill_scores = models.JSONField(default=dict, blank=True)  # {skill_name: average_score}
    weak_areas = models.JSONField(default=list, blank=True)  # [skill_name, ...]
    strong_areas = models.JSONField(default=list, blank=True)  # [skill_name, ...]
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'User Analytics'
        verbose_name_plural = 'User Analytics'
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Analytics for {self.user.username}"
    
    def update_exam_stats(self):
        """Update exam-related statistics"""
        attempts = ExamAttempt.objects.filter(user=self.user, status='completed')
        
        self.total_exams_taken = attempts.count()
        if self.total_exams_taken > 0:
            scores = [a.score for a in attempts if a.score is not None]
            if scores:
                self.average_exam_score = sum(scores) / len(scores)
                self.highest_exam_score = max(scores)
                self.total_exams_passed = len([s for s in scores if s >= 70])
            
            total_time = sum([a.time_taken for a in attempts if a.time_taken])
            self.total_exam_time_minutes = total_time
    
    def update_interview_stats(self):
        """Update interview-related statistics"""
        interviews = Interview.objects.filter(user=self.user)
        completed = interviews.filter(status='completed')
        
        self.total_interviews_taken = interviews.count()
        self.total_interviews_completed = completed.count()
        
        if self.total_interviews_completed > 0:
            scores = [i.total_score for i in completed if i.total_score is not None]
            if scores:
                self.average_interview_score = sum(scores) / len(scores)
                self.highest_interview_score = max(scores)
            
            total_time = sum([
                (i.completed_at - i.started_at).total_seconds() / 60 
                for i in completed 
                if i.started_at and i.completed_at
            ])
            self.total_interview_time_minutes = int(total_time)
    
    def update_streak(self):
        """Update activity streak"""
        today = timezone.now().date()
        
        if self.last_activity_date:
            days_diff = (today - self.last_activity_date).days
            
            if days_diff == 0:
                # Same day, no change
                pass
            elif days_diff == 1:
                # Consecutive day, increment streak
                self.current_streak_days += 1
                if self.current_streak_days > self.longest_streak_days:
                    self.longest_streak_days = self.current_streak_days
            else:
                # Streak broken, reset
                self.current_streak_days = 1
        else:
            # First activity
            self.current_streak_days = 1
        
        self.last_activity_date = today
        
        if self.current_streak_days > self.longest_streak_days:
            self.longest_streak_days = self.current_streak_days
    
    def recalculate_all(self):
        """Recalculate all statistics"""
        self.update_exam_stats()
        self.update_interview_stats()
        self.save()


class ActivityLog(models.Model):
    """
    Log of user activities for tracking progress over time
    """
    ACTIVITY_TYPES = [
        ('exam_started', 'Exam Started'),
        ('exam_completed', 'Exam Completed'),
        ('interview_started', 'Interview Started'),
        ('interview_completed', 'Interview Completed'),
        ('login', 'User Login'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activity_logs')
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    description = models.TextField(blank=True)
    
    # Related objects (optional)
    exam_attempt_id = models.IntegerField(null=True, blank=True)
    interview_id = models.IntegerField(null=True, blank=True)
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)  # Extra data like scores, duration, etc.
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'activity_type']),
            models.Index(fields=['user', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.get_activity_type_display()} at {self.created_at}"


class PerformanceTrend(models.Model):
    """
    Daily/Weekly/Monthly performance snapshots for trend analysis
    """
    PERIOD_TYPES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='performance_trends')
    period_type = models.CharField(max_length=20, choices=PERIOD_TYPES)
    period_start = models.DateField()
    period_end = models.DateField()
    
    # Exam metrics for this period
    exams_taken = models.IntegerField(default=0)
    exams_passed = models.IntegerField(default=0)
    average_exam_score = models.FloatField(default=0.0)
    
    # Interview metrics for this period
    interviews_taken = models.IntegerField(default=0)
    interviews_completed = models.IntegerField(default=0)
    average_interview_score = models.FloatField(default=0.0)
    
    # Overall metrics
    total_time_spent_minutes = models.IntegerField(default=0)
    questions_answered = models.IntegerField(default=0)
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-period_start']
        unique_together = ['user', 'period_type', 'period_start']
        indexes = [
            models.Index(fields=['user', 'period_type', 'period_start']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.period_type} ({self.period_start} to {self.period_end})"

