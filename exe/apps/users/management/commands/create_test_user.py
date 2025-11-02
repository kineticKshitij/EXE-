from django.core.management.base import BaseCommand
from apps.users.models import User


class Command(BaseCommand):
    help = 'Create a test user for API testing'

    def handle(self, *args, **kwargs):
        email = 'test@example.com'
        username = 'testuser'
        password = 'testpass123'
        
        # Delete existing user
        User.objects.filter(email=email).delete()
        User.objects.filter(username=username).delete()
        
        # Create fresh user
        user = User.objects.create_user(
            email=email,
            username=username,
            password=password,
            first_name='Test',
            last_name='User'
        )
        
        self.stdout.write(self.style.SUCCESS(f'Test user created: {email}'))
        self.stdout.write(self.style.SUCCESS(f'Username: {username}'))
        self.stdout.write(self.style.SUCCESS(f'Password: {password}'))
        self.stdout.write(self.style.SUCCESS(f'User ID: {user.id}'))
