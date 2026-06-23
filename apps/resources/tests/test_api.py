import pytest
from apps.projects.models import Project
from apps.resources.models import Consultant


@pytest.fixture
def project(admin_user):
    return Project.objects.create(code='RESTEST', name='资源测试', owner=admin_user, project_type='monthly')


@pytest.fixture
def consultant(admin_client, project):
    res = admin_client.post('/api/v1/consultants/', {
        'name': '李顾问', 'gender': 'male', 'rank': 'senior',
        'status': 'entered', 'project': project.id,
    }, format='json')
    return res.data


@pytest.mark.django_db
class TestConsultantViewSet:
    """咨询人员 API 测试"""

    def test_list_consultants(self, auth_client):
        res = auth_client.get('/api/v1/consultants/')
        assert res.status_code == 200

    def test_create_consultant(self, admin_client, project):
        res = admin_client.post('/api/v1/consultants/', {
            'name': '王专家', 'gender': 'female', 'rank': 'director',
            'project': project.id,
        }, format='json')
        assert res.status_code == 201
        assert res.data['rank'] == 'director'

    def test_update_consultant(self, admin_client, consultant):
        res = admin_client.patch(f'/api/v1/consultants/{consultant["id"]}/', {
            'rank': 'director',
        }, format='json')
        assert res.status_code == 200
        assert res.data['rank'] == 'director'

    def test_check_user_by_name(self, admin_client, consultant):
        res = admin_client.get('/api/v1/consultants/check_user_by_name/?name=李顾问')
        assert res.status_code == 200
        assert 'exists' in res.data

    def test_check_user_by_name_empty(self, admin_client):
        res = admin_client.get('/api/v1/consultants/check_user_by_name/?name=')
        assert res.status_code == 400

    def test_create_with_user(self, admin_client, project):
        res = admin_client.post('/api/v1/consultants/create_with_user/', {
            'name': '自动创建用户',
            'gender': 'male',
            'rank': 'consultant',
            'project': project.id,
            'create_user': True,
        }, format='json')
        assert res.status_code == 201
        # 验证关联用户已创建
        from django.contrib.auth import get_user_model
        User = get_user_model()
        assert User.objects.filter(real_name='自动创建用户').exists()


@pytest.mark.django_db
class TestProjectResourceViewSet:
    """项目资源 API 测试"""

    def test_create(self, admin_client, project, normal_user):
        res = admin_client.post('/api/v1/project-resources/', {
            'project': project.id,
            'user': normal_user.id,
            'role_in_project': '开发工程师',
            'join_date': '2026-01-01',
        }, format='json')
        assert res.status_code == 201

    def test_list(self, auth_client):
        res = auth_client.get('/api/v1/project-resources/')
        assert res.status_code == 200
