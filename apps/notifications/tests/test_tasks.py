import pytest
from django.contrib.auth import get_user_model
from apps.notifications.models import Notification
from apps.notifications.tasks import send_notification, send_bulk_notification

User = get_user_model()


@pytest.mark.django_db
class TestNotificationTasks:
    """Celery 通知任务单元测试"""

    def test_send_notification_creates(self, normal_user):
        """send_notification 创建通知记录"""
        result = send_notification(normal_user.id, 'task_assigned', '测试任务', '内容')
        assert Notification.objects.count() == 1
        n = Notification.objects.first()
        assert n.recipient == normal_user
        assert n.type == 'task_assigned'
        assert n.title == '测试任务'
        assert 'sent to user1' in result

    def test_send_notification_user_not_found(self):
        """用户不存在时返回错误信息"""
        result = send_notification(99999, 'system_notice', '通知')
        assert 'not found' in result
        assert Notification.objects.count() == 0

    def test_send_bulk_notification(self, normal_user, admin_user):
        """批量发送通知"""
        result = send_bulk_notification(
            [normal_user.id, admin_user.id], 'system_notice', '群发通知',
        )
        assert Notification.objects.count() == 2
        assert '2 users' in result

    def test_send_bulk_notification_partial_failure(self, normal_user):
        """部分用户不存在时跳过"""
        result = send_bulk_notification(
            [normal_user.id, 99999], 'system_notice', '部分失败',
        )
        assert Notification.objects.count() == 1
        assert '1 users' in result

    def test_send_notification_with_related(self, normal_user):
        """带关联信息的通知"""
        send_notification(normal_user.id, 'bug_assigned', '缺陷#1',
                          related_type='bug', related_id=42)
        n = Notification.objects.first()
        assert n.related_type == 'bug'
        assert n.related_id == 42
