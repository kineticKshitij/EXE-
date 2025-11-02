from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q
from .models import Interview, InterviewQuestion, InterviewResponse, InterviewTemplate
from .serializers import (
    InterviewListSerializer, InterviewDetailSerializer, InterviewCreateSerializer,
    InterviewResultSerializer, InterviewQuestionSerializer, InterviewResponseSerializer,
    InterviewResponseCreateSerializer, InterviewTemplateSerializer
)


class InterviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing interviews
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return InterviewListSerializer
        elif self.action == 'create':
            return InterviewCreateSerializer
        elif self.action == 'results':
            return InterviewResultSerializer
        return InterviewDetailSerializer
    
    def get_queryset(self):
        queryset = Interview.objects.filter(user=self.request.user)
        
        # Filtering
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        interview_type = self.request.query_params.get('type')
        if interview_type:
            queryset = queryset.filter(interview_type=interview_type)
        
        difficulty = self.request.query_params.get('difficulty')
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """Create new interview"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        interview = serializer.save(user=request.user)
        
        # Generate AI questions if requested
        if interview.use_ai:
            self._generate_ai_questions(interview)
        
        return Response({
            'message': 'Interview created successfully',
            'interview': InterviewDetailSerializer(interview).data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """
        Start interview
        POST /api/v1/interviews/{id}/start/
        """
        interview = self.get_object()
        
        if interview.status != 'scheduled':
            return Response({
                'error': 'Interview is not in scheduled status'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        interview.status = 'in_progress'
        interview.started_at = timezone.now()
        interview.save()
        
        return Response({
            'message': 'Interview started successfully',
            'interview': InterviewDetailSerializer(interview).data
        })
    
    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """
        Get interview questions
        GET /api/v1/interviews/{id}/questions/
        """
        interview = self.get_object()
        questions = interview.questions.all()
        serializer = InterviewQuestionSerializer(questions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def submit_response(self, request, pk=None):
        """
        Submit response to a question
        POST /api/v1/interviews/{id}/submit_response/
        Body: {
            "question_id": 1,
            "text_response": "Answer...",
            "time_taken_seconds": 120
        }
        """
        interview = self.get_object()
        
        if interview.status != 'in_progress':
            return Response({
                'error': 'Interview is not in progress'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = InterviewResponseCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        question_id = serializer.validated_data.pop('question_id')
        
        try:
            question = interview.questions.get(id=question_id)
        except InterviewQuestion.DoesNotExist:
            return Response({
                'error': 'Question not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Create or update response
        response, created = InterviewResponse.objects.update_or_create(
            interview=interview,
            question=question,
            defaults={
                **serializer.validated_data,
                'submitted_at': timezone.now()
            }
        )
        
        # Evaluate response with AI if enabled
        if interview.use_ai:
            self._evaluate_response(response)
        
        return Response({
            'message': 'Response submitted successfully',
            'response': InterviewResponseSerializer(response).data
        })
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Complete interview and generate final feedback
        POST /api/v1/interviews/{id}/complete/
        """
        interview = self.get_object()
        
        if interview.status != 'in_progress':
            return Response({
                'error': 'Interview is not in progress'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        interview.status = 'completed'
        interview.completed_at = timezone.now()
        interview.calculate_score()
        
        # Generate overall feedback
        if interview.use_ai:
            self._generate_overall_feedback(interview)
        
        interview.save()
        
        return Response({
            'message': 'Interview completed successfully',
            'interview': InterviewResultSerializer(interview).data
        })
    
    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        """
        Get detailed interview results
        GET /api/v1/interviews/{id}/results/
        """
        interview = self.get_object()
        
        if interview.status != 'completed':
            return Response({
                'error': 'Interview is not completed yet'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = InterviewResultSerializer(interview)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_interviews(self, request):
        """
        Get user's interview history
        GET /api/v1/interviews/my_interviews/
        """
        interviews = Interview.objects.filter(user=request.user).order_by('-created_at')
        serializer = InterviewListSerializer(interviews, many=True)
        return Response(serializer.data)
    
    def _generate_ai_questions(self, interview):
        """Generate AI questions based on job role and skills"""
        # TODO: Integrate with OpenAI API
        # For now, generate sample questions
        sample_questions = [
            {
                'text': f"Tell me about your experience with {skill}",
                'type': 'technical',
                'difficulty': interview.difficulty
            }
            for skill in interview.required_skills[:3]
        ]
        
        # Add behavioral questions
        sample_questions.append({
            'text': f"Describe a challenging situation you faced as a {interview.job_role}",
            'type': 'behavioral',
            'difficulty': interview.difficulty
        })
        
        # Create questions
        for i, q_data in enumerate(sample_questions, 1):
            InterviewQuestion.objects.create(
                interview=interview,
                question_text=q_data['text'],
                question_type=q_data['type'],
                difficulty=q_data['difficulty'],
                order=i,
                is_ai_generated=True
            )
    
    def _evaluate_response(self, response):
        """Evaluate response using AI"""
        # TODO: Integrate with OpenAI API for evaluation
        # For now, give a sample score
        response.score = 7.5
        response.ai_feedback = "Good answer. Consider providing more specific examples."
        response.evaluation_metrics = {
            'clarity': 8,
            'relevance': 7,
            'depth': 7,
            'technical_accuracy': 8
        }
        response.is_evaluated = True
        response.save()
    
    def _generate_overall_feedback(self, interview):
        """Generate overall feedback for the interview"""
        # TODO: Integrate with OpenAI API
        # For now, generate sample feedback
        avg_score = interview.total_score / interview.responses.count() if interview.responses.count() > 0 else 0
        
        interview.overall_feedback = f"Overall performance: {'Excellent' if avg_score >= 8 else 'Good' if avg_score >= 6 else 'Needs Improvement'}"
        interview.strengths = ["Clear communication", "Technical knowledge"]
        interview.weaknesses = ["Could provide more examples", "Time management"]
        interview.recommendations = ["Practice more coding problems", "Work on system design skills"]


class InterviewTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for interview templates
    """
    queryset = InterviewTemplate.objects.filter(is_active=True)
    serializer_class = InterviewTemplateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        interview_type = self.request.query_params.get('type')
        if interview_type:
            queryset = queryset.filter(interview_type=interview_type)
        
        difficulty = self.request.query_params.get('difficulty')
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def use_template(self, request, pk=None):
        """
        Create interview from template
        POST /api/v1/templates/{id}/use_template/
        Body: {
            "job_role": "Software Engineer",
            "company_name": "ABC Corp"
        }
        """
        template = self.get_object()
        
        # Create interview from template
        interview = Interview.objects.create(
            user=request.user,
            title=template.title,
            description=template.description,
            interview_type=template.interview_type,
            difficulty=template.difficulty,
            job_role=request.data.get('job_role', 'Software Engineer'),
            company_name=request.data.get('company_name', ''),
            duration_minutes=template.duration_minutes,
            total_questions=len(template.questions),
            status='scheduled'
        )
        
        # Create questions from template
        for i, q_data in enumerate(template.questions, 1):
            InterviewQuestion.objects.create(
                interview=interview,
                question_text=q_data['question'],
                question_type=q_data.get('type', 'general'),
                difficulty=q_data.get('difficulty', template.difficulty),
                expected_answer=q_data.get('expected_answer', ''),
                order=i
            )
        
        # Update template usage
        template.times_used += 1
        template.save()
        
        return Response({
            'message': 'Interview created from template',
            'interview': InterviewDetailSerializer(interview).data
        }, status=status.HTTP_201_CREATED)
