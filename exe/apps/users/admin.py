from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile, UserSession


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'user_type', 'is_premium', 'is_active', 'created_at']
    list_filter = ['user_type', 'is_premium', 'is_active', 'email_verified', 'two_factor_enabled']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['-created_at']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('user_type', 'phone_number', 'profile_picture', 'bio', 'date_of_birth')
        }),
        ('Professional', {
            'fields': ('organization', 'designation', 'linkedin_url', 'github_url')
        }),
        ('Subscription', {
            'fields': ('is_premium', 'subscription_end_date')
        }),
        ('Security', {
            'fields': ('email_verified', 'two_factor_enabled')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('user_type', 'email', 'first_name', 'last_name')
        }),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'education_level', 'years_of_experience', 'total_exams_taken', 'total_interviews_completed']
    list_filter = ['education_level', 'years_of_experience']
    search_fields = ['user__username', 'user__email', 'institution']
    raw_id_fields = ['user']


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'ip_address', 'device_type', 'is_active', 'created_at', 'last_activity']
    list_filter = ['is_active', 'device_type', 'created_at']
    search_fields = ['user__username', 'ip_address']
    raw_id_fields = ['user']
    readonly_fields = ['session_key', 'user_agent', 'created_at', 'last_activity']
