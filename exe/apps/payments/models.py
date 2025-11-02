from django.db import models
from django.conf import settings
from django.utils import timezone
from decimal import Decimal


class PaymentPlan(models.Model):
    """Subscription plans and one-time purchases"""
    PLAN_TYPE_CHOICES = [
        ('subscription', 'Subscription'),
        ('one_time', 'One-Time Purchase'),
    ]
    
    BILLING_PERIOD_CHOICES = [
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
        ('lifetime', 'Lifetime'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPE_CHOICES, default='subscription')
    billing_period = models.CharField(max_length=20, choices=BILLING_PERIOD_CHOICES, default='monthly')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    
    # Features
    max_exams = models.IntegerField(null=True, blank=True, help_text="Max exams per period (null = unlimited)")
    max_interviews = models.IntegerField(null=True, blank=True, help_text="Max interviews per period (null = unlimited)")
    ai_feedback_enabled = models.BooleanField(default=True)
    advanced_analytics = models.BooleanField(default=False)
    priority_support = models.BooleanField(default=False)
    
    # Metadata
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['sort_order', 'price']
        indexes = [
            models.Index(fields=['plan_type', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_billing_period_display()}) - ${self.price}"


class Subscription(models.Model):
    """User subscriptions"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
        ('trial', 'Trial'),
        ('past_due', 'Past Due'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(PaymentPlan, on_delete=models.PROTECT, related_name='subscriptions')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Dates
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField(null=True, blank=True)
    next_billing_date = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    
    # Usage tracking
    exams_used = models.IntegerField(default=0)
    interviews_used = models.IntegerField(default=0)
    
    # Payment gateway info
    stripe_subscription_id = models.CharField(max_length=255, null=True, blank=True)
    razorpay_subscription_id = models.CharField(max_length=255, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'next_billing_date']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.plan.name} ({self.status})"
    
    def is_active(self):
        """Check if subscription is currently active"""
        if self.status not in ['active', 'trial']:
            return False
        if self.end_date and timezone.now() > self.end_date:
            return False
        return True
    
    def can_use_exams(self):
        """Check if user can take more exams"""
        if not self.is_active():
            return False
        if self.plan.max_exams is None:
            return True
        return self.exams_used < self.plan.max_exams
    
    def can_use_interviews(self):
        """Check if user can take more interviews"""
        if not self.is_active():
            return False
        if self.plan.max_interviews is None:
            return True
        return self.interviews_used < self.plan.max_interviews
    
    def increment_exam_usage(self):
        """Increment exam usage counter"""
        self.exams_used += 1
        self.save(update_fields=['exams_used', 'updated_at'])
    
    def increment_interview_usage(self):
        """Increment interview usage counter"""
        self.interviews_used += 1
        self.save(update_fields=['interviews_used', 'updated_at'])
    
    def reset_usage(self):
        """Reset usage counters (for new billing period)"""
        self.exams_used = 0
        self.interviews_used = 0
        self.save(update_fields=['exams_used', 'interviews_used', 'updated_at'])


class Payment(models.Model):
    """Payment transactions"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('credit_card', 'Credit Card'),
        ('debit_card', 'Debit Card'),
        ('upi', 'UPI'),
        ('netbanking', 'Net Banking'),
        ('wallet', 'Wallet'),
        ('paypal', 'PayPal'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    subscription = models.ForeignKey(Subscription, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    plan = models.ForeignKey(PaymentPlan, on_delete=models.PROTECT, related_name='payments')
    
    # Transaction details
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES, null=True, blank=True)
    
    # Payment gateway info
    transaction_id = models.CharField(max_length=255, unique=True)
    stripe_payment_intent_id = models.CharField(max_length=255, null=True, blank=True)
    razorpay_payment_id = models.CharField(max_length=255, null=True, blank=True)
    razorpay_order_id = models.CharField(max_length=255, null=True, blank=True)
    
    # Additional info
    description = models.TextField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(null=True, blank=True)
    
    # Dates
    paid_at = models.DateTimeField(null=True, blank=True)
    refunded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['transaction_id']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"Payment {self.transaction_id} - {self.user.username} - {self.amount} {self.currency}"
    
    def mark_completed(self):
        """Mark payment as completed"""
        self.status = 'completed'
        self.paid_at = timezone.now()
        self.save(update_fields=['status', 'paid_at', 'updated_at'])
    
    def mark_failed(self, error_message=None):
        """Mark payment as failed"""
        self.status = 'failed'
        if error_message:
            self.error_message = error_message
        self.save(update_fields=['status', 'error_message', 'updated_at'])
    
    def mark_refunded(self):
        """Mark payment as refunded"""
        self.status = 'refunded'
        self.refunded_at = timezone.now()
        self.save(update_fields=['status', 'refunded_at', 'updated_at'])


class Invoice(models.Model):
    """Invoices for payments"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('issued', 'Issued'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='invoices')
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='invoice', null=True, blank=True)
    subscription = models.ForeignKey(Subscription, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices')
    
    # Invoice details
    invoice_number = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Amounts
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    
    # Dates
    issue_date = models.DateField(default=timezone.now)
    due_date = models.DateField(null=True, blank=True)
    paid_date = models.DateField(null=True, blank=True)
    
    # Additional info
    notes = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['invoice_number']),
        ]
    
    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.user.username} - ${self.total}"
    
    def mark_paid(self):
        """Mark invoice as paid"""
        self.status = 'paid'
        self.paid_date = timezone.now().date()
        self.save(update_fields=['status', 'paid_date', 'updated_at'])
