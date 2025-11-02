from rest_framework import serializers
from .models import Exam, Question, ExamAttempt, Answer
from apps.users.serializers import UserSerializer


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = [
            'id', 'question_text', 'question_type', 'options',
            'marks', 'negative_marks', 'order', 'explanation'
        ]
        # Don't expose correct_answer in list view
        
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Only show explanation if exam allows review
        request = self.context.get('request')
        if request and not getattr(request, 'show_answers', False):
            representation.pop('explanation', None)
        return representation


class QuestionDetailSerializer(serializers.ModelSerializer):
    """Serializer with correct answers (for results view)"""
    class Meta:
        model = Question
        fields = [
            'id', 'question_text', 'question_type', 'options',
            'correct_answer', 'marks', 'negative_marks', 
            'order', 'explanation'
        ]


class ExamListSerializer(serializers.ModelSerializer):
    """Serializer for listing exams"""
    question_count = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Exam
        fields = [
            'id', 'title', 'description', 'category', 'difficulty',
            'duration_minutes', 'total_marks', 'passing_marks',
            'is_premium', 'question_count', 'total_attempts',
            'average_score', 'created_by_name', 'created_at'
        ]
    
    def get_question_count(self, obj):
        return obj.questions.count()


class ExamDetailSerializer(serializers.ModelSerializer):
    """Detailed exam serializer with questions"""
    questions = QuestionSerializer(many=True, read_only=True)
    question_count = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Exam
        fields = [
            'id', 'title', 'description', 'category', 'difficulty',
            'duration_minutes', 'total_marks', 'passing_marks',
            'is_premium', 'allow_review', 'randomize_questions',
            'show_results_immediately', 'questions', 'question_count',
            'total_attempts', 'average_score', 'created_by_name',
            'created_at', 'updated_at'
        ]
    
    def get_question_count(self, obj):
        return obj.questions.count()


class AnswerSerializer(serializers.ModelSerializer):
    question = QuestionSerializer(read_only=True)
    question_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Answer
        fields = [
            'id', 'question', 'question_id', 'user_answer',
            'is_correct', 'marks_awarded', 'time_spent_seconds',
            'answered_at'
        ]
        read_only_fields = ['is_correct', 'marks_awarded', 'answered_at']


class AnswerSubmitSerializer(serializers.Serializer):
    """Serializer for submitting a single answer"""
    question_id = serializers.IntegerField()
    user_answer = serializers.JSONField()
    time_spent_seconds = serializers.IntegerField(default=0)


class ExamAttemptSerializer(serializers.ModelSerializer):
    exam = ExamListSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ExamAttempt
        fields = [
            'id', 'user', 'exam', 'status', 'start_time', 'end_time',
            'time_taken_minutes', 'score', 'percentage', 'marks_obtained',
            'total_marks', 'is_passed', 'is_completed', 'created_at'
        ]
        read_only_fields = [
            'score', 'percentage', 'marks_obtained', 'total_marks',
            'is_passed', 'is_completed'
        ]


class ExamAttemptDetailSerializer(serializers.ModelSerializer):
    """Detailed attempt serializer with answers"""
    exam = ExamDetailSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    answers = AnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = ExamAttempt
        fields = [
            'id', 'user', 'exam', 'status', 'start_time', 'end_time',
            'time_taken_minutes', 'score', 'percentage', 'marks_obtained',
            'total_marks', 'is_passed', 'is_completed', 'answers',
            'created_at', 'updated_at'
        ]


class ExamSubmitSerializer(serializers.Serializer):
    """Serializer for submitting entire exam"""
    answers = AnswerSubmitSerializer(many=True)
