from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'first_name',
            'last_name',
            'email',
            'role',
            'status',
            'is_active',
            'joined_via',
            'date_joined',
            'updated_at',
        ]
        read_only_fields = ['id', 'is_active', 'date_joined', 'updated_at', 'joined_via']
