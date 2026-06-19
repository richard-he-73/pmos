from django.conf import settings

NOTIFICATION_TYPES = {
    'task_assigned': '任务分配',
    'task_updated': '任务更新',
    'bug_reported': '缺陷报告',
    'bug_assigned': '缺陷分配',
    'project_created': '项目创建',
    'project_updated': '项目更新',
    'project_member_added': '项目成员',
    'requirement_updated': '需求更新',
    'plan_updated': '计划更新',
    'release_planned': '投产计划',
    'system_notice': '系统通知',
}


def notify_user(recipient_id, type, related_obj=None, extra=''):
    """发送通知给单个用户"""
    title = _build_title(type, related_obj, extra)
    related_type = related_obj._meta.model_name if related_obj else ''
    related_id = related_obj.id if related_obj else None
    content = _build_content(type, related_obj)
    _dispatch(recipient_id, type, title, content, related_type, related_id)


def notify_users(user_ids, type, related_obj=None, extra=''):
    """发送通知给多个用户"""
    if not user_ids:
        return
    title = _build_title(type, related_obj, extra)
    related_type = related_obj._meta.model_name if related_obj else ''
    related_id = related_obj.id if related_obj else None
    content = _build_content(type, related_obj)
    _dispatch_bulk(user_ids, type, title, content, related_type, related_id)


def _dispatch(recipient_id, type, title, content, related_type, related_id):
    """同步发送通知（开发模式用，生产环境可改为 Celery）"""
    from .models import Notification
    from django.contrib.auth import get_user_model
    User = get_user_model()
    try:
        Notification.objects.create(
            recipient=User.objects.get(id=recipient_id),
            type=type, title=title, content=content,
            related_type=related_type, related_id=related_id,
        )
    except Exception:
        pass


def _dispatch_bulk(user_ids, type, title, content, related_type, related_id):
    """批量同步发送"""
    from .models import Notification
    from django.contrib.auth import get_user_model
    User = get_user_model()
    users = User.objects.filter(id__in=user_ids)
    notifications = [
        Notification(
            recipient=user, type=type, title=title, content=content,
            related_type=related_type, related_id=related_id,
        )
        for user in users
    ]
    Notification.objects.bulk_create(notifications)


def _build_title(type, obj, extra=''):
    name = getattr(obj, 'name', '') or getattr(obj, 'title', '') or str(obj) if obj else ''
    prefix = NOTIFICATION_TYPES.get(type, type)
    return f'{prefix}: {name}' if name else prefix


def _build_content(type, obj):
    if not obj:
        return ''
    desc = getattr(obj, 'description', '') or ''
    return desc[:200] if desc else str(obj)[:200]
