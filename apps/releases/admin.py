from django.contrib import admin
from .models import ReleaseDrill, ReleaseDeployment, ReleaseStep


@admin.register(ReleaseDrill)
class ReleaseDrillAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'planned_date', 'status']
    list_filter = ['status']


@admin.register(ReleaseDeployment)
class ReleaseDeploymentAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'version', 'planned_date', 'status', 'commander']
    list_filter = ['status']


@admin.register(ReleaseStep)
class ReleaseStepAdmin(admin.ModelAdmin):
    list_display = ['name', 'deployment', 'order', 'status', 'executor']
    list_filter = ['status']
