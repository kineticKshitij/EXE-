from rest_framework import serializers
from .models import UserAnalytics, ActivityLog, PerformanceTrend


class UserAnalyticsSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    exam_pass_rate = serializers.SerializerMethodField()
    interview_completion_rate = serializers.SerializerMethodField()
    overall_accuracy = serializers.SerializerMethodField()
    
    class Meta:
        model = UserAnalytics
        fields = [
            'id',
            'username',
            'total_exams_taken',
            'total_exams_passed',
            'exam_pass_rate',
            'average_exam_score',
            'highest_exam_score',
            'total_exam_time_minutes',
            'total_interviews_taken',
            'total_interviews_completed',
            'interview_completion_rate',
            'average_interview_score',
            'highest_interview_score',
            'total_interview_time_minutes',
            'total_questions_answered',
            'total_correct_answers',
            'overall_accuracy',
            'current_streak_days',
            'longest_streak_days',
            'last_activity_date',
            'skill_scores',
            'weak_areas',
            'strong_areas',
            'updated_at',
        ]
    
    def get_exam_pass_rate(self, obj):
        if obj.total_exams_taken == 0:
            return 0.0
        return round((obj.total_exams_passed / obj.total_exams_taken) * 100, 2)
    
    def get_interview_completion_rate(self, obj):
        if obj.total_interviews_taken == 0:
            return 0.0
        return round((obj.total_interviews_completed / obj.total_interviews_taken) * 100, 2)
    
    def get_overall_accuracy(self, obj):
        if obj.total_questions_answered == 0:
            return 0.0
        return round((obj.total_correct_answers / obj.total_questions_answered) * 100, 2)


class ActivityLogSerializer(serializers.ModelSerializer):
    activity_type_display = serializers.CharField(source='get_activity_type_display', read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = [
            'id',
            'activity_type',
            'activity_type_display',
            'description',
            'exam_attempt_id',
            'interview_id',
            'metadata',
            'created_at',
        ]


class PerformanceTrendSerializer(serializers.ModelSerializer):
    period_type_display = serializers.CharField(source='get_period_type_display', read_only=True)
    exam_pass_rate = serializers.SerializerMethodField()
    interview_completion_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = PerformanceTrend
        fields = [
            'id',
            'period_type',
            'period_type_display',
            'period_start',
            'period_end',
            'exams_taken',
            'exams_passed',
            'exam_pass_rate',
            'average_exam_score',
            'interviews_taken',
            'interviews_completed',
            'interview_completion_rate',
            'average_interview_score',
            'total_time_spent_minutes',
            'questions_answered',
        ]
    
    def get_exam_pass_rate(self, obj):
        if obj.exams_taken == 0:
            return 0.0
        return round((obj.exams_passed / obj.exams_taken) * 100, 2)
    
    def get_interview_completion_rate(self, obj):
        if obj.interviews_taken == 0:
            return 0.0
        return round((obj.interviews_completed / obj.interviews_taken) * 100, 2)


class DashboardSummarySerializer(serializers.Serializer):
    """
    Summary data for the main dashboard
    """
    # Overall stats
    total_activities = serializers.IntegerField()
    current_streak = serializers.IntegerField()
    longest_streak = serializers.IntegerField()
    
    # Exam stats
    total_exams = serializers.IntegerField()
    exams_passed = serializers.IntegerField()
    exam_pass_rate = serializers.FloatField()
    avg_exam_score = serializers.FloatField()
    
    # Interview stats
    total_interviews = serializers.IntegerField()
    interviews_completed = serializers.IntegerField()
    interview_completion_rate = serializers.FloatField()
    avg_interview_score = serializers.FloatField()
    
    # Recent activity
    recent_activities = ActivityLogSerializer(many=True)
    
    # Performance trends
    weekly_trends = PerformanceTrendSerializer(many=True)
