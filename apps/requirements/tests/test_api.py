import pytest
from apps.projects.models import Project


@pytest.fixture
def project(admin_user):
    return Project.objects.create(code='REQPROJ', name='需求测试项目', owner=admin_user, project_type='monthly')


@pytest.mark.django_db
class TestRequirementViewSet:
    """需求 API 测试"""

    def test_create(self, admin_client, project):
        res = admin_client.post('/api/v1/requirements/', {
            'name': '用户登录', 'type': 'business', 'project': project.id,
        }, format='json')
        assert res.status_code == 201
        assert res.data['name'] == '用户登录'
        assert res.data['status'] == 'submitted'

    def test_list(self, auth_client, project):
        res = auth_client.get('/api/v1/requirements/')
        assert res.status_code == 200

    def test_submit_review(self, admin_client, project):
        req = admin_client.post('/api/v1/requirements/', {
            'name': '审批功能', 'type': 'software_func', 'project': project.id,
        }, format='json').data
        res = admin_client.post(f'/api/v1/requirements/{req["id"]}/submit_review/', format='json')
        assert res.status_code == 200
        assert res.data['status'] == 'pending_review'

    def test_withdraw_review(self, admin_client, project):
        req = admin_client.post('/api/v1/requirements/', {
            'name': '撤回测试', 'type': 'business', 'project': project.id,
        }, format='json').data
        admin_client.post(f'/api/v1/requirements/{req["id"]}/submit_review/', format='json')
        res = admin_client.post(f'/api/v1/requirements/{req["id"]}/withdraw_review/', format='json')
        assert res.status_code == 200
        assert res.data['status'] == 'submitted'

    def test_filter_by_type(self, admin_client, project):
        admin_client.post('/api/v1/requirements/', {'name': '业务', 'type': 'business', 'project': project.id}, format='json')
        admin_client.post('/api/v1/requirements/', {'name': '功能', 'type': 'software_func', 'project': project.id}, format='json')
        res = admin_client.get('/api/v1/requirements/?type=business')
        assert res.status_code == 200
        results = res.data.get('results', [])
        assert all(r['type'] == 'business' for r in results)
