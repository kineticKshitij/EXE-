from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser
    """
    USER_TYPE_CHOICES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('recruiter', 'Recruiter'),
        ('admin', 'Admin'),
    )
    
    # Additional fields
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='student')
    phone_number = models.CharField(
        max_length=15, 
        blank=True, 
        null=True,
        validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$', message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")]
    )
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True)
    date_of_birth = models.DateField(blank=True, null=True)
    
    # Professional Information
    organization = models.CharField(max_length=200, blank=True)
    designation = models.CharField(max_length=100, blank=True)
    linkedin_url = models.URLField(max_length=200, blank=True)
    github_url = models.URLField(max_length=200, blank=True)
    
    # Subscription & Payment
    is_premium = models.BooleanField(default=False)
    subscription_end_date = models.DateTimeField(blank=True, null=True)
    
    # Account settings
    email_verified = models.BooleanField(default=False)
    two_factor_enabled = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username


class UserProfile(models.Model):
    """
    Extended profile information for users
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Skills and Interests
    skills = models.JSONField(default=list, blank=True)  # ['Python', 'Django', 'React']
    interests = models.JSONField(default=list, blank=True)  # ['AI', 'Web Development']
    
    # Education
    education_level = models.CharField(max_length=100, blank=True)
    institution = models.CharField(max_length=200, blank=True)
    
    # Experience
    years_of_experience = models.IntegerField(default=0)
    current_role = models.CharField(max_length=100, blank=True)
    
    # Preferences
    preferred_language = models.CharField(max_length=10, default='en')
    timezone = models.CharField(max_length=50, default='UTC')
    notifications_enabled = models.BooleanField(default=True)
    
    # Statistics
    total_exams_taken = models.IntegerField(default=0)
    total_interviews_completed = models.IntegerField(default=0)
    average_score = models.FloatField(default=0.0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
        
    def __str__(self):
        return f"Profile of {self.user.username}"


class UserSession(models.Model):
    """
    Track user sessions for security and analytics
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    session_key = models.CharField(max_length=40, unique=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    device_type = models.CharField(max_length=50, blank=True)  # mobile, desktop, tablet
    location = models.CharField(max_length=100, blank=True)
    
    is_active = models.BooleanField(default=True)
    last_activity = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    logged_out_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'user_sessions'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.user.username} - {self.ip_address} ({self.device_type})"
