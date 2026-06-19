from django.contrib import admin
from .models import Project, ProjectMember


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'project_type', 'status', 'owner',
                    'start_date', 'end_date', 'contract_price',
                    'budget_price', 'contract_status']
    list_filter = ['status', 'project_type', 'contract_status']
    search_fields = ['name', 'code']


@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    list_display = ['user', 'project', 'role', 'is_active']
    list_filter = ['is_active']
