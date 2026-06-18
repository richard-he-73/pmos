import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestUserModel:
    def test_create_user(self):
        user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            real_name='测试用户',
            email='test@example.com',
        )
        assert user.username == 'testuser'
        assert user.real_name == '测试用户'
        assert user.is_active is True
        assert str(user) == '测试用户'

    def test_create_superuser(self):
        admin = User.objects.create_superuser(
            username='admin', password='admin123',
        )
        assert admin.is_superuser is True
        assert admin.is_staff is True

    def test_user_defaults_to_active(self):
        user = User.objects.create_user(username='newuser', password='pass')
        assert user.is_active is True
