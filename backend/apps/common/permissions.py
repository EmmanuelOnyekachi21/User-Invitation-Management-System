from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    def has_permisison(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == "ADMIN"
        )

