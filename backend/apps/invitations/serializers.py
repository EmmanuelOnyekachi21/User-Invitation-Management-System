from rest_framework import serializers
from .models import Invitation


class InvitationSerializer(serializers.ModelSerializer):
    # Return inviter's full name or email — never a raw FK id
    invited_by = serializers.SerializerMethodField()

    class Meta:
        model = Invitation
        fields = [
            'id',
            'email',
            'role',
            'status',
            'invited_by',
            'expires_at',
            'accepted_at',
            'created_at',
            # token intentionally excluded — it's a secret
        ]
        read_only_fields = fields

    def get_invited_by(self, obj):
        if not obj.invited_by:
            return None
        full_name = f"{obj.invited_by.first_name} {obj.invited_by.last_name}".strip()
        return full_name or obj.invited_by.email


class CreateInvitationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=['ADMIN', 'USER'], default='USER')

    def validate_email(self, value):
        if Invitation.objects.filter(email=value, status='PENDING').exists():
            raise serializers.ValidationError(
                "A pending invitation already exists for this email."
            )
        return value
