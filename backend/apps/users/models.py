from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # hashes the password — never store plain text
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('role', 'ADMIN')
        extra_fields.setdefault('status', 'ACTIVE')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)

    role = models.CharField(
        choices=[
            ('ADMIN', 'Admin'),
            ('USER', 'User'),
        ],
        default='ADMIN'
    )
    status = models.CharField(
        choices=[
            ('ACTIVE', 'Active'),
            ('BANNED', 'Banned'),
            ('SUSPENDED', 'Suspended'),
        ],
        default='ACTIVE'
    )
    joined_via = models.CharField(
        choices=[
            ('REG', 'Registration'),
            ('INVITE', 'Invitation'),
        ],
        default='REG'
    )
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def save(self, *args, **kwargs):
        self.is_active = self.status == 'ACTIVE'
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.email
