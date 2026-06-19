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
class TestDocumentCategory:
    def test_create(self, admin_user, demo_project):
        from apps.documents.models import DocumentCategory
        pass
        
    def test_str(self, admin_user, demo_project):
        from apps.documents.models import DocumentCategory
        pass

@pytest.mark.django_db
class TestDocument:
    def test_create(self, admin_user, demo_project):
        from apps.documents.models import Document
        pass
        
    def test_str(self, admin_user, demo_project):
        from apps.documents.models import Document
        pass
