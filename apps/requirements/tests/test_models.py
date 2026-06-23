import pytest
from django.contrib.auth import get_user_model
from apps.requirements.models import Requirement
from apps.projects.models import Project

User = get_user_model()


@pytest.fixture
def project(admin_user):
    return Project.objects.create(code='REQT', name='需求测试', owner=admin_user, project_type='monthly')


@pytest.mark.django_db
class TestRequirement:
    def test_create(self, admin_user, project):
        req = Requirement.objects.create(
            name='测试需求', type='business', project=project,
            submitter=admin_user,
        )
        assert req.name == '测试需求'
        assert req.status == 'submitted'
        assert str(req) == '[业务需求] 测试需求'

    def test_status_workflow(self, admin_user, project):
        req = Requirement.objects.create(
            name='审批流需求', type='software_func', project=project,
        )
        assert req.status == 'submitted'
        req.status = 'pending_review'
        req.save()
        assert req.status == 'pending_review'
        req.status = 'review_passed'
        req.save()
        assert req.status == 'review_passed'

    def test_created_at_auto(self, admin_user, project):
        req = Requirement.objects.create(
            name='时间测试', type='other', project=project,
        )
        assert req.created_at is not None
        assert req.updated_at is not None
