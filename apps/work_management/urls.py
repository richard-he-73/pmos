from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'equipments', views.EquipmentViewSet)
router.register(r'leaves', views.LeaveViewSet)
router.register(r'timesheets', views.TimesheetViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
