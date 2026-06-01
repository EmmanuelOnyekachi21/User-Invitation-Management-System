from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    # actor is nullable — handle gracefully instead of returning null or crashing
    actor = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = ['id', 'actor', 'action', 'target_email', 'metadata', 'created_at']

    def get_actor(self, obj):
        if obj.actor is None:
            return 'System'
        full_name = f"{obj.actor.first_name} {obj.actor.last_name}".strip()
        return full_name or obj.actor.email
