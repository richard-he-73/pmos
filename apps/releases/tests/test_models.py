import pytest
from django.contrib.auth import get_user_model
from apps.projects.models import Project

User = get_user_model()

pytestmark = pytest.mark.django_db


class TestReleaseDrill:
    def test_create(self):
        user = User.objects.create_user('drilluser', password='test123')
        Project.objects.create(name='测试项目', code='T001', owner=user)
        from apps.releases.models import ReleaseDrill
        drill = ReleaseDrill.objects.create(
            name='演练测试',
            description='演练描述',
            target_environment='test',
            scenario='normal_deploy',
            assignee=user,
        )
        assert drill.name == '演练测试'
        assert drill.conclusion == 'pending'
        assert str(drill) == '演练测试'

    def test_stakeholders(self):
        user = User.objects.create_user('stakeholder_user', password='test123')
        user2 = User.objects.create_user('stakeholder2', password='test123')
        from apps.releases.models import ReleaseDrill
        drill = ReleaseDrill.objects.create(name='含干系人演练')
        drill.stakeholders.add(user, user2)
        assert drill.stakeholders.count() == 2

    def test_ordering(self):
        from apps.releases.models import ReleaseDrill
        ReleaseDrill.objects.create(name='演练A')
        ReleaseDrill.objects.create(name='演练B')
        drills = ReleaseDrill.objects.all()
        assert drills[0].created_at >= drills[1].created_at


class TestReleasePlan:
    def test_create(self):
        user = User.objects.create_user('planuser', password='test123')
        Project.objects.create(name='测试项目', code='P001', owner=user)
        from apps.releases.models import ReleasePlan
        plan = ReleasePlan.objects.create(
            name='计划测试',
            release_type='regular',
            target_environment='production',
            assignee=user,
        )
        assert plan.name == '计划测试'
        assert str(plan) == '计划测试'

    def test_content_and_notes(self):
        from apps.releases.models import ReleasePlan
        plan = ReleasePlan.objects.create(
            name='版本发布',
            content='上线内容：新功能模块',
            notes='测试备注',
        )
        assert plan.content == '上线内容：新功能模块'
        assert plan.notes == '测试备注'

    def test_stakeholders(self):
        from apps.releases.models import ReleasePlan
        from django.contrib.auth import get_user_model
        u = get_user_model().objects.create_user('stake', password='test123')
        plan = ReleasePlan.objects.create(name='干系人测试')
        plan.stakeholders.add(u)
        assert plan.stakeholders.count() == 1
