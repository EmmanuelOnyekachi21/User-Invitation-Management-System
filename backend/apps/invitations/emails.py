import logging
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

logger = logging.getLogger(__name__)

def send_invitation_email(invitation):
    link = f"{settings.FRONTEND_URL}/register?token={invitation.token}"
    subject = "You've been invited"
    from_email = settings.EMAIL_FROM
    to = [invitation.email]

    # Plain text fallback
    text_content = f"You have been invited. Use this link to register: {link}"

    # HTML version
    html_content = f"""
    <p>You have been invited to join the platform.</p>
    <p>Click the link below to complete your registration:</p>
    <p><a href="{link}">{link}</a></p>
    <p>This link expires in 3 days.</p>
    """

    try:
        msg = EmailMultiAlternatives(subject, text_content, from_email, to)
        msg.attach_alternative(html_content, "text/html")
        msg.send()
    except Exception as e:
        # Never crash the endpoint over email failure — log and move on
        logger.error(f"Failed to send invitation email to {invitation.email}: {e}")

