from django.apps import AppConfig


class AuditLogsConfig(AppConfig):
    name = 'apps.audit_logs'
    label = 'audit_logs'
    default_auto_field = 'django.db.models.BigAutoField'
