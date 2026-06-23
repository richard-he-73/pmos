import pytest
from django.contrib.auth import get_user_model
from apps.notifications.models import Notification
from apps.notifications.services import (
    notify_user, notify_users, _build_title, _build_content,
    _extract_project_id, NOTIFICATION_TYPES,
)
from apps.projects.models import Project

User = get_user_model()


@pytest.mark.django_db
class TestNotificationServices:
    """通知服务单元测试"""

    def test_notify_user_creates_notification(self, normal_user):
        notify_user(normal_user.id, 'system_notice', extra='测试')
        assert Notification.objects.count() == 1
        n = Notification.objects.first()
        assert n.recipient == normal_user
        assert n.type == 'system_notice'

    def test_notify_user_with_related_obj(self, normal_user, admin_user):
        project = Project.objects.create(
            code='NOTIF1', name='通知测试项目',
            owner=admin_user, project_type='monthly',
        )
        notify_user(normal_user.id, 'project_created', project)
        n = Notification.objects.first()
        assert n.related_type == 'project'
        assert n.related_id == project.id
        assert project.name in n.title

    def test_notify_users_creates_bulk(self, normal_user, admin_user):
        notify_users([normal_user.id, admin_user.id], 'system_notice', extra='群发')
        assert Notification.objects.count() == 2

    def test_notify_users_empty_list(self):
        notify_users([], 'system_notice')
        assert Notification.objects.count() == 0

    def test_build_title_with_obj(self, admin_user):
        project = Project.objects.create(
            code='TITLE1', name='标题项目',
            owner=admin_user, project_type='monthly',
        )
        title = _build_title('project_created', project)
        assert '标题项目' in title
        assert '项目创建' in title

    def test_build_title_without_obj(self):
        title = _build_title('system_notice', None)
        assert title == '系统通知'

    def test_build_content_with_description(self, admin_user):
        project = Project.objects.create(
            code='CONT1', name='内容项目', description='这是一个描述信息',
            owner=admin_user, project_type='monthly',
        )
        content = _build_content('project_created', project)
        assert '描述' in content

    def test_extract_project_id_from_project(self, admin_user):
        project = Project.objects.create(
            code='EXTR1', name='提取项目',
            owner=admin_user, project_type='monthly',
        )
        pid = _extract_project_id(project)
        assert pid == project.id

    def test_extract_project_id_none(self):
        assert _extract_project_id(None) is None

    def test_notification_type_labels(self):
        assert 'task_assigned' in NOTIFICATION_TYPES
        assert 'bug_reported' in NOTIFICATION_TYPES
        assert len(NOTIFICATION_TYPES) >= 10
