from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.users.models import User
import json


class Exam(models.Model):
    """
    Main exam model containing exam details and configuration
    """
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
        ('expert', 'Expert'),
    ]
    
    CATEGORY_CHOICES = [
        ('programming', 'Programming'),
        ('data_structures', 'Data Structures'),
        ('algorithms', 'Algorithms'),
        ('databases', 'Databases'),
        ('web_development', 'Web Development'),
        ('mobile_development', 'Mobile Development'),
        ('machine_learning', 'Machine Learning'),
        ('cloud_computing', 'Cloud Computing'),
        ('devops', 'DevOps'),
        ('cybersecurity', 'Cybersecurity'),
        ('general', 'General Knowledge'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='general')
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='medium')
    
    # Exam configuration
    duration_minutes = models.IntegerField(
        validators=[MinValueValidator(5), MaxValueValidator(300)],
        help_text="Exam duration in minutes"
    )
    total_marks = models.IntegerField(
        validators=[MinValueValidator(1)],
        default=100
    )
    passing_marks = models.IntegerField(
        validators=[MinValueValidator(0)],
        default=40
    )
    
    # Exam settings
    is_published = models.BooleanField(default=False)
    is_premium = models.BooleanField(default=False)
    allow_review = models.BooleanField(default=True, help_text="Allow users to review answers after submission")
    randomize_questions = models.BooleanField(default=False)
    show_results_immediately = models.BooleanField(default=True)
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_exams')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Statistics
    total_attempts = models.IntegerField(default=0)
    average_score = models.FloatField(default=0.0)
    
    class Meta:
        db_table = 'exams'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category', 'difficulty']),
            models.Index(fields=['is_published']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.difficulty})"
    
    def update_statistics(self):
        """Update exam statistics based on attempts"""
        attempts = self.attempts.filter(is_completed=True)
        self.total_attempts = attempts.count()
        if self.total_attempts > 0:
            self.average_score = attempts.aggregate(models.Avg('score'))['score__avg'] or 0.0
        self.save()


class Question(models.Model):
    """
    Individual question in an exam
    """
    QUESTION_TYPES = [
        ('mcq', 'Multiple Choice (Single Answer)'),
        ('multiple', 'Multiple Choice (Multiple Answers)'),
        ('true_false', 'True/False'),
        ('short_answer', 'Short Answer'),
        ('code', 'Code'),
    ]
    
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='mcq')
    
    # Options for MCQ questions (stored as JSON)
    # Format: [{"id": "A", "text": "Option A"}, {"id": "B", "text": "Option B"}, ...]
    options = models.JSONField(default=list, blank=True)
    
    # Correct answer(s)
    # For MCQ: ["A"] or ["A", "B"] for multiple answers
    # For True/False: ["true"] or ["false"]
    # For short answer/code: ["expected answer"]
    correct_answer = models.JSONField(default=list)
    
    # Scoring
    marks = models.IntegerField(
        validators=[MinValueValidator(1)],
        default=1
    )
    negative_marks = models.FloatField(
        validators=[MinValueValidator(0)],
        default=0,
        help_text="Marks to deduct for wrong answer"
    )
    
    # Additional fields
    explanation = models.TextField(blank=True, help_text="Explanation shown after answering")
    order = models.IntegerField(default=0, help_text="Question order in exam")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'questions'
        ordering = ['order', 'created_at']
        indexes = [
            models.Index(fields=['exam', 'order']),
        ]
    
    def __str__(self):
        return f"Q{self.order}: {self.question_text[:50]}..."
    
    def check_answer(self, user_answer):
        """
        Check if user's answer is correct
        Returns: (is_correct, marks_awarded)
        """
        if not user_answer:
            return False, -self.negative_marks if self.negative_marks > 0 else 0
        
        # Normalize answers for comparison
        correct = [str(ans).strip().lower() for ans in self.correct_answer]
        user = [str(ans).strip().lower() for ans in (user_answer if isinstance(user_answer, list) else [user_answer])]
        
        if self.question_type in ['mcq', 'true_false']:
            is_correct = set(correct) == set(user)
        elif self.question_type == 'multiple':
            is_correct = set(correct) == set(user)
        elif self.question_type in ['short_answer', 'code']:
            # For short answer, check if any correct answer matches
            is_correct = any(c in ' '.join(user) for c in correct)
        else:
            is_correct = False
        
        if is_correct:
            return True, self.marks
        else:
            return False, -self.negative_marks if self.negative_marks > 0 else 0


class ExamAttempt(models.Model):
    """
    User's attempt at an exam
    """
    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('abandoned', 'Abandoned'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exam_attempts')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='attempts')
    
    # Attempt details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    time_taken_minutes = models.IntegerField(null=True, blank=True)
    
    # Scoring
    score = models.FloatField(default=0.0)
    percentage = models.FloatField(default=0.0)
    marks_obtained = models.FloatField(default=0.0)
    total_marks = models.FloatField(default=0.0)
    
    # Results
    is_passed = models.BooleanField(default=False)
    is_completed = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'exam_attempts'
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['user', 'exam']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.exam.title} ({self.status})"
    
    def calculate_score(self):
        """Calculate total score from all answers"""
        answers = self.answers.all()
        total_marks = 0
        marks_obtained = 0
        
        for answer in answers:
            total_marks += answer.question.marks
            marks_obtained += answer.marks_awarded
        
        self.marks_obtained = marks_obtained
        self.total_marks = total_marks
        self.score = marks_obtained
        self.percentage = (marks_obtained / total_marks * 100) if total_marks > 0 else 0
        self.is_passed = self.marks_obtained >= self.exam.passing_marks
        self.save()
        
        # Update exam statistics
        self.exam.update_statistics()


class Answer(models.Model):
    """
    User's answer to a specific question in an exam attempt
    """
    attempt = models.ForeignKey(ExamAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    
    # User's answer (stored as JSON to handle different question types)
    # For MCQ: ["A"] or ["A", "B"]
    # For True/False: ["true"] or ["false"]
    # For short answer/code: ["user's text"]
    user_answer = models.JSONField(null=True, blank=True)
    
    # Scoring
    is_correct = models.BooleanField(default=False)
    marks_awarded = models.FloatField(default=0.0)
    
    # Time tracking
    time_spent_seconds = models.IntegerField(default=0, help_text="Time spent on this question")
    
    # Metadata
    answered_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'answers'
        unique_together = ['attempt', 'question']
        indexes = [
            models.Index(fields=['attempt', 'question']),
        ]
    
    def __str__(self):
        return f"{self.attempt.user.username} - Q{self.question.order}"
    
    def evaluate(self):
        """Evaluate the answer and update marks"""
        if self.user_answer is not None:
            self.is_correct, self.marks_awarded = self.question.check_answer(self.user_answer)
        else:
            self.is_correct = False
            self.marks_awarded = 0
        self.save()
