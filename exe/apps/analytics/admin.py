from django.contrib import admin
from .models import UserAnalytics, ActivityLog, PerformanceTrend


@admin.register(UserAnalytics)
class UserAnalyticsAdmin(admin.ModelAdmin):
    list_display = [
        'user',
        'total_exams_taken',
        'average_exam_score',
        'total_interviews_taken',
        'average_interview_score',
        'current_streak_days',
        'updated_at',
    ]
    list_filter = ['last_activity_date', 'updated_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Exam Statistics', {
            'fields': (
                'total_exams_taken',
                'total_exams_passed',
                'average_exam_score',
                'highest_exam_score',
                'total_exam_time_minutes',
            )
        }),
        ('Interview Statistics', {
            'fields': (
                'total_interviews_taken',
                'total_interviews_completed',
                'average_interview_score',
                'highest_interview_score',
                'total_interview_time_minutes',
            )
        }),
        ('Overall Statistics', {
            'fields': (
                'total_questions_answered',
                'total_correct_answers',
                'current_streak_days',
                'longest_streak_days',
                'last_activity_date',
            )
        }),
        ('Skill Tracking', {
            'fields': ('skill_scores', 'weak_areas', 'strong_areas'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['recalculate_analytics']
    
    def recalculate_analytics(self, request, queryset):
        for analytics in queryset:
            analytics.recalculate_all()
        self.message_user(request, f'Recalculated analytics for {queryset.count()} users')
    recalculate_analytics.short_description = 'Recalculate selected analytics'


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = [
        'user',
        'activity_type',
        'description',
        'exam_attempt_id',
        'interview_id',
        'created_at',
    ]
    list_filter = ['activity_type', 'created_at']
    search_fields = ['user__username', 'description']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'


@admin.register(PerformanceTrend)
class PerformanceTrendAdmin(admin.ModelAdmin):
    list_display = [
        'user',
        'period_type',
        'period_start',
        'period_end',
        'exams_taken',
        'average_exam_score',
        'interviews_taken',
        'average_interview_score',
    ]
    list_filter = ['period_type', 'period_start']
    search_fields = ['user__username']
    readonly_fields = ['created_at']
    date_hierarchy = 'period_start'

