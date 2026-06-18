from django.contrib import admin
from .models import ProjectResource, ResourceChangeLog


@admin.register(ProjectResource)
class ProjectResourceAdmin(admin.ModelAdmin):
    list_display = ['user', 'project', 'role_in_project', 'join_date', 'leave_date']
    list_filter = ['project']


@admin.register(ResourceChangeLog)
class ResourceChangeLogAdmin(admin.ModelAdmin):
    list_display = ['resource', 'change_type', 'operator', 'changed_at']
    list_filter = ['change_type']
