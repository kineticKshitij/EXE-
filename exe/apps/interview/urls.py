from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InterviewViewSet, InterviewTemplateViewSet

router = DefaultRouter()
router.register(r'interviews', InterviewViewSet, basename='interview')
router.register(r'templates', InterviewTemplateViewSet, basename='template')

urlpatterns = [
    path('', include(router.urls)),
]
