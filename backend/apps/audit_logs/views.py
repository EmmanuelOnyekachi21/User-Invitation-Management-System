from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from apps.common.permissions import IsAdmin
from core.pagination import StandardPagination
from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogListView(APIView):
    # Read-only — no POST, PATCH, DELETE exposed. Logs must be immutable.
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        action = request.query_params.get('action', '')

        # Always most recent first — an admin investigating wants latest events
        queryset = AuditLog.objects.select_related('actor').order_by('-created_at')

        if action:
            queryset = queryset.filter(action=action)

        paginator = StandardPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = AuditLogSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
