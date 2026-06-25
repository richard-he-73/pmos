import pytest
from django.contrib.auth import get_user_model
from apps.projects.models import Project

User = get_user_model()


@pytest.fixture
def admin_user():
    return User.objects.create_superuser(username='admin', password='pass123')


@pytest.fixture
def demo_project(admin_user):
    return Project.objects.create(name='Test Project', code='T001', owner=admin_user)


@pytest.mark.django_db
class TestTestEnvironment:
    def test_create(self, admin_user, demo_project):
        from apps.testing.models import TestEnvironment
        env = TestEnvironment.objects.create(
            name='测试环境-预发布', project=demo_project, created_by=admin_user,
        )
        assert env.name == '测试环境-预发布'

    def test_str(self, admin_user, demo_project):
        from apps.testing.models import TestEnvironment
        env = TestEnvironment.objects.create(
            name='生产环境', project=demo_project, created_by=admin_user,
        )
        assert str(env) == '生产环境'


@pytest.mark.django_db
class TestTestCase:
    def test_create(self, admin_user, demo_project):
        from apps.testing.models import TestCase
        tc = TestCase.objects.create(
            name='登录功能测试', project=demo_project, created_by=admin_user,
        )
        assert tc.name == '登录功能测试'

    def test_str(self, admin_user, demo_project):
        from apps.testing.models import TestCase
        tc = TestCase.objects.create(
            name='注册功能测试', project=demo_project, created_by=admin_user,
        )
        assert str(tc) == '注册功能测试'


@pytest.mark.django_db
class TestTestPlan:
    def test_create(self, admin_user, demo_project):
        from apps.testing.models import TestPlan
        plan = TestPlan.objects.create(
            name='Sprint 1 测试计划', project=demo_project, created_by=admin_user,
        )
        assert plan.name == 'Sprint 1 测试计划'

    def test_str(self, admin_user, demo_project):
        from apps.testing.models import TestPlan
        plan = TestPlan.objects.create(
            name='回归测试计划', project=demo_project, created_by=admin_user,
        )
        assert str(plan) == '回归测试计划'


@pytest.mark.django_db
class TestTestDefect:
    def test_create(self, admin_user, demo_project):
        from apps.testing.models import TestDefect
        bug = TestDefect.objects.create(
            name='登录按钮无响应', project=demo_project, created_by=admin_user,
        )
        assert bug.name == '登录按钮无响应'

    def test_str(self, admin_user, demo_project):
        from apps.testing.models import TestDefect
        bug = TestDefect.objects.create(
            name='页面白屏', severity='fatal', project=demo_project, created_by=admin_user,
        )
        assert '页面白屏' in str(bug)
