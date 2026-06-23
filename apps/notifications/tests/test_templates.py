import pytest
from django.contrib.auth import get_user_model
from apps.notifications.models import Notification, NotificationTemplate
from apps.notifications.services import (
    _render_template, _get_template, _build_title, _build_content,
    notify_user,
)
from apps.projects.models import Project
from apps.plans.models import Task, Plan

User = get_user_model()


@pytest.fixture
def project(admin_user):
    return Project.objects.create(
        code='TMPL001', name='模板测试项目',
        description='用于测试通知模板',
        owner=admin_user, project_type='monthly',
    )


@pytest.fixture
def task_template(project):
    return NotificationTemplate.objects.create(
        code='task_assigned',
        title_template='新任务: {{task_name}}',
        content_template='您被分配了任务 {{task_name}}，截止日期 {{due_date}}，优先级 {{priority}}',
        description='任务分配通知模板',
    )


@pytest.fixture
def bug_template():
    return NotificationTemplate.objects.create(
        code='bug_assigned',
        title_template='缺陷指派: {{bug_title}} ({{severity}})',
        content_template='缺陷 {{bug_title}} 已指派给您，严重程度: {{severity}}，模块: {{module}}',
        description='缺陷指派通知模板',
    )


@pytest.mark.django_db
class TestTemplateRendering:
    """模板渲染引擎测试"""

    def test_render_simple_vars(self, project):
        """渲染基本变量"""
        result = _render_template('项目: {{name}} ({{code}})', project)
        assert result == '项目: 模板测试项目 (TMPL001)'

    def test_render_unknown_var(self, project):
        """未知变量渲染为空字符串"""
        result = _render_template('{{name}} - {{unknown_var}}', project)
        assert result == '模板测试项目 - '

    def test_render_empty_template(self, project):
        """空模板返回空字符串"""
        assert _render_template('', project) == ''
        assert _render_template(None, project) == ''

    def test_render_status_display(self, project):
        """状态变量渲染为中文显示值"""
        result = _render_template('状态: {{status}}', project)
        assert result == '状态: 计划中'

    def test_render_task_vars(self, admin_user, project):
        """任务变量渲染"""
        plan = Plan.objects.create(name='测试计划', type='detail', project=project)
        task = Task.objects.create(
            name='编写登录模块', plan=plan,
            assignee_name='张三',
            due_date='2026-07-15',
            priority='high',
        )
        result = _render_template('{{task_name}}, 负责人 {{assignee}}, 截止 {{due_date}}, 优先级 {{priority}}', task)
        assert '编写登录模块' in result
        assert '张三' in result
        assert '2026-07-15' in result
        assert '高' in result

    def test_render_bug_vars(self, admin_user):
        """缺陷变量渲染"""
        from apps.testing.models import Bug
        bug = Bug.objects.create(
            title='登录页崩溃', severity='critical',
            source='功能测试', module='登录模块',
            reporter=admin_user,
        )
        result = _render_template('{{bug_title}} [{{severity}}] @{{module}}', bug)
        assert '登录页崩溃' in result
        assert '致命' in result  # severity display
        assert '登录模块' in result

    def test_render_project_with_template_obj(self, admin_user):
        """没有模板时回退到空替换"""
        from apps.testing.models import Bug
        bug = Bug.objects.create(
            title='测试缺陷', severity='minor',
            source='回归', module='首页', reporter=admin_user,
        )
        result = _render_template('Bug: {{bug_title}}', bug)
        assert '测试缺陷' in result


@pytest.mark.django_db
class TestTemplateIntegration:
    """模板与通知服务集成测试"""

    def test_build_title_uses_template(self, admin_user, project, task_template):
        """_build_title 使用模板生成标题"""
        plan = Plan.objects.create(name='计划', type='detail', project=project)
        task = Task.objects.create(name='测试任务', plan=plan)
        title = _build_title('task_assigned', task)
        assert title == '新任务: 测试任务'

    def test_build_content_uses_template(self, admin_user, project, task_template):
        """_build_content 使用模板生成内容"""
        plan = Plan.objects.create(name='计划', type='detail', project=project)
        task = Task.objects.create(
            name='测试任务', plan=plan,
            due_date='2026-07-15',
        )
        content = _build_content('task_assigned', task)
        assert '截止日期' in content
        assert '2026-07-15' in content

    def test_build_title_fallback_without_template(self, admin_user, project):
        """无模板时回退到硬编码"""
        title = _build_title('project_created', project)
        assert '项目创建' in title
        assert '模板测试项目' in title

    def test_build_content_fallback_without_template(self, admin_user, project):
        """无模板时回退到描述"""
        content = _build_content('project_created', project)
        assert '用于测试通知模板' in content

    def test_notify_user_with_template(self, normal_user, admin_user, project, task_template):
        """完整链路：通知触发 → 模板渲染 → 入库"""
        plan = Plan.objects.create(name='计划X', type='detail', project=project)
        task = Task.objects.create(
            name='完整链路测试', plan=plan,
            assignee_name='普通用户',
        )
        notify_user(normal_user.id, 'task_assigned', task)
        n = Notification.objects.first()
        assert n is not None
        assert '新任务' in n.title
        assert '完整链路测试' in n.title

    def test_bug_template_renders_correctly(self, admin_user, bug_template):
        """缺陷模板完整测试"""
        from apps.testing.models import Bug
        bug = Bug.objects.create(
            title='API超时', severity='major',
            source='压力测试', module='用户服务',
            reporter=admin_user,
        )
        title = _build_title('bug_assigned', bug)
        content = _build_content('bug_assigned', bug)
        assert 'API超时' in title
        assert '严重' in title  # major → 严重
        assert 'API超时' in content
        assert '用户服务' in content

    def test_partial_template_fallback(self, admin_user, project, task_template):
        """模板中部分字段缺失时仍正常渲染"""
        plan = Plan.objects.create(name='计划Y', type='detail', project=project)
        # 不设置 due_date
        task = Task.objects.create(name='部分字段任务', plan=plan)
        content = _build_content('task_assigned', task)
        # due_date 缺失，应该是空字符串
        assert '截止日期' in content
        assert '优先级' in content
