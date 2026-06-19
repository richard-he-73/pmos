from celery import shared_task
from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()


@shared_task
def send_notification(recipient_id, type, title, content='', related_type='', related_id=None):
    """异步发送通知"""
    try:
        recipient = User.objects.get(id=recipient_id)
        Notification.objects.create(
            recipient=recipient,
            type=type,
            title=title,
            content=content,
            related_type=related_type,
            related_id=related_id,
        )
        return f'Notification sent to {recipient.username}'
    except User.DoesNotExist:
        return f'User {recipient_id} not found'


@shared_task
def send_bulk_notification(user_ids, type, title, content='', related_type='', related_id=None):
    """批量发送通知"""
    count = 0
    for uid in user_ids:
        try:
            recipient = User.objects.get(id=uid)
            Notification.objects.create(
                recipient=recipient,
                type=type,
                title=title,
                content=content,
                related_type=related_type,
                related_id=related_id,
            )
            count += 1
        except User.DoesNotExist:
            pass
    return f'Notifications sent to {count} users'
