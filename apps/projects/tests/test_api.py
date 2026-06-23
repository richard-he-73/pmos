import pytest
from apps.projects.models import Project


@pytest.mark.django_db
class TestProjectViewSet:
    """项目管理 API 测试"""

    def test_list_projects(self, auth_client):
        """获取项目列表"""
        res = auth_client.get('/api/v1/projects/')
        assert res.status_code == 200
        assert 'results' in res.data

    def test_create_project(self, auth_client, normal_user):
        """创建项目"""
        res = auth_client.post('/api/v1/projects/', {
            'code': 'P001',
            'name': '测试项目',
            'project_type': 'monthly',
            'owner': normal_user.id,
        }, format='json')
        assert res.status_code == 201
        assert res.data['name'] == '测试项目'
        assert res.data['code'] == 'P001'

    def test_create_project_duplicate_code(self, admin_client):
        """重复项目编号拒绝创建"""
        admin_client.post('/api/v1/projects/', {
            'code': 'P002', 'name': '项目A', 'project_type': 'monthly',
        }, format='json')
        res = admin_client.post('/api/v1/projects/', {
            'code': 'P002', 'name': '项目B', 'project_type': 'fixed',
        }, format='json')
        assert res.status_code == 400

    def test_get_project_detail(self, admin_client):
        """获取项目详情"""
        proj = admin_client.post('/api/v1/projects/', {
            'code': 'P003', 'name': '详情项目', 'project_type': 'monthly',
        }, format='json').data
        res = admin_client.get(f'/api/v1/projects/{proj["id"]}/')
        assert res.status_code == 200
        assert res.data['name'] == '详情项目'

    def test_update_project(self, admin_client):
        """更新项目信息"""
        proj = admin_client.post('/api/v1/projects/', {
            'code': 'P004', 'name': '原名', 'project_type': 'monthly',
        }, format='json').data
        res = admin_client.patch(f'/api/v1/projects/{proj["id"]}/', {'name': '新名称'}, format='json')
        assert res.status_code == 200
        assert res.data['name'] == '新名称'

    def test_delete_project(self, admin_client):
        """删除项目"""
        proj = admin_client.post('/api/v1/projects/', {
            'code': 'P005', 'name': '待删项目', 'project_type': 'monthly',
        }, format='json').data
        res = admin_client.delete(f'/api/v1/projects/{proj["id"]}/')
        assert res.status_code == 204
        assert Project.objects.filter(id=proj['id']).count() == 0
