from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'release-drills', views.ReleaseDrillViewSet)
router.register(r'release-deployments', views.ReleaseDeploymentViewSet)
router.register(r'release-steps', views.ReleaseStepViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
