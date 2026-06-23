import pytest
from apps.projects.models import Project


@pytest.fixture
def project(admin_user):
    return Project.objects.create(code='RELPROJ', name='投产测试项目', owner=admin_user, project_type='fixed')


@pytest.mark.django_db
class TestReleaseDrillViewSet:
    """投产演练 API 测试"""

    def test_create(self, admin_client, project):
        res = admin_client.post('/api/v1/release-drills/', {
            'name': '演练一', 'project': project.id,
            'planned_date': '2026-07-01T10:00:00Z',
        }, format='json')
        assert res.status_code == 201

    def test_list(self, auth_client, project):
        res = auth_client.get('/api/v1/release-drills/')
        assert res.status_code == 200


@pytest.mark.django_db
class TestReleaseDeploymentViewSet:
    """投产指挥 API 测试"""

    def test_create(self, admin_client, project):
        res = admin_client.post('/api/v1/release-deployments/', {
            'name': '投产v2.0', 'project': project.id,
            'planned_date': '2026-07-15T22:00:00Z',
            'version': 'v2.0',
        }, format='json')
        assert res.status_code == 201
