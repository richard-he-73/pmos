from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'test-environments', views.TestEnvironmentViewSet)
router.register(r'test-cases', views.TestCaseViewSet)
router.register(r'test-plans', views.TestPlanViewSet)
router.register(r'test-executions', views.TestExecutionViewSet)
router.register(r'test-defects', views.TestDefectViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
