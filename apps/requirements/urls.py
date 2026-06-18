from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'business-requirements', views.BusinessRequirementViewSet)
router.register(r'software-requirements', views.SoftwareRequirementViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
