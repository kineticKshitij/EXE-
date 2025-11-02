from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import PaymentPlan, Subscription, Payment, Invoice
from .serializers import (
    PaymentPlanSerializer, SubscriptionSerializer, CreateSubscriptionSerializer,
    PaymentSerializer, PaymentConfirmSerializer, InvoiceSerializer
)
import uuid


class PaymentPlanViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing payment plans"""
    queryset = PaymentPlan.objects.filter(is_active=True)
    serializer_class = PaymentPlanSerializer
    permission_classes = []  # Public endpoint
    
    def get_queryset(self):
        """Filter plans by type if specified"""
        queryset = super().get_queryset()
        plan_type = self.request.query_params.get('plan_type')
        if plan_type:
            queryset = queryset.filter(plan_type=plan_type)
        return queryset
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured plans"""
        plans = self.get_queryset().filter(is_featured=True)
        serializer = self.get_serializer(plans, many=True)
        return Response(serializer.data)


class SubscriptionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing subscriptions"""
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return subscriptions for current user"""
        return Subscription.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active subscription"""
        subscriptions = self.get_queryset().filter(
            status__in=['active', 'trial']
        ).order_by('-created_at')
        
        if subscriptions.exists():
            serializer = self.get_serializer(subscriptions.first())
            return Response(serializer.data)
        else:
            return Response(
                {'detail': 'No active subscription found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def create_subscription(self, request):
        """Create a new subscription with payment"""
        serializer = CreateSubscriptionSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            result = serializer.save()
            
            return Response({
                'subscription': SubscriptionSerializer(result['subscription']).data,
                'payment': PaymentSerializer(result['payment']).data,
                'message': 'Subscription created. Please complete payment.'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a subscription"""
        subscription = self.get_object()
        
        if subscription.status not in ['active', 'trial']:
            return Response(
                {'detail': 'Subscription is not active'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        subscription.status = 'cancelled'
        subscription.cancelled_at = timezone.now()
        subscription.save(update_fields=['status', 'cancelled_at', 'updated_at'])
        
        serializer = self.get_serializer(subscription)
        return Response({
            'subscription': serializer.data,
            'message': 'Subscription cancelled successfully'
        })
    
    @action(detail=True, methods=['post'])
    def renew(self, request, pk=None):
        """Renew a cancelled or expired subscription"""
        subscription = self.get_object()
        
        if subscription.status not in ['cancelled', 'expired']:
            return Response(
                {'detail': 'Subscription cannot be renewed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create new payment for renewal
        payment = Payment.objects.create(
            user=request.user,
            subscription=subscription,
            plan=subscription.plan,
            amount=subscription.plan.price,
            currency=subscription.plan.currency,
            status='pending',
            transaction_id=f"TXN-{uuid.uuid4().hex[:12].upper()}",
            description=f"Renewal: {subscription.plan.name}"
        )
        
        return Response({
            'payment': PaymentSerializer(payment).data,
            'message': 'Renewal initiated. Please complete payment.'
        })


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing payments"""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return payments for current user"""
        return Payment.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def confirm_payment(self, request):
        """Confirm a payment after gateway processing"""
        serializer = PaymentConfirmSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            payment_id = serializer.validated_data['payment_id']
            payment = Payment.objects.get(id=payment_id)
            
            # Update payment with gateway info
            if 'razorpay_payment_id' in serializer.validated_data:
                payment.razorpay_payment_id = serializer.validated_data['razorpay_payment_id']
                payment.razorpay_order_id = serializer.validated_data.get('razorpay_order_id', '')
            
            if 'stripe_payment_intent_id' in serializer.validated_data:
                payment.stripe_payment_intent_id = serializer.validated_data['stripe_payment_intent_id']
            
            # Mark payment as completed
            payment.mark_completed()
            
            # Update subscription status if needed
            if payment.subscription:
                if payment.subscription.status == 'cancelled':
                    payment.subscription.status = 'active'
                    payment.subscription.save(update_fields=['status', 'updated_at'])
            
            # Create invoice
            invoice = Invoice.objects.create(
                user=payment.user,
                payment=payment,
                subscription=payment.subscription,
                invoice_number=f"INV-{timezone.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}",
                status='paid',
                subtotal=payment.amount,
                total=payment.amount,
                currency=payment.currency,
                paid_date=timezone.now().date()
            )
            
            return Response({
                'payment': PaymentSerializer(payment).data,
                'invoice': InvoiceSerializer(invoice).data,
                'message': 'Payment confirmed successfully'
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def status_check(self, request, pk=None):
        """Check payment status"""
        payment = self.get_object()
        serializer = self.get_serializer(payment)
        return Response(serializer.data)


class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing invoices"""
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return invoices for current user"""
        return Invoice.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download invoice (placeholder for PDF generation)"""
        invoice = self.get_object()
        serializer = self.get_serializer(invoice)
        
        # In production, generate PDF here
        # For now, return invoice data
        return Response({
            'invoice': serializer.data,
            'message': 'Invoice data retrieved. PDF generation not implemented.'
        })

