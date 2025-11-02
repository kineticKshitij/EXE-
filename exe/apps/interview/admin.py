from django.contrib import admin
from .models import Interview, InterviewQuestion, InterviewResponse, InterviewTemplate


class InterviewQuestionInline(admin.TabularInline):
    model = InterviewQuestion
    extra = 1
    fields = ['order', 'question_text', 'question_type', 'difficulty', 'is_ai_generated']


class InterviewResponseInline(admin.TabularInline):
    model = InterviewResponse
    extra = 0
    readonly_fields = ['question', 'score', 'is_evaluated', 'created_at']
    fields = ['question', 'text_response', 'score', 'is_evaluated']


@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'interview_type', 'status', 'percentage', 'created_at']
    list_filter = ['status', 'interview_type', 'difficulty', 'created_at']
    search_fields = ['title', 'user__username', 'job_role', 'company_name']
    readonly_fields = ['total_score', 'percentage', 'created_at', 'updated_at']
    inlines = [InterviewQuestionInline, InterviewResponseInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'title', 'description', 'interview_type', 'difficulty')
        }),
        ('Job Details', {
            'fields': ('job_role', 'company_name', 'job_description', 'required_skills')
        }),
        ('Settings', {
            'fields': ('duration_minutes', 'total_questions', 'use_ai', 'enable_video', 'enable_audio')
        }),
        ('Status', {
            'fields': ('status', 'scheduled_at', 'started_at', 'completed_at')
        }),
        ('Scoring', {
            'fields': ('total_score', 'max_score', 'percentage')
        }),
        ('Feedback', {
            'fields': ('overall_feedback', 'strengths', 'weaknesses', 'recommendations')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(InterviewQuestion)
class InterviewQuestionAdmin(admin.ModelAdmin):
    list_display = ['interview', 'order', 'question_type', 'difficulty', 'is_ai_generated']
    list_filter = ['question_type', 'difficulty', 'is_ai_generated']
    search_fields = ['question_text', 'interview__title']


@admin.register(InterviewResponse)
class InterviewResponseAdmin(admin.ModelAdmin):
    list_display = ['interview', 'question', 'score', 'is_evaluated', 'created_at']
    list_filter = ['is_evaluated', 'needs_review', 'created_at']
    search_fields = ['text_response', 'interview__title']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(InterviewTemplate)
class InterviewTemplateAdmin(admin.ModelAdmin):
    list_display = ['title', 'interview_type', 'difficulty', 'times_used', 'is_active']
    list_filter = ['interview_type', 'difficulty', 'is_active', 'is_premium']
    search_fields = ['title', 'description']
    readonly_fields = ['times_used', 'average_score', 'created_at', 'updated_at']
