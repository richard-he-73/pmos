from django.contrib import admin
from .models import Department, UserOrganization


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'manager', 'is_active', 'sort_order']
    list_filter = ['is_active']


@admin.register(UserOrganization)
class UserOrganizationAdmin(admin.ModelAdmin):
    list_display = ['user', 'department', 'position', 'is_leader']
    list_filter = ['department']
