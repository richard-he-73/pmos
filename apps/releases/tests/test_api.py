import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.releases.models import ReleaseDrill, ReleasePlan


pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client():
    user = get_user_model().objects.create_user('apiuser', password='test123')
    client = APIClient()
    client.force_authenticate(user=user)
    return client


class TestReleaseDrillAPI:
    URL = '/api/v1/release-drills/'

    def test_list(self, api_client):
        ReleaseDrill.objects.create(name='演练A')
        ReleaseDrill.objects.create(name='演练B')
        res = api_client.get(self.URL)
        assert res.status_code == 200
        assert len(res.data['results']) == 2

    def test_create(self, api_client):
        payload = {
            'name': '故障演练',
            'scenario': 'service_down',
            'target_environment': 'pre_prod',
            'steps': '1. 停止服务\n2. 验证告警',
            'prerequisites': '已完成备份',
        }
        res = api_client.post(self.URL, payload, format='json')
        assert res.status_code == 201
        assert res.data['name'] == '故障演练'
        assert res.data['conclusion'] == 'pending'

    def test_create_requires_name(self, api_client):
        res = api_client.post(self.URL, {}, format='json')
        assert res.status_code == 400

    def test_get_detail(self, api_client):
        drill = ReleaseDrill.objects.create(name='详情演练')
        res = api_client.get(f'{self.URL}{drill.id}/')
        assert res.status_code == 200
        assert res.data['name'] == '详情演练'

    def test_update(self, api_client):
        drill = ReleaseDrill.objects.create(name='旧名称')
        res = api_client.patch(f'{self.URL}{drill.id}/', {'name': '新名称'}, format='json')
        assert res.status_code == 200
        assert res.data['name'] == '新名称'

    def test_delete(self, api_client):
        drill = ReleaseDrill.objects.create(name='待删除')
        res = api_client.delete(f'{self.URL}{drill.id}/')
        assert res.status_code == 204
        assert ReleaseDrill.objects.count() == 0

    def test_filter_by_scenario(self, api_client):
        ReleaseDrill.objects.create(name='正常部署演练', scenario='normal_deploy')
        ReleaseDrill.objects.create(name='回滚演练', scenario='rollback')
        res = api_client.get(self.URL, {'scenario': 'rollback'})
        assert res.status_code == 200
        assert len(res.data['results']) == 1

    def test_stakeholder_assignment(self, api_client):
        user = get_user_model().objects.get(username='apiuser')
        res = api_client.post(self.URL, {
            'name': '带干系人演练',
            'assignee': user.id,
            'stakeholder_ids': [user.id],
        }, format='json')
        assert res.status_code == 201
        assert res.data['assignee_name'] == 'apiuser'


class TestReleasePlanAPI:
    URL = '/api/v1/release-plans/'

    def test_list(self, api_client):
        ReleasePlan.objects.create(name='计划A')
        ReleasePlan.objects.create(name='计划B')
        res = api_client.get(self.URL)
        assert res.status_code == 200
        assert len(res.data['results']) == 2

    def test_create(self, api_client):
        payload = {
            'name': 'v3.0发布',
            'release_type': 'regular',
            'target_environment': 'production',
            'content': '用户模块升级',
        }
        res = api_client.post(self.URL, payload, format='json')
        assert res.status_code == 201
        assert res.data['release_type'] == 'regular'

    def test_create_requires_name(self, api_client):
        res = api_client.post(self.URL, {}, format='json')
        assert res.status_code == 400

    def test_get_detail(self, api_client):
        plan = ReleasePlan.objects.create(name='计划详情')
        res = api_client.get(f'{self.URL}{plan.id}/')
        assert res.status_code == 200

    def test_update(self, api_client):
        plan = ReleasePlan.objects.create(name='旧计划')
        res = api_client.patch(f'{self.URL}{plan.id}/', {'name': '新计划'}, format='json')
        assert res.status_code == 200
        assert res.data['name'] == '新计划'

    def test_delete(self, api_client):
        plan = ReleasePlan.objects.create(name='待删除')
        res = api_client.delete(f'{self.URL}{plan.id}/')
        assert res.status_code == 204
        assert ReleasePlan.objects.count() == 0

    def test_filter_by_release_type(self, api_client):
        ReleasePlan.objects.create(name='常规发布', release_type='regular')
        ReleasePlan.objects.create(name='紧急修复', release_type='hotfix')
        res = api_client.get(self.URL, {'release_type': 'hotfix'})
        assert res.status_code == 200
        assert len(res.data['results']) == 1

    def test_assignee_and_stakeholders(self, api_client):
        user = get_user_model().objects.get(username='apiuser')
        res = api_client.post(self.URL, {
            'name': '带负责人计划',
            'assignee': user.id,
            'stakeholder_ids': [user.id],
        }, format='json')
        assert res.status_code == 201
        assert res.data['assignee_name'] == 'apiuser'
