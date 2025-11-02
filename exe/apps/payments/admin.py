from django.contrib import admin
from .models import PaymentPlan, Subscription, Payment, Invoice


@admin.register(PaymentPlan)
class PaymentPlanAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'plan_type', 'billing_period', 'price', 'currency',
        'is_active', 'is_featured', 'sort_order'
    ]
    list_filter = ['plan_type', 'billing_period', 'is_active', 'is_featured']
    search_fields = ['name', 'description']
    list_editable = ['is_active', 'is_featured', 'sort_order']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'plan_type', 'billing_period')
        }),
        ('Pricing', {
            'fields': ('price', 'currency')
        }),
        ('Features', {
            'fields': (
                'max_exams', 'max_interviews', 'ai_feedback_enabled',
                'advanced_analytics', 'priority_support'
            )
        }),
        ('Status', {
            'fields': ('is_active', 'is_featured', 'sort_order')
        }),
    )


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'plan', 'status', 'start_date', 'end_date',
        'exams_used', 'interviews_used', 'created_at'
    ]
    list_filter = ['status', 'plan', 'created_at']
    search_fields = ['user__username', 'user__email', 'plan__name']
    readonly_fields = [
        'stripe_subscription_id', 'razorpay_subscription_id',
        'created_at', 'updated_at'
    ]
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('User & Plan', {
            'fields': ('user', 'plan', 'status')
        }),
        ('Dates', {
            'fields': (
                'start_date', 'end_date', 'next_billing_date', 'cancelled_at'
            )
        }),
        ('Usage', {
            'fields': ('exams_used', 'interviews_used')
        }),
        ('Payment Gateway Info', {
            'fields': ('stripe_subscription_id', 'razorpay_subscription_id'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['reset_usage_counters']
    
    def reset_usage_counters(self, request, queryset):
        """Admin action to reset usage counters"""
        count = 0
        for subscription in queryset:
            subscription.reset_usage()
            count += 1
        self.message_user(request, f'Reset usage counters for {count} subscription(s)')
    reset_usage_counters.short_description = 'Reset usage counters'


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        'transaction_id', 'user', 'plan', 'amount', 'currency',
        'status', 'payment_method', 'created_at'
    ]
    list_filter = ['status', 'payment_method', 'currency', 'created_at']
    search_fields = [
        'transaction_id', 'user__username', 'user__email',
        'razorpay_payment_id', 'stripe_payment_intent_id'
    ]
    readonly_fields = [
        'transaction_id', 'paid_at', 'refunded_at',
        'created_at', 'updated_at'
    ]
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Transaction Info', {
            'fields': ('transaction_id', 'user', 'subscription', 'plan')
        }),
        ('Payment Details', {
            'fields': (
                'amount', 'currency', 'status', 'payment_method', 'description'
            )
        }),
        ('Payment Gateway Info', {
            'fields': (
                'stripe_payment_intent_id', 'razorpay_payment_id',
                'razorpay_order_id', 'metadata'
            ),
            'classes': ('collapse',)
        }),
        ('Status Info', {
            'fields': ('error_message', 'paid_at', 'refunded_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_completed', 'mark_as_failed']
    
    def mark_as_completed(self, request, queryset):
        """Admin action to mark payments as completed"""
        count = 0
        for payment in queryset.filter(status='pending'):
            payment.mark_completed()
            count += 1
        self.message_user(request, f'Marked {count} payment(s) as completed')
    mark_as_completed.short_description = 'Mark as completed'
    
    def mark_as_failed(self, request, queryset):
        """Admin action to mark payments as failed"""
        count = 0
        for payment in queryset.filter(status='pending'):
            payment.mark_failed()
            count += 1
        self.message_user(request, f'Marked {count} payment(s) as failed')
    mark_as_failed.short_description = 'Mark as failed'


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = [
        'invoice_number', 'user', 'total', 'currency',
        'status', 'issue_date', 'paid_date'
    ]
    list_filter = ['status', 'currency', 'issue_date']
    search_fields = ['invoice_number', 'user__username', 'user__email']
    readonly_fields = ['invoice_number', 'created_at', 'updated_at']
    date_hierarchy = 'issue_date'
    
    fieldsets = (
        ('Invoice Info', {
            'fields': ('invoice_number', 'user', 'payment', 'subscription', 'status')
        }),
        ('Amounts', {
            'fields': ('subtotal', 'tax', 'discount', 'total', 'currency')
        }),
        ('Dates', {
            'fields': ('issue_date', 'due_date', 'paid_date')
        }),
        ('Additional Info', {
            'fields': ('notes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
