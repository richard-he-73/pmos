from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'test-plans', views.TestPlanViewSet)
router.register(r'test-cases', views.TestCaseViewSet)
router.register(r'test-runs', views.TestRunViewSet)
router.register(r'bugs', views.BugViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
