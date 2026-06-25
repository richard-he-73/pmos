import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.work_management.models import Issue, Risk
from apps.projects.models import Project


pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client():
    user = get_user_model().objects.create_user('apiuser', password='test123')
    client = APIClient()
    client.force_authenticate(user=user)
    return client


class TestIssueAPI:
    ISSUE_URL = '/api/v1/issues/'

    def test_list_issues(self, api_client):
        Issue.objects.create(title='问题1')
        Issue.objects.create(title='问题2')
        res = api_client.get(self.ISSUE_URL)
        assert res.status_code == 200
        assert len(res.data['results']) == 2

    def test_create_issue(self, api_client):
        payload = {
            'title': '新问题',
            'description': '描述内容',
            'issue_type': 'resource',
            'severity': 'serious',
            'priority': 'high',
            'source': 'user_feedback',
            'status': 'new',
        }
        res = api_client.post(self.ISSUE_URL, payload, format='json')
        assert res.status_code == 201
        assert res.data['title'] == '新问题'
        assert Issue.objects.count() == 1

    def test_create_issue_requires_title(self, api_client):
        res = api_client.post(self.ISSUE_URL, {'description': '无标题'}, format='json')
        assert res.status_code == 400

    def test_get_issue_detail(self, api_client):
        issue = Issue.objects.create(title='详情测试')
        res = api_client.get(f'{self.ISSUE_URL}{issue.id}/')
        assert res.status_code == 200
        assert res.data['title'] == '详情测试'

    def test_update_issue(self, api_client):
        issue = Issue.objects.create(title='更新前')
        res = api_client.patch(f'{self.ISSUE_URL}{issue.id}/', {'title': '更新后'}, format='json')
        assert res.status_code == 200
        assert res.data['title'] == '更新后'

    def test_delete_issue(self, api_client):
        issue = Issue.objects.create(title='待删除')
        res = api_client.delete(f'{self.ISSUE_URL}{issue.id}/')
        assert res.status_code == 204
        assert Issue.objects.count() == 0

    def test_filter_issues_by_project(self, api_client):
        project = Project.objects.create(name='测试项目', code='TP001')
        Issue.objects.create(title='项目内问题', project=project)
        Issue.objects.create(title='无项目问题')
        res = api_client.get(self.ISSUE_URL, {'project': project.id})
        assert res.status_code == 200
        assert len(res.data['results']) == 1

    def test_filter_issues_by_status(self, api_client):
        Issue.objects.create(title='新建问题', status='new')
        Issue.objects.create(title='已关闭问题', status='closed')
        res = api_client.get(self.ISSUE_URL, {'status': 'closed'})
        assert res.status_code == 200
        assert len(res.data['results']) == 1
        assert res.data['results'][0]['status'] == 'closed'

    def test_report_risk_action(self, api_client):
        issue = Issue.objects.create(title='问题转风险')
        res = api_client.post(f'{self.ISSUE_URL}{issue.id}/report_risk/')
        assert res.status_code == 201
        assert Risk.objects.count() == 1
        assert '[来自问题]' in Risk.objects.first().title

    def test_issue_serializer_shows_names(self, api_client):
        user = get_user_model().objects.get(username='apiuser')
        issue = Issue.objects.create(title='含名称测试', reporter=user, assignee=user)
        res = api_client.get(f'{self.ISSUE_URL}{issue.id}/')
        assert res.data['reporter_name'] == 'apiuser'
        assert res.data['assignee_name'] == 'apiuser'


class TestRiskAPI:
    RISK_URL = '/api/v1/risks/'

    def test_list_risks(self, api_client):
        Risk.objects.create(title='风险1')
        Risk.objects.create(title='风险2')
        res = api_client.get(self.RISK_URL)
        assert res.status_code == 200
        assert len(res.data['results']) == 2

    def test_create_risk(self, api_client):
        payload = {
            'title': '进度风险',
            'category': 'schedule',
            'probability': 'high',
            'impact': 'serious',
            'status': 'new',
        }
        res = api_client.post(self.RISK_URL, payload, format='json')
        assert res.status_code == 201
        assert res.data['risk_level'] in ['extreme', 'high', 'medium', 'low']

    def test_convert_to_issue_action(self, api_client):
        risk = Risk.objects.create(title='风险转问题')
        res = api_client.post(f'{self.RISK_URL}{risk.id}/convert_to_issue/')
        assert res.status_code == 201
        assert Issue.objects.count() == 1
        assert '[来自风险]' in Issue.objects.first().title

    def test_recalculate_risk_level(self, api_client):
        risk = Risk.objects.create(title='重新计算等级', probability='medium', impact='normal')
        original_level = risk.risk_level
        risk.risk_level = 'low'
        risk.save(update_fields=['risk_level'])
        res = api_client.post(f'{self.RISK_URL}{risk.id}/recalculate_risk_level/')
        assert res.status_code == 200
        assert res.data['risk_level'] == original_level

    def test_filter_risks_by_category(self, api_client):
        Risk.objects.create(title='进度风险', category='schedule')
        Risk.objects.create(title='技术风险', category='technology')
        res = api_client.get(self.RISK_URL, {'category': 'technology'})
        assert res.status_code == 200
        assert len(res.data['results']) == 1

    def test_filter_risks_by_risk_level(self, api_client):
        Risk.objects.create(title='极高风险', probability='very_high', impact='fatal')
        Risk.objects.create(title='低风险', probability='low', impact='slight')
        res = api_client.get(self.RISK_URL, {'risk_level': 'low'})
        assert res.status_code == 200
        assert len(res.data['results']) == 1

    def test_update_risk_status(self, api_client):
        risk = Risk.objects.create(title='状态更新')
        res = api_client.patch(f'{self.RISK_URL}{risk.id}/', {'status': 'monitoring'}, format='json')
        assert res.status_code == 200
        assert res.data['status'] == 'monitoring'
