import pytest
from apps.projects.models import Project


@pytest.fixture
def project(admin_user):
    return Project.objects.create(code='PLANPROJ', name='计划测试项目', owner=admin_user, project_type='monthly')


@pytest.mark.django_db
class TestPlanViewSet:
    """计划管理 API 测试"""

    def test_list_plans(self, auth_client, project):
        res = auth_client.get('/api/v1/plans/')
        assert res.status_code == 200

    def test_create_plan(self, admin_client, project):
        res = admin_client.post('/api/v1/plans/', {
            'name': '里程碑1',
            'type': 'milestone',
            'project': project.id,
        }, format='json')
        assert res.status_code == 201
        assert res.data['name'] == '里程碑1'

    def test_update_plan_status(self, admin_client, project):
        plan = admin_client.post('/api/v1/plans/', {
            'name': '计划A', 'type': 'detail', 'project': project.id,
        }, format='json').data
        res = admin_client.patch(f'/api/v1/plans/{plan["id"]}/', {'status': 'completed_on_time', 'progress': 100}, format='json')
        assert res.status_code == 200
        assert res.data['status'] == 'completed_on_time'

    def test_delete_plan(self, admin_client, project):
        plan = admin_client.post('/api/v1/plans/', {
            'name': '待删计划', 'type': 'detail', 'project': project.id,
        }, format='json').data
        res = admin_client.delete(f'/api/v1/plans/{plan["id"]}/')
        assert res.status_code == 204


@pytest.mark.django_db
class TestTaskViewSet:
    """任务管理 API 测试"""

    def test_create_task(self, admin_client, project):
        plan = admin_client.post('/api/v1/plans/', {
            'name': '计划', 'type': 'detail', 'project': project.id,
        }, format='json').data
        res = admin_client.post('/api/v1/tasks/', {
            'name': '编写代码',
            'plan': plan['id'],
        }, format='json')
        assert res.status_code == 201

    def test_update_task_status(self, admin_client, project):
        plan = admin_client.post('/api/v1/plans/', {
            'name': '计划', 'type': 'detail', 'project': project.id,
        }, format='json').data
        task = admin_client.post('/api/v1/tasks/', {
            'name': '测试', 'plan': plan['id'],
        }, format='json').data
        res = admin_client.patch(f'/api/v1/tasks/{task["id"]}/', {'status': 'in_progress'}, format='json')
        assert res.status_code == 200
