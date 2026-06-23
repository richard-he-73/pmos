import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestUserViewSet:
    """用户管理 API 测试"""

    def test_list_users_as_admin(self, admin_client):
        """管理员可以查看用户列表"""
        User.objects.create_user(username='test1', password='pass123')
        res = admin_client.get('/api/v1/users/')
        assert res.status_code == 200
        results = res.data.get('results', res.data)
        assert len(results) >= 1

    def test_list_users_as_normal(self, auth_client, normal_user):
        """普通用户只能看到自己"""
        User.objects.create_user(username='other', password='pass123')
        res = auth_client.get('/api/v1/users/')
        assert res.status_code == 200
        results = res.data.get('results', res.data)
        assert len(results) == 1
        assert results[0]['id'] == normal_user.id

    def test_me_endpoint(self, auth_client, normal_user):
        """获取当前用户信息"""
        res = auth_client.get('/api/v1/users/me/')
        assert res.status_code == 200
        assert res.data['username'] == normal_user.username

    def test_update_me(self, auth_client):
        """更新自己的信息"""
        res = auth_client.patch('/api/v1/users/me/', {'real_name': '新名字'}, format='json')
        assert res.status_code == 200
        assert res.data['real_name'] == '新名字'

    def test_create_user_as_admin(self, admin_client):
        """管理员可以创建用户"""
        res = admin_client.post('/api/v1/users/', {
            'username': 'newuser',
            'password': 'TestPass123!',
            'password2': 'TestPass123!',
            'real_name': '新人',
            'user_type': 'user',
        }, format='json')
        assert res.status_code == 201
        assert res.data['username'] == 'newuser'

    def test_create_user_with_mismatched_password(self, admin_client):
        """密码不匹配时拒绝创建"""
        res = admin_client.post('/api/v1/users/', {
            'username': 'baduser',
            'password': 'Pass123!',
            'password2': 'DiffPass123!',
            'user_type': 'user',
        }, format='json')
        assert res.status_code == 400

    def test_unauthenticated_access(self, api_client):
        """未认证用户不能访问"""
        res = api_client.get('/api/v1/users/')
        assert res.status_code == 401


@pytest.mark.django_db
class TestAuthEndpoints:
    """JWT 认证端点测试"""

    def test_login_success(self, api_client, normal_user):
        """使用正确凭据登录"""
        normal_user.set_password('testpass123')
        normal_user.save()
        res = api_client.post('/api/v1/auth/login/', {
            'username': 'user1',
            'password': 'testpass123',
        }, format='json')
        assert res.status_code == 200
        assert 'access' in res.data
        assert 'refresh' in res.data

    def test_login_failure(self, api_client):
        """错误密码拒绝登录"""
        res = api_client.post('/api/v1/auth/login/', {
            'username': 'user1',
            'password': 'wrongpass',
        }, format='json')
        assert res.status_code == 401
