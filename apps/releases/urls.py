from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'release-drills', views.ReleaseDrillViewSet)
router.register(r'release-plans', views.ReleasePlanViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
