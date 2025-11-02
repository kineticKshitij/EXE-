from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentPlanViewSet, SubscriptionViewSet, PaymentViewSet, InvoiceViewSet

router = DefaultRouter()
router.register(r'plans', PaymentPlanViewSet, basename='paymentplan')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'invoices', InvoiceViewSet, basename='invoice')

urlpatterns = [
    path('', include(router.urls)),
]
