from django.utils import timezone
from django.db import transaction
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import ValidationError, NotFound

from apps.common.permissions import IsAdmin
from apps.audit_logs.models import AuditLog
from apps.users.models import User
from core.responses import success_response
from core.pagination import StandardPagination
from .models import Invitation
from .serializers import CreateInvitationSerializer, InvitationSerializer
from .emails import send_invitation_email


class CreateInvitationView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        search = request.query_params.get('search', '')
        status = request.query_params.get('status', '')

        queryset = Invitation.objects.select_related('invited_by').order_by('-created_at')

        if search:
            queryset = queryset.filter(email__icontains=search)
        if status:
            queryset = queryset.filter(status=status)

        paginator = StandardPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = InvitationSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = CreateInvitationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        invitation = Invitation.objects.create(
            email=serializer.validated_data['email'],
            role=serializer.validated_data['role'],
            invited_by=request.user,
        )

        # Send email — failure is logged but never crashes the endpoint
        send_invitation_email(invitation)

        # Write audit log
        AuditLog.objects.create(
            actor=request.user,
            action='INVITE_CREATED',
            target_email=invitation.email,
            metadata={'role': invitation.role}
        )

        return success_response(
            data=InvitationSerializer(invitation).data,
            message="Invitation sent successfully.",
        )


class ValidateTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')

        if not token:
            raise ValidationError("Token is required")
        
        try:
            invitation = Invitation.objects.get(token=(token))
        except Invitation.DoesNotExist:
            raise ValidationError("This invitation link is invalid or has expired.")

        if not invitation.is_valid():
            raise ValidationError("This invitation link is invalid or has expired.")

        return success_response(
            data={'email': invitation.email, 'role': invitation.role},
            message="Token is valid."
        )



class AcceptInvitationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        password = request.data.get('password')

        if not all([token, first_name, last_name, password]):
            raise ValidationError("All fields are required.")

        try:
            invitation = Invitation.objects.get(token=token)
        except Invitation.DoesNotExist:
            raise ValidationError("This invitation link is invalid or has expired.")

        if not invitation.is_valid():
            raise ValidationError("This invitation link is invalid or has expired.")

        # Wrap everything in a transaction — if anything fails, nothing is saved
        with transaction.atomic():
            user = User.objects.create_user(
                email=invitation.email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                role=invitation.role,
                status='ACTIVE',
                joined_via='INVITE',
            )

            invitation.status = 'ACCEPTED'
            invitation.accepted_at = timezone.now()
            invitation.save()

            AuditLog.objects.create(
                actor=user,
                action='INVITE_ACCEPTED',
                target_email=user.email,
                metadata={'role': user.role}
            )

        return success_response(
            message="Registration successful. You can now log in.",
        )


class RevokeInvitationView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, pk):
        try:
            invitation = Invitation.objects.get(pk=pk)
        except Invitation.DoesNotExist:
            raise NotFound("Invitation not found.")

        if invitation.status != 'PENDING':
            raise ValidationError(
                f"Cannot revoke an invitation with status '{invitation.status}'."
            )

        invitation.status = 'REVOKED'
        invitation.save()

        AuditLog.objects.create(
            actor=request.user,
            action='INVITE_REVOKED',
            target_email=invitation.email,
        )

        return success_response(message="Invitation revoked.")



