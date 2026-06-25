from django.contrib import admin
from .models import TestEnvironment, TestCase, TestPlan, TestExecution, TestDefect


@admin.register(TestEnvironment)
class TestEnvironmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'status', 'project', 'created_at']
    list_filter = ['status']
    search_fields = ['name', 'description']


@admin.register(TestCase)
class TestCaseAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'priority', 'status', 'module', 'project']
    list_filter = ['type', 'priority', 'status']
    search_fields = ['name', 'module']


@admin.register(TestPlan)
class TestPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'assignee', 'start_date', 'end_date', 'project']
    search_fields = ['name', 'goal']
    filter_horizontal = ['test_cases', 'stakeholders']


@admin.register(TestExecution)
class TestExecutionAdmin(admin.ModelAdmin):
    list_display = ['test_plan', 'test_case', 'executor', 'result', 'execution_date']
    list_filter = ['result']


@admin.register(TestDefect)
class TestDefectAdmin(admin.ModelAdmin):
    list_display = ['name', 'severity', 'priority', 'status', 'assignee', 'project']
    list_filter = ['severity', 'priority', 'status']
    search_fields = ['name', 'description']
