import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user():
    return User.objects.create_superuser(
        username='admin', password='testpass123',
        real_name='管理员',
    )


@pytest.fixture
def normal_user():
    return User.objects.create_user(
        username='user1', password='testpass123',
        real_name='普通用户',
    )


@pytest.fixture
def auth_client(api_client, normal_user):
    """普通用户认证客户端"""
    api_client.force_authenticate(user=normal_user)
    return api_client


@pytest.fixture
def admin_client(api_client, admin_user):
    """管理员认证客户端"""
    api_client.force_authenticate(user=admin_user)
    return api_client
