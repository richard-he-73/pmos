from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.system.views import BackupListView, BackupDetailView


def api_root(request):
    """API 根页面"""
    return JsonResponse({
        'name': 'PMOS - Project Management Operating System',
        'version': '0.1.0',
        'description': '企业级项目管理系统',
        'docs': '/admin/',
        'api': '/api/v1/',
        'frontend': 'http://localhost:16001',
    })


urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/v1/auth/login/', TokenObtainPairView.as_view(), name='token_obtain'),
    path('api/v1/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/', include('apps.accounts.urls')),
    path('api/v1/', include('apps.projects.urls')),
    path('api/v1/', include('apps.plans.urls')),
    path('api/v1/', include('apps.requirements.urls')),
    path('api/v1/', include('apps.testing.urls')),
    path('api/v1/', include('apps.resources.urls')),
    path('api/v1/', include('apps.communications.urls')),
    path('api/v1/', include('apps.documents.urls')),
    path('api/v1/', include('apps.work_management.urls')),
    path('api/v1/', include('apps.notifications.urls')),
    path('api/v1/', include('apps.statistics.urls')),
    path('api/v1/', include('apps.organizations.urls')),
    path('api/v1/', include('apps.releases.urls')),
    # 数据备份
    path('api/v1/system/backup/', BackupListView.as_view(), name='backup-list'),
    path('api/v1/system/backup/<path:filename>/', BackupDetailView.as_view(), name='backup-detail'),
]
