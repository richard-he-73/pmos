from django.contrib import admin
from .models import Project, ProjectMember


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'status', 'owner', 'start_date', 'end_date']
    list_filter = ['status']
    search_fields = ['name', 'code']


@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    list_display = ['user', 'project', 'role', 'is_active']
    list_filter = ['is_active']
