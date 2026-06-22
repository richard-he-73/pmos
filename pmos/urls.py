from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse, HttpResponse
from django.contrib.admin.views.decorators import staff_member_required
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


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


from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import api_view, permission_classes

@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAdminUser])
def backup_view(request):
    """导出系统数据备份"""
    import json
    from django.core import serializers
    from django.apps import apps

    excluded_apps = {'admin', 'auth', 'contenttypes', 'sessions', 'authtoken', 'socialaccount'}
    data = {}
    for app_config in apps.get_app_configs():
        if app_config.label in excluded_apps:
            continue
        for model in app_config.get_models():
            try:
                qs = model.objects.all()
                if qs.exists():
                    key = f'{app_config.label}.{model.__name__}'
                    data[key] = json.loads(serializers.serialize('json', qs))
            except Exception:
                pass

    response = HttpResponse(
        json.dumps(data, ensure_ascii=False, indent=2, default=str),
        content_type='application/json; charset=utf-8',
    )
    response['Content-Disposition'] = 'attachment; filename="pmos_backup.json"'
    return response
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
    path('api/v1/system/backup/', backup_view, name='system-backup'),
]
