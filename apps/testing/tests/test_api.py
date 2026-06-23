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
class TestBugViewSet:
    """缺陷 API 测试"""

    def test_create_bug(self, admin_client, project):
        res = admin_client.post('/api/v1/bugs/', {
            'title': '登录按钮不响应', 'severity': 'major',
            'source': '功能测试', 'module': '登录模块',
        }, format='json')
        assert res.status_code == 201
        assert res.data['title'] == '登录按钮不响应'

    def test_update_bug_status(self, admin_client, project):
        bug = admin_client.post('/api/v1/bugs/', {
            'title': '页面崩溃', 'severity': 'critical',
            'source': '回归测试', 'module': '首页',
        }, format='json').data
        res = admin_client.patch(f'/api/v1/bugs/{bug["id"]}/', {'status': 'resolved'}, format='json')
        assert res.status_code == 200
        assert res.data['status'] == 'resolved'

    def test_list_bugs(self, auth_client, project):
        res = auth_client.get('/api/v1/bugs/')
        assert res.status_code == 200
