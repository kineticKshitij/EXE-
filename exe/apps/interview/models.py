from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.users.models import User


class Interview(models.Model):
    """
    Interview session model
    """
    INTERVIEW_TYPE_CHOICES = (
        ('technical', 'Technical'),
        ('behavioral', 'Behavioral'),
        ('system_design', 'System Design'),
        ('coding', 'Coding'),
        ('hr', 'HR'),
    )
    
    DIFFICULTY_CHOICES = (
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    )
    
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='interviews')
    title = models.CharField(max_length=200)
    description = models.TextField()
    interview_type = models.CharField(max_length=50, choices=INTERVIEW_TYPE_CHOICES)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='medium')
    
    # Job details
    job_role = models.CharField(max_length=200)
    company_name = models.CharField(max_length=200, blank=True)
    job_description = models.TextField(blank=True)
    required_skills = models.JSONField(default=list)  # ['Python', 'Django', 'React']
    
    # Interview settings
    duration_minutes = models.IntegerField(default=30)
    total_questions = models.IntegerField(default=5)
    use_ai = models.BooleanField(default=True)
    enable_video = models.BooleanField(default=False)
    enable_audio = models.BooleanField(default=True)
    
    # Status and timing
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    scheduled_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Scoring
    total_score = models.FloatField(default=0.0)
    max_score = models.FloatField(default=100.0)
    percentage = models.FloatField(default=0.0)
    
    # AI feedback
    overall_feedback = models.TextField(blank=True)
    strengths = models.JSONField(default=list)
    weaknesses = models.JSONField(default=list)
    recommendations = models.JSONField(default=list)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'interviews'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['interview_type']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"
    
    def calculate_score(self):
        """Calculate total score from all responses"""
        responses = self.responses.all()
        if not responses:
            self.total_score = 0.0
            self.percentage = 0.0
        else:
            total = sum(r.score for r in responses)
            self.total_score = total
            self.percentage = (total / self.max_score) * 100 if self.max_score > 0 else 0
        self.save()


class InterviewQuestion(models.Model):
    """
    Questions asked during interview
    """
    QUESTION_TYPE_CHOICES = (
        ('technical', 'Technical'),
        ('behavioral', 'Behavioral'),
        ('coding', 'Coding'),
        ('system_design', 'System Design'),
        ('general', 'General'),
    )
    
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=50, choices=QUESTION_TYPE_CHOICES)
    
    # Question metadata
    difficulty = models.CharField(max_length=20, choices=Interview.DIFFICULTY_CHOICES)
    expected_duration_minutes = models.IntegerField(default=5)
    expected_answer = models.TextField(blank=True)  # Sample answer or key points
    evaluation_criteria = models.JSONField(default=list)  # Criteria for evaluation
    
    # Order
    order = models.IntegerField(default=0)
    
    # AI generated
    is_ai_generated = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'interview_questions'
        ordering = ['order']
        indexes = [
            models.Index(fields=['interview', 'order']),
        ]
    
    def __str__(self):
        return f"Q{self.order}: {self.question_text[:50]}"


class InterviewResponse(models.Model):
    """
    User's response to interview questions
    """
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(InterviewQuestion, on_delete=models.CASCADE, related_name='responses')
    
    # Response data
    text_response = models.TextField(blank=True)
    audio_url = models.URLField(max_length=500, blank=True)
    video_url = models.URLField(max_length=500, blank=True)
    code_response = models.TextField(blank=True)  # For coding questions
    
    # Timing
    time_taken_seconds = models.IntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    
    # Evaluation
    score = models.FloatField(default=0.0, validators=[MinValueValidator(0.0), MaxValueValidator(10.0)])
    ai_feedback = models.TextField(blank=True)
    evaluation_metrics = models.JSONField(default=dict)  # {'clarity': 8, 'accuracy': 7, ...}
    
    # Flags
    is_evaluated = models.BooleanField(default=False)
    needs_review = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'interview_responses'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['interview', 'question']),
        ]
    
    def __str__(self):
        return f"Response to {self.question} - Score: {self.score}"


class InterviewTemplate(models.Model):
    """
    Reusable interview templates
    """
    title = models.CharField(max_length=200)
    description = models.TextField()
    interview_type = models.CharField(max_length=50, choices=Interview.INTERVIEW_TYPE_CHOICES)
    difficulty = models.CharField(max_length=20, choices=Interview.DIFFICULTY_CHOICES)
    
    # Template settings
    duration_minutes = models.IntegerField(default=30)
    questions = models.JSONField(default=list)  # List of question templates
    
    # Usage stats
    times_used = models.IntegerField(default=0)
    average_score = models.FloatField(default=0.0)
    
    # Flags
    is_active = models.BooleanField(default=True)
    is_premium = models.BooleanField(default=False)
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='interview_templates')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'interview_templates'
        ordering = ['-times_used', '-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.interview_type})"
