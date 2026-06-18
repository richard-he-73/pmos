from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
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
]
