import pytest
from apps.projects.models import Project


@pytest.fixture
def project(admin_user):
    return Project.objects.create(code='ORGTEST', name='组织测试项目', owner=admin_user, project_type='monthly')


@pytest.mark.django_db
class TestDepartmentViewSet:
    """部门管理 API 测试"""

    def test_list_departments(self, auth_client):
        res = auth_client.get('/api/v1/departments/')
        assert res.status_code == 200
        assert 'results' in res.data

    def test_create_department(self, admin_client, project):
        res = admin_client.post('/api/v1/departments/', {
            'name': '技术部', 'project': project.id, 'is_active': True,
        }, format='json')
        assert res.status_code == 201
        assert res.data['name'] == '技术部'

    def test_create_with_parent(self, admin_client, project):
        parent = admin_client.post('/api/v1/departments/', {
            'name': '总公司', 'project': project.id,
        }, format='json').data
        child = admin_client.post('/api/v1/departments/', {
            'name': '子公司', 'parent': parent['id'], 'project': project.id,
        }, format='json').data
        assert child['parent'] == parent['id']

    def test_update_department(self, admin_client, project):
        dept = admin_client.post('/api/v1/departments/', {
            'name': '旧名', 'project': project.id,
        }, format='json').data
        res = admin_client.patch(f'/api/v1/departments/{dept["id"]}/', {'name': '新名'}, format='json')
        assert res.status_code == 200
        assert res.data['name'] == '新名'

    def test_delete_department(self, admin_client, project):
        dept = admin_client.post('/api/v1/departments/', {
            'name': '待删部门', 'project': project.id,
        }, format='json').data
        res = admin_client.delete(f'/api/v1/departments/{dept["id"]}/')
        assert res.status_code == 204

    def test_toggle_active(self, admin_client, project):
        dept = admin_client.post('/api/v1/departments/', {
            'name': '可切换部门', 'project': project.id, 'is_active': True,
        }, format='json').data
        res = admin_client.patch(f'/api/v1/departments/{dept["id"]}/', {'is_active': False}, format='json')
        assert res.status_code == 200
        assert res.data['is_active'] is False


@pytest.mark.django_db
class TestUserOrganizationViewSet:
    """组织成员 API 测试"""

    def test_list_members(self, auth_client, project):
        res = auth_client.get('/api/v1/org-members/')
        assert res.status_code == 200

    def test_create_member(self, admin_client, project):
        dept = admin_client.post('/api/v1/departments/', {
            'name': '咨询部', 'project': project.id,
        }, format='json').data
        res = admin_client.post('/api/v1/org-members/', {
            'name': '张三', 'department': dept['id'], 'project': project.id,
            'project_role': 'consulting_advisor',
        }, format='json')
        assert res.status_code == 201
        assert res.data['name'] == '张三'
        assert res.data['department'] == dept['id']

    def test_filter_by_project(self, admin_client, project):
        dept = admin_client.post('/api/v1/departments/', {
            'name': '部门', 'project': project.id,
        }, format='json').data
        admin_client.post('/api/v1/org-members/', {
            'name': '成员A', 'department': dept['id'], 'project': project.id,
        }, format='json')
        res = admin_client.get(f'/api/v1/org-members/?project={project.id}')
        assert res.status_code == 200
        assert len(res.data.get('results', [])) >= 1
