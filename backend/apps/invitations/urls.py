from django.urls import path
from . import views

urlpatterns = [
    path('', views.CreateInvitationView.as_view(), name='create_invitation'),
    path('validate-token/', views.ValidateTokenView.as_view(), name='validate_token'),
    path('accept/', views.AcceptInvitationView.as_view(), name='accept_invitation'),
    path('<int:pk>/revoke/', views.RevokeInvitationView.as_view(), name='revoke_invitation'),
]
