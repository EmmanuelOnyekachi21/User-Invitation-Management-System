from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError, NotFound
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken

from apps.common.permissions import IsAdmin
from apps.audit_logs.models import AuditLog
from core.responses import success_response
from core.pagination import StandardPagination
from .models import User
from .serializers import UserSerializer


class UsersListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        search = request.query_params.get('search', '')
        role = request.query_params.get('role', '')
        status = request.query_params.get('status', '')

        queryset = User.objects.all().order_by('-date_joined')

        if search:
            queryset = queryset.filter(
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        if role:
            queryset = queryset.filter(role=role)
        if status:
            queryset = queryset.filter(status=status)

        paginator = StandardPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = UserSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class UpdateRoleView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            raise NotFound("User not found.")

        # Prevent admin from demoting themselves
        if request.user.id == user.id:
            raise PermissionDenied("You cannot change your own role.")

        new_role = request.data.get('role')
        if new_role not in ['ADMIN', 'USER']:
            raise ValidationError("Invalid role.")

        old_role = user.role
        user.role = new_role
        user.save()

        AuditLog.objects.create(
            actor=request.user,
            action='ROLE_UPDATED',
            target_email=user.email,
            metadata={'from': old_role, 'to': new_role}
        )

        return success_response(
            data=UserSerializer(user).data,
            message=f"Role updated to {new_role}."
        )


class UpdateStatusView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            raise NotFound("User not found.")

        if request.user.id == user.id:
            raise PermissionDenied("You cannot change your own status.")

        new_status = request.data.get('status')
        valid_statuses = ['ACTIVE', 'BANNED', 'SUSPENDED', 'PENDING_VERIFICATION']
        if new_status not in valid_statuses:
            raise ValidationError("Invalid status.")

        old_status = user.status
        user.status = new_status
        user.save()  # triggers is_active sync via model's save()

        # Invalidate all sessions if banned or suspended
        if new_status in ['BANNED', 'SUSPENDED']:
            tokens = OutstandingToken.objects.filter(user=user)
            for token in tokens:
                BlacklistedToken.objects.get_or_create(token=token)

        AuditLog.objects.create(
            actor=request.user,
            action='STATUS_UPDATED',
            target_email=user.email,
            metadata={'from': old_status, 'to': new_status}
        )

        return success_response(
            data=UserSerializer(user).data,
            message=f"Status updated to {new_status}."
        )
