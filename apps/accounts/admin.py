from django.contrib import admin
from .models import User, Role


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'real_name', 'department', 'position', 'is_active']
    search_fields = ['username', 'real_name', 'email']
    list_filter = ['department', 'is_active']


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'is_system']
    filter_horizontal = ['permissions']
