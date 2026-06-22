from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'comm-types', views.CommTypeViewSet)
router.register(r'comm-records', views.CommRecordViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('upload/', views.upload_file, name='upload-file'),
]
