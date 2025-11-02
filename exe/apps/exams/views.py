from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from datetime import timedelta
from .models import Exam, Question, ExamAttempt, Answer
from .serializers import (
    ExamListSerializer, ExamDetailSerializer, ExamAttemptSerializer,
    ExamAttemptDetailSerializer, AnswerSerializer, AnswerSubmitSerializer,
    ExamSubmitSerializer, QuestionDetailSerializer
)


class ExamViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing exams
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Exam.objects.filter(is_published=True)
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by difficulty
        difficulty = self.request.query_params.get('difficulty', None)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        # Filter premium (if user is not premium)
        if not self.request.user.is_premium:
            queryset = queryset.filter(is_premium=False)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ExamDetailSerializer
        return ExamListSerializer
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """
        Start a new exam attempt
        POST /api/v1/exams/{id}/start/
        """
        exam = self.get_object()
        user = request.user
        
        # Check if user already has an in-progress attempt
        existing_attempt = ExamAttempt.objects.filter(
            user=user,
            exam=exam,
            status='in_progress'
        ).first()
        
        if existing_attempt:
            return Response({
                'error': 'You already have an in-progress attempt for this exam',
                'attempt_id': existing_attempt.id
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create new attempt
        attempt = ExamAttempt.objects.create(
            user=user,
            exam=exam,
            status='in_progress',
            total_marks=sum(q.marks for q in exam.questions.all())
        )
        
        serializer = ExamAttemptSerializer(attempt)
        return Response({
            'message': 'Exam started successfully',
            'attempt': serializer.data,
            'end_time': (attempt.start_time + timedelta(minutes=exam.duration_minutes)).isoformat()
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """
        Get all questions for an exam
        GET /api/v1/exams/{id}/questions/
        """
        exam = self.get_object()
        questions = exam.questions.all()
        
        if exam.randomize_questions:
            questions = questions.order_by('?')
        
        serializer = QuestionDetailSerializer(questions, many=True, context={'request': request})
        return Response(serializer.data)


class ExamAttemptViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing exam attempts
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ExamAttemptSerializer
    
    def get_queryset(self):
        return ExamAttempt.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ExamAttemptDetailSerializer
        return ExamAttemptSerializer
    
    @action(detail=True, methods=['post'])
    def submit_answer(self, request, pk=None):
        """
        Submit answer for a single question
        POST /api/v1/attempts/{id}/submit_answer/
        Body: {"question_id": 1, "user_answer": ["A"], "time_spent_seconds": 30}
        """
        attempt = self.get_object()
        
        if attempt.status != 'in_progress':
            return Response({
                'error': 'This attempt is not in progress'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = AnswerSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        question_id = serializer.validated_data['question_id']
        user_answer = serializer.validated_data['user_answer']
        time_spent = serializer.validated_data.get('time_spent_seconds', 0)
        
        # Get question
        try:
            question = attempt.exam.questions.get(id=question_id)
        except Question.DoesNotExist:
            return Response({
                'error': 'Question not found in this exam'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Create or update answer
        answer, created = Answer.objects.update_or_create(
            attempt=attempt,
            question=question,
            defaults={
                'user_answer': user_answer,
                'time_spent_seconds': time_spent
            }
        )
        
        # Evaluate answer
        answer.evaluate()
        
        return Response({
            'message': 'Answer submitted successfully',
            'is_correct': answer.is_correct,
            'marks_awarded': answer.marks_awarded
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """
        Submit entire exam
        POST /api/v1/attempts/{id}/submit/
        Body: {
            "answers": [
                {"question_id": 1, "user_answer": ["A"], "time_spent_seconds": 30},
                {"question_id": 2, "user_answer": ["B", "C"], "time_spent_seconds": 45}
            ]
        }
        """
        attempt = self.get_object()
        
        if attempt.status != 'in_progress':
            return Response({
                'error': 'This attempt is not in progress'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ExamSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Process all answers
        for answer_data in serializer.validated_data['answers']:
            question_id = answer_data['question_id']
            user_answer = answer_data['user_answer']
            time_spent = answer_data.get('time_spent_seconds', 0)
            
            try:
                question = attempt.exam.questions.get(id=question_id)
                answer, created = Answer.objects.update_or_create(
                    attempt=attempt,
                    question=question,
                    defaults={
                        'user_answer': user_answer,
                        'time_spent_seconds': time_spent
                    }
                )
                answer.evaluate()
            except Question.DoesNotExist:
                continue
        
        # Mark attempt as completed
        attempt.status = 'completed'
        attempt.is_completed = True
        attempt.end_time = timezone.now()
        attempt.time_taken_minutes = int((attempt.end_time - attempt.start_time).total_seconds() / 60)
        attempt.save()
        
        # Calculate final score
        attempt.calculate_score()
        
        # Return results
        result_serializer = ExamAttemptDetailSerializer(attempt)
        return Response({
            'message': 'Exam submitted successfully',
            'result': result_serializer.data
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        """
        Get detailed results of an attempt
        GET /api/v1/attempts/{id}/results/
        """
        attempt = self.get_object()
        
        if not attempt.is_completed:
            return Response({
                'error': 'Exam is not completed yet'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Set flag to show answers in serializer
        request.show_answers = attempt.exam.allow_review
        
        serializer = ExamAttemptDetailSerializer(attempt, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_attempts(self, request):
        """
        Get all attempts by current user
        GET /api/v1/attempts/my_attempts/
        """
        attempts = self.get_queryset()
        
        # Filter by exam
        exam_id = request.query_params.get('exam_id', None)
        if exam_id:
            attempts = attempts.filter(exam_id=exam_id)
        
        # Filter by status
        status_filter = request.query_params.get('status', None)
        if status_filter:
            attempts = attempts.filter(status=status_filter)
        
        serializer = ExamAttemptSerializer(attempts, many=True)
        return Response(serializer.data)
