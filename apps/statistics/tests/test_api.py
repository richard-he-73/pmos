import pytest
from apps.projects.models import Project


@pytest.fixture
def project(admin_user):
    return Project.objects.create(code='STATTEST', name='统计测试项目', owner=admin_user, project_type='monthly')


@pytest.fixture
def plan(admin_client, project):
    res = admin_client.post('/api/v1/plans/', {
        'name': '里程碑A', 'type': 'milestone', 'project': project.id,
    }, format='json')
    return res.data


@pytest.mark.django_db
class TestStatisticsViewSet:
    """统计 API 测试"""

    def test_project_overview(self, auth_client, project):
        res = auth_client.get('/api/v1/statistics/project_overview/')
        assert res.status_code == 200
        assert 'total' in res.data
        assert res.data['total'] >= 1
        assert 'by_status' in res.data

    def test_project_overview_unauthenticated(self, api_client):
        res = api_client.get('/api/v1/statistics/project_overview/')
        assert res.status_code == 401

    def test_project_detail_no_param(self, auth_client):
        res = auth_client.get('/api/v1/statistics/project_detail/')
        assert res.status_code == 400

    def test_project_detail_with_project(self, auth_client, project):
        res = auth_client.get(f'/api/v1/statistics/project_detail/?project={project.id}')
        assert res.status_code == 200
        assert 'plans' in res.data
        assert 'tasks' in res.data
        assert 'defects' in res.data
        assert 'test_cases' in res.data

    def test_project_detail_with_data(self, admin_client, project):
        """带真实数据的项目详情统计"""
        # 创建一些数据
        admin_client.post('/api/v1/plans/', {
            'name': '计划1', 'type': 'detail', 'project': project.id,
        }, format='json')

        res = admin_client.get(f'/api/v1/statistics/project_detail/?project={project.id}')
        assert res.status_code == 200
        assert res.data['plans']['total'] >= 1

    def test_bug_trend(self, auth_client):
        res = auth_client.get('/api/v1/statistics/bug_trend/')
        assert res.status_code == 200
        assert 'by_status' in res.data
        assert 'by_severity' in res.data

    def test_bug_trend_with_project(self, auth_client, project):
        res = auth_client.get(f'/api/v1/statistics/bug_trend/?project={project.id}')
        assert res.status_code == 200

    def test_timesheet_summary(self, auth_client):
        res = auth_client.get('/api/v1/statistics/timesheet_summary/')
        assert res.status_code == 200
        assert 'total_hours' in res.data
