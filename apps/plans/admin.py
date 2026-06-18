from django.contrib import admin
from .models import Plan, Task


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'project', 'status', 'progress', 'start_date', 'end_date']
    list_filter = ['type', 'status']
    search_fields = ['name']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['name', 'plan', 'status', 'priority', 'assignee', 'due_date']
    list_filter = ['status', 'priority']
    search_fields = ['name']
