from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Avg, Sum, Q
from .models import UserAnalytics, ActivityLog, PerformanceTrend
from .serializers import (
    UserAnalyticsSerializer,
    ActivityLogSerializer,
    PerformanceTrendSerializer,
    DashboardSummarySerializer
)
from apps.exams.models import ExamAttempt
from apps.interview.models import Interview


class AnalyticsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for user analytics data
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserAnalyticsSerializer
    
    def get_queryset(self):
        return UserAnalytics.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """
        Get comprehensive dashboard summary for the current user
        """
        user = request.user
        
        # Get or create user analytics
        analytics, created = UserAnalytics.objects.get_or_create(user=user)
        
        # Recalculate if needed
        if created or (timezone.now() - analytics.updated_at).total_seconds() > 300:  # 5 minutes
            analytics.recalculate_all()
        
        # Get recent activities (last 10)
        recent_activities = ActivityLog.objects.filter(user=user)[:10]
        
        # Get weekly trends (last 4 weeks)
        four_weeks_ago = timezone.now().date() - timedelta(weeks=4)
        weekly_trends = PerformanceTrend.objects.filter(
            user=user,
            period_type='weekly',
            period_start__gte=four_weeks_ago
        ).order_by('-period_start')[:4]
        
        # Calculate rates
        exam_pass_rate = (analytics.total_exams_passed / analytics.total_exams_taken * 100) if analytics.total_exams_taken > 0 else 0
        interview_completion_rate = (analytics.total_interviews_completed / analytics.total_interviews_taken * 100) if analytics.total_interviews_taken > 0 else 0
        
        summary_data = {
            'total_activities': analytics.total_exams_taken + analytics.total_interviews_taken,
            'current_streak': analytics.current_streak_days,
            'longest_streak': analytics.longest_streak_days,
            'total_exams': analytics.total_exams_taken,
            'exams_passed': analytics.total_exams_passed,
            'exam_pass_rate': round(exam_pass_rate, 2),
            'avg_exam_score': round(analytics.average_exam_score, 2),
            'total_interviews': analytics.total_interviews_taken,
            'interviews_completed': analytics.total_interviews_completed,
            'interview_completion_rate': round(interview_completion_rate, 2),
            'avg_interview_score': round(analytics.average_interview_score, 2),
            'recent_activities': ActivityLogSerializer(recent_activities, many=True).data,
            'weekly_trends': PerformanceTrendSerializer(weekly_trends, many=True).data,
        }
        
        serializer = DashboardSummarySerializer(summary_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def exam_stats(self, request):
        """
        Get detailed exam statistics
        """
        user = request.user
        attempts = ExamAttempt.objects.filter(user=user, status='completed')
        
        # Calculate statistics
        total_attempts = attempts.count()
        if total_attempts == 0:
            return Response({
                'total_attempts': 0,
                'passed': 0,
                'failed': 0,
                'pass_rate': 0,
                'average_score': 0,
                'highest_score': 0,
                'lowest_score': 0,
                'total_time_minutes': 0,
                'average_time_minutes': 0,
                'score_distribution': [],
            })
        
        scores = [a.score for a in attempts if a.score is not None]
        passed = len([s for s in scores if s >= 70])
        failed = total_attempts - passed
        
        # Score distribution (buckets of 10)
        score_distribution = {}
        for score in scores:
            bucket = int(score // 10) * 10
            score_distribution[bucket] = score_distribution.get(bucket, 0) + 1
        
        total_time = sum([a.time_taken for a in attempts if a.time_taken])
        
        return Response({
            'total_attempts': total_attempts,
            'passed': passed,
            'failed': failed,
            'pass_rate': round((passed / total_attempts) * 100, 2),
            'average_score': round(sum(scores) / len(scores), 2) if scores else 0,
            'highest_score': max(scores) if scores else 0,
            'lowest_score': min(scores) if scores else 0,
            'total_time_minutes': total_time,
            'average_time_minutes': round(total_time / total_attempts, 2) if total_attempts > 0 else 0,
            'score_distribution': [{'range': f'{k}-{k+9}', 'count': v} for k, v in sorted(score_distribution.items())],
        })
    
    @action(detail=False, methods=['get'])
    def interview_stats(self, request):
        """
        Get detailed interview statistics
        """
        user = request.user
        interviews = Interview.objects.filter(user=user)
        completed = interviews.filter(status='completed')
        
        total_interviews = interviews.count()
        total_completed = completed.count()
        
        if total_completed == 0:
            return Response({
                'total_interviews': total_interviews,
                'completed': 0,
                'in_progress': interviews.filter(status='in_progress').count(),
                'scheduled': interviews.filter(status='scheduled').count(),
                'completion_rate': 0,
                'average_score': 0,
                'highest_score': 0,
                'total_time_minutes': 0,
                'average_time_minutes': 0,
                'by_type': {},
            })
        
        scores = [i.total_score for i in completed if i.total_score is not None]
        
        # Calculate total time
        total_time = sum([
            (i.completed_at - i.started_at).total_seconds() / 60 
            for i in completed 
            if i.started_at and i.completed_at
        ])
        
        # Group by interview type
        by_type = completed.values('interview_type').annotate(
            count=Count('id'),
            avg_score=Avg('total_score')
        )
        
        return Response({
            'total_interviews': total_interviews,
            'completed': total_completed,
            'in_progress': interviews.filter(status='in_progress').count(),
            'scheduled': interviews.filter(status='scheduled').count(),
            'completion_rate': round((total_completed / total_interviews) * 100, 2) if total_interviews > 0 else 0,
            'average_score': round(sum(scores) / len(scores), 2) if scores else 0,
            'highest_score': max(scores) if scores else 0,
            'total_time_minutes': int(total_time),
            'average_time_minutes': round(total_time / total_completed, 2) if total_completed > 0 else 0,
            'by_type': [
                {
                    'type': item['interview_type'],
                    'count': item['count'],
                    'avg_score': round(item['avg_score'], 2) if item['avg_score'] else 0
                }
                for item in by_type
            ],
        })
    
    @action(detail=False, methods=['get'])
    def performance_trends(self, request):
        """
        Get performance trends over time
        """
        user = request.user
        period_type = request.query_params.get('period', 'weekly')  # daily, weekly, monthly
        limit = int(request.query_params.get('limit', 10))
        
        trends = PerformanceTrend.objects.filter(
            user=user,
            period_type=period_type
        ).order_by('-period_start')[:limit]
        
        serializer = PerformanceTrendSerializer(trends, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def activity_history(self, request):
        """
        Get user activity history
        """
        user = request.user
        activity_type = request.query_params.get('type', None)
        limit = int(request.query_params.get('limit', 20))
        
        activities = ActivityLog.objects.filter(user=user)
        
        if activity_type:
            activities = activities.filter(activity_type=activity_type)
        
        activities = activities[:limit]
        
        serializer = ActivityLogSerializer(activities, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def log_activity(self, request):
        """
        Log a new user activity
        """
        user = request.user
        activity_type = request.data.get('activity_type')
        description = request.data.get('description', '')
        metadata = request.data.get('metadata', {})
        
        activity = ActivityLog.objects.create(
            user=user,
            activity_type=activity_type,
            description=description,
            exam_attempt_id=request.data.get('exam_attempt_id'),
            interview_id=request.data.get('interview_id'),
            metadata=metadata
        )
        
        # Update user analytics streak
        analytics, _ = UserAnalytics.objects.get_or_create(user=user)
        analytics.update_streak()
        analytics.save()
        
        serializer = ActivityLogSerializer(activity)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def refresh_analytics(self, request):
        """
        Force refresh of user analytics
        """
        user = request.user
        analytics, _ = UserAnalytics.objects.get_or_create(user=user)
        analytics.recalculate_all()
        
        serializer = UserAnalyticsSerializer(analytics)
        return Response(serializer.data)

