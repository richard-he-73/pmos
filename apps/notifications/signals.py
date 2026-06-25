from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.conf import settings

from .services import notify_user, notify_users

User = get_user_model()


def _get_project_members(project):
    """获取项目所有成员的ID列表"""
    from apps.projects.models import ProjectMember
    return list(ProjectMember.objects.filter(
        project=project, is_active=True,
    ).values_list('user_id', flat=True))


# ── 项目 ──

@receiver(post_save, sender='projects.Project')
def project_saved(sender, instance, created, **kwargs):
    if created:
        # 通知项目负责人
        notify_user(instance.owner_id, 'project_created', instance)
    else:
        # 通知所有项目成员
        member_ids = _get_project_members(instance)
        if member_ids:
            notify_users(member_ids, 'project_updated', instance)


# ── 任务 ──

@receiver(post_save, sender='plans.Task')
def task_saved(sender, instance, created, **kwargs):
    action = 'task_assigned' if created else 'task_updated'
    # 通知负责人
    if instance.assignee_id:
        notify_user(instance.assignee_id, action, instance)
    # 通知项目成员
    project_id = instance.plan.project_id if instance.plan else None
    if project_id:
        from apps.projects.models import ProjectMember
        others = ProjectMember.objects.filter(
            project_id=project_id, is_active=True,
        ).exclude(user_id=instance.assignee_id).values_list('user_id', flat=True)
        if others:
            notify_users(list(others), action, instance)


# ── 缺陷 ──

@receiver(post_save, sender='testing.TestDefect')
def defect_saved(sender, instance, created, **kwargs):
    if instance.assignee_id:
        notify_user(instance.assignee_id, 'bug_assigned', instance)


# ── 需求 ──

