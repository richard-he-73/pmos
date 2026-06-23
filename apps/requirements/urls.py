from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'requirements', views.RequirementViewSet, basename='requirements')
router.register(r'req-reviews', views.RequirementReviewViewSet, basename='req-reviews')
router.register(r'req-baselines', views.RequirementBaselineViewSet, basename='req-baselines')
router.register(r'req-changes', views.RequirementChangeViewSet, basename='req-changes')

urlpatterns = [
    path('', include(router.urls)),
]
