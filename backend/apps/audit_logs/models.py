from django.db import models
from django.conf import settings

# Create your models here.
class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('INVITE_CREATED', 'Invite Created'),
        ('INVITE_ACCEPTED', 'Invite Accepted'),
        ('INVITE_REVOKED', 'Invite Revoked'),
        ('USER_LOGIN', 'User Login'),
        ('USER_LOGOUT', 'User Logout'),
        ('ROLE_UPDATED', 'Role Updated'),
        ('STATUS_UPDATED', 'Status Updated'),
    ]

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs'
    )
    action = models.CharField(choices=ACTION_CHOICES)
    target_email = models.EmailField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.actor} — {self.action} at {self.created_at}"