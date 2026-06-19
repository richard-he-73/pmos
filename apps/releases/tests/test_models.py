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
class TestReleaseDrill:
    def test_create(self, admin_user, demo_project):
        from apps.releases.models import ReleaseDrill
        pass
        
    def test_str(self, admin_user, demo_project):
        from apps.releases.models import ReleaseDrill
        pass

@pytest.mark.django_db
class TestReleaseDeployment:
    def test_create(self, admin_user, demo_project):
        from apps.releases.models import ReleaseDeployment
        pass
        
    def test_str(self, admin_user, demo_project):
        from apps.releases.models import ReleaseDeployment
        pass

@pytest.mark.django_db
class TestReleaseStep:
    def test_create(self, admin_user, demo_project):
        from apps.releases.models import ReleaseStep
        pass
        
    def test_str(self, admin_user, demo_project):
        from apps.releases.models import ReleaseStep
        pass
