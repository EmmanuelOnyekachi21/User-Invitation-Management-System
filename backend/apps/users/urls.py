from django.urls import path
from . import views


urlpatterns = [
    path('', views.UsersListView.as_view(), name='users_list'),
    path('<int:pk>/role/', views.UpdateRoleView.as_view(), name='update_role'),
    path('<int:pk>/status/', views.UpdateStatusView.as_view(), name='update_status'),
]
