from rest_framework import serializers
from .models import PaymentPlan, Subscription, Payment, Invoice
from django.utils import timezone
from datetime import timedelta
import uuid


class PaymentPlanSerializer(serializers.ModelSerializer):
    """Serializer for payment plans"""
    features = serializers.SerializerMethodField()
    
    class Meta:
        model = PaymentPlan
        fields = [
            'id', 'name', 'description', 'plan_type', 'billing_period',
            'price', 'currency', 'max_exams', 'max_interviews',
            'ai_feedback_enabled', 'advanced_analytics', 'priority_support',
            'is_featured', 'features'
        ]
    
    def get_features(self, obj):
        """Return list of features for easy display"""
        features = []
        
        if obj.max_exams:
            features.append(f"{obj.max_exams} exams per {obj.billing_period}")
        else:
            features.append("Unlimited exams")
        
        if obj.max_interviews:
            features.append(f"{obj.max_interviews} interviews per {obj.billing_period}")
        else:
            features.append("Unlimited interviews")
        
        if obj.ai_feedback_enabled:
            features.append("AI-powered feedback")
        
        if obj.advanced_analytics:
            features.append("Advanced analytics")
        
        if obj.priority_support:
            features.append("Priority support")
        
        return features


class SubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for subscriptions"""
    plan_details = PaymentPlanSerializer(source='plan', read_only=True)
    is_active_status = serializers.SerializerMethodField()
    can_take_exams = serializers.SerializerMethodField()
    can_take_interviews = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()
    usage_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'plan', 'plan_details', 'status', 'start_date', 'end_date',
            'next_billing_date', 'cancelled_at', 'exams_used', 'interviews_used',
            'is_active_status', 'can_take_exams', 'can_take_interviews',
            'days_remaining', 'usage_percentage', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'exams_used', 'interviews_used', 'created_at', 'updated_at'
        ]
    
    def get_is_active_status(self, obj):
        return obj.is_active()
    
    def get_can_take_exams(self, obj):
        return obj.can_use_exams()
    
    def get_can_take_interviews(self, obj):
        return obj.can_use_interviews()
    
    def get_days_remaining(self, obj):
        """Calculate days remaining in subscription"""
        if not obj.end_date:
            return None
        delta = obj.end_date - timezone.now()
        return max(0, delta.days)
    
    def get_usage_percentage(self, obj):
        """Calculate usage percentage for exams and interviews"""
        usage = {}
        
        if obj.plan.max_exams:
            usage['exams'] = round((obj.exams_used / obj.plan.max_exams) * 100, 1)
        else:
            usage['exams'] = 0
        
        if obj.plan.max_interviews:
            usage['interviews'] = round((obj.interviews_used / obj.plan.max_interviews) * 100, 1)
        else:
            usage['interviews'] = 0
        
        return usage


class CreateSubscriptionSerializer(serializers.Serializer):
    """Serializer for creating a new subscription"""
    plan_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=Payment.PAYMENT_METHOD_CHOICES)
    
    def validate_plan_id(self, value):
        """Validate plan exists and is active"""
        try:
            plan = PaymentPlan.objects.get(id=value, is_active=True)
            return value
        except PaymentPlan.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive payment plan")
    
    def create(self, validated_data):
        """Create subscription and payment"""
        user = self.context['request'].user
        plan = PaymentPlan.objects.get(id=validated_data['plan_id'])
        
        # Calculate end date based on billing period
        start_date = timezone.now()
        if plan.billing_period == 'monthly':
            end_date = start_date + timedelta(days=30)
        elif plan.billing_period == 'quarterly':
            end_date = start_date + timedelta(days=90)
        elif plan.billing_period == 'yearly':
            end_date = start_date + timedelta(days=365)
        else:  # lifetime
            end_date = None
        
        # Create subscription
        subscription = Subscription.objects.create(
            user=user,
            plan=plan,
            status='active',
            start_date=start_date,
            end_date=end_date,
            next_billing_date=end_date if plan.plan_type == 'subscription' else None
        )
        
        # Create payment record
        payment = Payment.objects.create(
            user=user,
            subscription=subscription,
            plan=plan,
            amount=plan.price,
            currency=plan.currency,
            status='pending',
            payment_method=validated_data['payment_method'],
            transaction_id=f"TXN-{uuid.uuid4().hex[:12].upper()}",
            description=f"Subscription: {plan.name}"
        )
        
        return {
            'subscription': subscription,
            'payment': payment
        }


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for payments"""
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'user', 'user_email', 'subscription', 'plan', 'plan_name',
            'amount', 'currency', 'status', 'payment_method', 'transaction_id',
            'description', 'error_message', 'paid_at', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'user', 'transaction_id', 'paid_at', 'created_at', 'updated_at'
        ]


class PaymentConfirmSerializer(serializers.Serializer):
    """Serializer for confirming payment"""
    payment_id = serializers.IntegerField()
    razorpay_payment_id = serializers.CharField(required=False, allow_blank=True)
    razorpay_order_id = serializers.CharField(required=False, allow_blank=True)
    stripe_payment_intent_id = serializers.CharField(required=False, allow_blank=True)
    
    def validate_payment_id(self, value):
        """Validate payment exists and belongs to user"""
        try:
            payment = Payment.objects.get(id=value)
            if payment.user != self.context['request'].user:
                raise serializers.ValidationError("Payment does not belong to you")
            if payment.status not in ['pending', 'processing']:
                raise serializers.ValidationError("Payment cannot be confirmed")
            return value
        except Payment.DoesNotExist:
            raise serializers.ValidationError("Payment not found")


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for invoices"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    payment_transaction_id = serializers.CharField(source='payment.transaction_id', read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'user', 'user_email', 'payment', 'payment_transaction_id',
            'subscription', 'invoice_number', 'status', 'subtotal', 'tax',
            'discount', 'total', 'currency', 'issue_date', 'due_date',
            'paid_date', 'notes', 'created_at'
        ]
        read_only_fields = ['invoice_number', 'created_at']
