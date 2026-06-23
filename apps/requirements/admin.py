from django.contrib import admin
from .models import Requirement, RequirementReview, RequirementBaseline, RequirementChange


@admin.register(Requirement)
class RequirementAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'status', 'project', 'assignee', 'submitter', 'created_at']
    list_filter = ['type', 'status', 'project']
    search_fields = ['name', 'description']


@admin.register(RequirementReview)
class RequirementReviewAdmin(admin.ModelAdmin):
    list_display = ['requirement', 'reviewer', 'review_method', 'conclusion', 'review_date']
    list_filter = ['review_method', 'conclusion']


@admin.register(RequirementBaseline)
class RequirementBaselineAdmin(admin.ModelAdmin):
    list_display = ['name', 'version', 'type', 'project', 'created_at']
    list_filter = ['type', 'project']


@admin.register(RequirementChange)
class RequirementChangeAdmin(admin.ModelAdmin):
    list_display = ['baseline', 'object_desc', 'approval_status', 'assignee', 'created_at']
    list_filter = ['approval_status']
