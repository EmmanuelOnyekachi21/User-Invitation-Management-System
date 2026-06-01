from apps.common.models import TokenBaseModel
from django.db import models
from django.conf import settings

# Create your models here.
class Invitation(TokenBaseModel):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('REVOKED', 'Revoked'),
        ('EXPIRED', 'Expired'),
    ]

    email = models.EmailField()
    role = models.CharField(
        choices=[('ADMIN', 'Admin'), ('USER', 'User')],
        default='USER'
    )
    status = models.CharField(
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="sent_invitations"
    )
    accepted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Invitation({self.email}, {self.status})"

    def is_valid(self):
        return (
            self.status == 'PENDING' and
            not self.is_expired()
        )