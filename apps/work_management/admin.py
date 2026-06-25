from django.contrib import admin
from .models import Equipment, Leave, Timesheet, Issue, Risk


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'type', 'status', 'borrower', 'borrow_date']
    list_filter = ['status', 'type']
    search_fields = ['name', 'code']


@admin.register(Leave)
class LeaveAdmin(admin.ModelAdmin):
    list_display = ['applicant', 'type', 'start_date', 'end_date', 'duration_days', 'status']
    list_filter = ['type', 'status']
    search_fields = ['applicant__name']


@admin.register(Timesheet)
class TimesheetAdmin(admin.ModelAdmin):
    list_display = ['reporter', 'start_date', 'end_date', 'type', 'approval_status']
    list_filter = ['type', 'approval_status']


@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'issue_type', 'severity', 'priority', 'status', 'assignee', 'created_at']
    list_filter = ['issue_type', 'severity', 'priority', 'status', 'source']
    search_fields = ['title', 'description']


@admin.register(Risk)
class RiskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'category', 'probability', 'impact', 'risk_level', 'status', 'assignee', 'created_at']
    list_filter = ['category', 'probability', 'impact', 'risk_level', 'status']
    search_fields = ['title', 'description']
