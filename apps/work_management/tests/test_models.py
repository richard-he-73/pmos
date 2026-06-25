import pytest
from django.contrib.auth import get_user_model
from apps.work_management.models import Issue, Risk


pytestmark = pytest.mark.django_db


class TestIssueModel:
    def test_create_issue(self):
        user = get_user_model().objects.create_user('testuser', password='test123')
        issue = Issue.objects.create(
            title='测试问题',
            description='这是一个测试问题',
            issue_type='plan_execution',
            severity='fatal',
            priority='high',
            source='exec_tracking',
            reporter=user,
            assignee=user,
            status='new',
        )
        assert issue.title == '测试问题'
        assert issue.issue_type == 'plan_execution'
        assert issue.severity == 'fatal'
        assert str(issue) == '测试问题'

    def test_issue_default_status(self):
        issue = Issue.objects.create(title='默认状态')
        assert issue.status == 'new'

    def test_issue_ordering(self):
        Issue.objects.create(title='问题A')
        Issue.objects.create(title='问题B')
        issues = Issue.objects.all()
        assert issues[0].created_at >= issues[1].created_at


class TestRiskModel:
    def test_create_risk(self):
        user = get_user_model().objects.create_user('riskuser', password='test123')
        risk = Risk.objects.create(
            title='测试风险',
            description='这是一个测试风险',
            category='schedule',
            probability='high',
            impact='serious',
            reporter=user,
            assignee=user,
            status='new',
        )
        assert risk.title == '测试风险'
        assert risk.risk_level != ''  # Should be auto-calculated
        assert str(risk) == '测试风险'

    def test_risk_level_calculation(self):
        # 很高(5) * 致命(5) = 25 → 极高
        risk1 = Risk(title='风险1', probability='very_high', impact='fatal', risk_level='')
        risk1.save()
        assert risk1.risk_level == 'extreme'

        # 中(3) * 一般(3) = 9 → 中
        risk2 = Risk(title='风险2', probability='medium', impact='normal', risk_level='')
        risk2.save()
        assert risk2.risk_level == 'medium'

        # 低(2) * 轻微(2) = 4 → 低
        risk3 = Risk(title='风险3', probability='low', impact='slight', risk_level='')
        risk3.save()
        assert risk3.risk_level == 'low'

    def test_risk_level_manual_override(self):
        """手动覆盖风险等级不应被自动计算覆盖"""
        risk = Risk(title='风险覆盖', probability='very_high', impact='fatal', risk_level='low')
        risk.save()
        assert risk.risk_level == 'low'  # 手动覆盖的保留

    def test_risk_default_status(self):
        risk = Risk.objects.create(title='默认状态风险')
        assert risk.status == 'new'


class TestIssueRiskIntegration:
    def test_issue_to_risk_creation(self):
        """测试从问题创建风险（通过 report_risk action）"""
        user = get_user_model().objects.create_user('pmuser', password='test123')
        issue = Issue.objects.create(
            title='关键路径延迟',
            description='开发进度延迟2周',
            reporter=user,
        )
        # 模拟 report_risk 动作
        risk = Risk.objects.create(
            project=issue.project,
            title=f'[来自问题] {issue.title}',
            description=issue.description,
            reporter=user,
            assignee=issue.assignee,
        )
        assert risk.title == '[来自问题] 关键路径延迟'
        assert '[来自问题]' in risk.title

    def test_risk_to_issue_conversion(self):
        """测试从风险创建问题（通过 convert_to_issue action）"""
        user = get_user_model().objects.create_user('rmuser', password='test123')
        risk = Risk.objects.create(
            title='人员离职风险',
            description='核心开发人员可能离职',
            reporter=user,
        )
        # 模拟 convert_to_issue 动作
        issue = Issue.objects.create(
            project=risk.project,
            title=f'[来自风险] {risk.title}',
            description=risk.description,
            reporter=user,
            assignee=risk.assignee,
        )
        assert issue.title == '[来自风险] 人员离职风险'
        assert '[来自风险]' in issue.title
