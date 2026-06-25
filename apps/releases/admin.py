from django.contrib import admin
from .models import ReleaseDrill, ReleasePlan


@admin.register(ReleaseDrill)
class ReleaseDrillAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'scenario', 'target_environment', 'conclusion', 'assignee', 'created_at']
    list_filter = ['scenario', 'target_environment', 'conclusion']
    search_fields = ['name', 'description']


@admin.register(ReleasePlan)
class ReleasePlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'release_type', 'target_environment', 'assignee', 'created_at']
    list_filter = ['release_type', 'target_environment']
    search_fields = ['name', 'content']
