from django.db.models import Count, Q
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from apps.common.permissions import IsAdmin
from apps.invitations.models import Invitation
from core.responses import success_response


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        stats = Invitation.objects.aggregate(
            total=Count('id'),
            pending=Count('id', filter=Q(status='PENDING')),
            accepted=Count('id', filter=Q(status='ACCEPTED')),
        )
        return success_response(data=stats, message="Dashboard stats retrieved.")
