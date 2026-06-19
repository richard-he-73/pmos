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
class TestBusinessRequirement:
    def test_create(self, admin_user, demo_project):
        from apps.requirements.models import BusinessRequirement
        pass
        
    def test_str(self, admin_user, demo_project):
        from apps.requirements.models import BusinessRequirement
        pass

@pytest.mark.django_db
class TestSoftwareRequirement:
    def test_create(self, admin_user, demo_project):
        from apps.requirements.models import SoftwareRequirement
        pass
        
    def test_str(self, admin_user, demo_project):
        from apps.requirements.models import SoftwareRequirement
        pass
