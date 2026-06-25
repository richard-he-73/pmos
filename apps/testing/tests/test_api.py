import pytest
from apps.projects.models import Project


@pytest.fixture
def project(admin_user):
    return Project.objects.create(code='TESTPROJ', name='测试测试项目', owner=admin_user, project_type='fixed')


@pytest.mark.django_db
class TestTestPlanViewSet:
    """测试计划 API 测试"""

    def test_create(self, admin_client, project):
        res = admin_client.post('/api/v1/test-plans/', {
            'name': '第一轮测试', 'project': project.id,
        }, format='json')
        assert res.status_code == 201

    def test_list(self, auth_client, project):
        res = auth_client.get('/api/v1/test-plans/')
        assert res.status_code == 200


@pytest.mark.django_db
class TestTestDefectViewSet:
    """测试缺陷 API 测试"""

    def test_create_defect(self, admin_client, project):
        res = admin_client.post('/api/v1/test-defects/', {
            'name': '登录按钮不响应', 'severity': 'fatal',
            'project': project.id,
        }, format='json')
        assert res.status_code == 201
        assert res.data['name'] == '登录按钮不响应'

    def test_update_defect_status(self, admin_client, project):
        bug = admin_client.post('/api/v1/test-defects/', {
            'name': '页面崩溃', 'severity': 'fatal',
            'project': project.id,
        }, format='json').data
        res = admin_client.patch(f'/api/v1/test-defects/{bug["id"]}/', {'status': 'resolved'}, format='json')
        assert res.status_code == 200
        assert res.data['status'] == 'resolved'

    def test_list_defects(self, auth_client, project):
        res = auth_client.get('/api/v1/test-defects/')
        assert res.status_code == 200
