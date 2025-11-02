from django.contrib import admin
from .models import Exam, Question, ExamAttempt, Answer


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1
    fields = ['order', 'question_text', 'question_type', 'marks', 'negative_marks']


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'difficulty', 'duration_minutes', 'total_marks', 'is_published', 'total_attempts', 'created_at']
    list_filter = ['category', 'difficulty', 'is_published', 'is_premium']
    search_fields = ['title', 'description']
    inlines = [QuestionInline]
    readonly_fields = ['total_attempts', 'average_score', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'category', 'difficulty', 'created_by')
        }),
        ('Configuration', {
            'fields': ('duration_minutes', 'total_marks', 'passing_marks')
        }),
        ('Settings', {
            'fields': ('is_published', 'is_premium', 'allow_review', 'randomize_questions', 'show_results_immediately')
        }),
        ('Statistics', {
            'fields': ('total_attempts', 'average_score', 'created_at', 'updated_at')
        }),
    )


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['exam', 'question_text_preview', 'question_type', 'marks', 'order']
    list_filter = ['question_type', 'exam']
    search_fields = ['question_text']
    ordering = ['exam', 'order']
    
    def question_text_preview(self, obj):
        return obj.question_text[:50] + '...' if len(obj.question_text) > 50 else obj.question_text
    question_text_preview.short_description = 'Question'


class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 0
    readonly_fields = ['question', 'user_answer', 'is_correct', 'marks_awarded', 'answered_at']
    can_delete = False


@admin.register(ExamAttempt)
class ExamAttemptAdmin(admin.ModelAdmin):
    list_display = ['user', 'exam', 'status', 'score', 'percentage', 'is_passed', 'start_time']
    list_filter = ['status', 'is_passed', 'exam']
    search_fields = ['user__username', 'exam__title']
    readonly_fields = ['score', 'percentage', 'marks_obtained', 'total_marks', 'is_passed', 'is_completed', 'created_at', 'updated_at']
    inlines = [AnswerInline]
    
    fieldsets = (
        ('Attempt Information', {
            'fields': ('user', 'exam', 'status')
        }),
        ('Time Tracking', {
            'fields': ('start_time', 'end_time', 'time_taken_minutes')
        }),
        ('Results', {
            'fields': ('score', 'percentage', 'marks_obtained', 'total_marks', 'is_passed', 'is_completed')
        }),
    )


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ['attempt', 'question', 'is_correct', 'marks_awarded', 'answered_at']
    list_filter = ['is_correct', 'attempt__exam']
    readonly_fields = ['is_correct', 'marks_awarded', 'answered_at']
