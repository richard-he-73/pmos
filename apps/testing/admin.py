from django.contrib import admin
from .models import TestPlan, TestCase, TestRun, Bug


@admin.register(TestPlan)
class TestPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'version', 'status', 'assignee']
    list_filter = ['status']


@admin.register(TestCase)
class TestCaseAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'priority', 'module', 'status']
    list_filter = ['type', 'priority', 'status']
    search_fields = ['name']


@admin.register(TestRun)
class TestRunAdmin(admin.ModelAdmin):
    list_display = ['test_case', 'test_plan', 'executor', 'result', 'executed_at']
    list_filter = ['result']


@admin.register(Bug)
class BugAdmin(admin.ModelAdmin):
    list_display = ['title', 'severity', 'status', 'module', 'reporter', 'assignee']
    list_filter = ['severity', 'status']
    search_fields = ['title']
