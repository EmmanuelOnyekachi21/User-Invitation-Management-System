import logging
from django.contrib.auth import authenticate
from django.contrib.auth.backends import ModelBackend
from apps.users.models import User
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from core.responses import success_response
from .serializers import LoginSerializer

logger = logging.getLogger(__name__)

BLOCKED_STATUSES = {'BANNED', 'SUSPENDED', 'PENDING_VERIFICATION'}


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        user = None
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed("Invalid email or password.")

        if not user.check_password(password):
            raise AuthenticationFailed("Invalid email or password.")

        if user.status in BLOCKED_STATUSES:
            raise PermissionDenied(f"Account is {user.status.lower().replace('_', ' ')}.")

        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role  # inject role into JWT payload
        access_token = str(refresh.access_token)

        response = success_response(
            data={"access": access_token},
            message="Login successful."
        )
        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            httponly=True,
            secure=False,
            samesite='Lax',
            max_age=7 * 24 * 60 * 60,
        )
        return response


class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.COOKIES.get('refresh_token')

        if not token:
            raise AuthenticationFailed("Refresh token missing.")

        try:
            refresh = RefreshToken(token)
            access_token = str(refresh.access_token)
        except TokenError:
            raise AuthenticationFailed("Invalid or expired refresh token.")

        return success_response(
            data={"access": access_token},
            message="Token refreshed."
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        token = request.COOKIES.get('refresh_token')

        if token:
            try:
                refresh = RefreshToken(token)
                refresh.blacklist()
            except TokenError:
                pass

        response = success_response(message="Logged out successfully.")
        response.delete_cookie('refresh_token')
        return response
