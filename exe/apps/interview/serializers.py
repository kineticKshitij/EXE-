from rest_framework import serializers
from .models import Interview, InterviewQuestion, InterviewResponse, InterviewTemplate
from apps.users.serializers import UserSerializer


class InterviewQuestionSerializer(serializers.ModelSerializer):
    """Serializer for interview questions"""
    
    class Meta:
        model = InterviewQuestion
        fields = [
            'id', 'question_text', 'question_type', 'difficulty',
            'expected_duration_minutes', 'order', 'is_ai_generated'
        ]


class InterviewQuestionDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with expected answer (for completed interviews)"""
    
    class Meta:
        model = InterviewQuestion
        fields = [
            'id', 'question_text', 'question_type', 'difficulty',
            'expected_duration_minutes', 'expected_answer', 
            'evaluation_criteria', 'order', 'is_ai_generated'
        ]


class InterviewResponseSerializer(serializers.ModelSerializer):
    """Serializer for interview responses"""
    question = InterviewQuestionSerializer(read_only=True)
    
    class Meta:
        model = InterviewResponse
        fields = [
            'id', 'question', 'text_response', 'audio_url', 'video_url',
            'code_response', 'time_taken_seconds', 'score', 'ai_feedback',
            'evaluation_metrics', 'is_evaluated', 'started_at', 'submitted_at'
        ]


class InterviewResponseCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating responses"""
    question_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = InterviewResponse
        fields = [
            'question_id', 'text_response', 'audio_url', 'video_url',
            'code_response', 'time_taken_seconds'
        ]


class InterviewListSerializer(serializers.ModelSerializer):
    """Serializer for interview list view"""
    
    class Meta:
        model = Interview
        fields = [
            'id', 'title', 'description', 'interview_type', 'difficulty',
            'job_role', 'company_name', 'status', 'duration_minutes',
            'total_questions', 'total_score', 'percentage', 'scheduled_at',
            'created_at'
        ]


class InterviewDetailSerializer(serializers.ModelSerializer):
    """Detailed interview serializer with questions"""
    questions = InterviewQuestionSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Interview
        fields = [
            'id', 'user', 'title', 'description', 'interview_type', 'difficulty',
            'job_role', 'company_name', 'job_description', 'required_skills',
            'duration_minutes', 'total_questions', 'use_ai', 'enable_video',
            'enable_audio', 'status', 'scheduled_at', 'started_at', 'completed_at',
            'total_score', 'max_score', 'percentage', 'overall_feedback',
            'strengths', 'weaknesses', 'recommendations', 'questions', 'created_at'
        ]


class InterviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating interviews"""
    
    class Meta:
        model = Interview
        fields = [
            'title', 'description', 'interview_type', 'difficulty',
            'job_role', 'company_name', 'job_description', 'required_skills',
            'duration_minutes', 'total_questions', 'use_ai', 'enable_video',
            'enable_audio', 'scheduled_at'
        ]


class InterviewResultSerializer(serializers.ModelSerializer):
    """Serializer for interview results"""
    responses = InterviewResponseSerializer(many=True, read_only=True)
    questions = InterviewQuestionDetailSerializer(many=True, read_only=True)
    
    class Meta:
        model = Interview
        fields = [
            'id', 'title', 'interview_type', 'difficulty', 'job_role',
            'status', 'total_score', 'max_score', 'percentage',
            'overall_feedback', 'strengths', 'weaknesses', 'recommendations',
            'started_at', 'completed_at', 'questions', 'responses'
        ]


class InterviewTemplateSerializer(serializers.ModelSerializer):
    """Serializer for interview templates"""
    
    class Meta:
        model = InterviewTemplate
        fields = [
            'id', 'title', 'description', 'interview_type', 'difficulty',
            'duration_minutes', 'questions', 'times_used', 'average_score',
            'is_premium', 'created_at'
        ]
