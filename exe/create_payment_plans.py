import os
import django
import sys

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exe.settings')
django.setup()

from apps.payments.models import PaymentPlan
from decimal import Decimal


def create_payment_plans():
    """Create sample payment plans"""
    
    # Free Plan
    free_plan, created = PaymentPlan.objects.get_or_create(
        name="Free Plan",
        defaults={
            'description': 'Perfect for getting started with basic features',
            'plan_type': 'subscription',
            'billing_period': 'monthly',
            'price': Decimal('0.00'),
            'currency': 'USD',
            'max_exams': 5,
            'max_interviews': 3,
            'ai_feedback_enabled': False,
            'advanced_analytics': False,
            'priority_support': False,
            'is_active': True,
            'is_featured': False,
            'sort_order': 1
        }
    )
    print(f"{'✓ Created' if created else '  Exists'} Free Plan")
    
    # Basic Monthly Plan
    basic_plan, created = PaymentPlan.objects.get_or_create(
        name="Basic Plan",
        defaults={
            'description': 'Ideal for regular practice and interview preparation',
            'plan_type': 'subscription',
            'billing_period': 'monthly',
            'price': Decimal('9.99'),
            'currency': 'USD',
            'max_exams': 50,
            'max_interviews': 20,
            'ai_feedback_enabled': True,
            'advanced_analytics': False,
            'priority_support': False,
            'is_active': True,
            'is_featured': False,
            'sort_order': 2
        }
    )
    print(f"{'✓ Created' if created else '  Exists'} Basic Plan - $9.99/month")
    
    # Pro Monthly Plan
    pro_plan, created = PaymentPlan.objects.get_or_create(
        name="Pro Plan",
        defaults={
            'description': 'Best for serious candidates with unlimited access',
            'plan_type': 'subscription',
            'billing_period': 'monthly',
            'price': Decimal('19.99'),
            'currency': 'USD',
            'max_exams': None,  # Unlimited
            'max_interviews': None,  # Unlimited
            'ai_feedback_enabled': True,
            'advanced_analytics': True,
            'priority_support': False,
            'is_active': True,
            'is_featured': True,
            'sort_order': 3
        }
    )
    print(f"{'✓ Created' if created else '  Exists'} Pro Plan - $19.99/month (Featured)")
    
    # Pro Yearly Plan
    pro_yearly, created = PaymentPlan.objects.get_or_create(
        name="Pro Plan (Yearly)",
        defaults={
            'description': 'Save 30% with annual billing - unlimited everything!',
            'plan_type': 'subscription',
            'billing_period': 'yearly',
            'price': Decimal('167.88'),  # ~$14/month
            'currency': 'USD',
            'max_exams': None,  # Unlimited
            'max_interviews': None,  # Unlimited
            'ai_feedback_enabled': True,
            'advanced_analytics': True,
            'priority_support': True,
            'is_active': True,
            'is_featured': True,
            'sort_order': 4
        }
    )
    print(f"{'✓ Created' if created else '  Exists'} Pro Plan (Yearly) - $167.88/year")
    
    # Premium Plan
    premium_plan, created = PaymentPlan.objects.get_or_create(
        name="Premium Plan",
        defaults={
            'description': 'Ultimate package with priority support and all features',
            'plan_type': 'subscription',
            'billing_period': 'monthly',
            'price': Decimal('29.99'),
            'currency': 'USD',
            'max_exams': None,  # Unlimited
            'max_interviews': None,  # Unlimited
            'ai_feedback_enabled': True,
            'advanced_analytics': True,
            'priority_support': True,
            'is_active': True,
            'is_featured': False,
            'sort_order': 5
        }
    )
    print(f"{'✓ Created' if created else '  Exists'} Premium Plan - $29.99/month")
    
    # Lifetime Access
    lifetime_plan, created = PaymentPlan.objects.get_or_create(
        name="Lifetime Access",
        defaults={
            'description': 'One-time payment for unlimited lifetime access',
            'plan_type': 'one_time',
            'billing_period': 'lifetime',
            'price': Decimal('299.99'),
            'currency': 'USD',
            'max_exams': None,  # Unlimited
            'max_interviews': None,  # Unlimited
            'ai_feedback_enabled': True,
            'advanced_analytics': True,
            'priority_support': True,
            'is_active': True,
            'is_featured': False,
            'sort_order': 6
        }
    )
    print(f"{'✓ Created' if created else '  Exists'} Lifetime Access - $299.99 (one-time)")
    
    print("\n✅ Payment plans initialized successfully!")
    print(f"Total plans: {PaymentPlan.objects.count()}")


if __name__ == '__main__':
    create_payment_plans()
