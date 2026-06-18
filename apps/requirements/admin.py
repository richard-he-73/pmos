from django.contrib import admin
from .models import BusinessRequirement, SoftwareRequirement


@admin.register(BusinessRequirement)
class BusinessRequirementAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'project', 'status', 'priority', 'submitter']
    list_filter = ['status', 'priority']
    search_fields = ['code', 'name']


@admin.register(SoftwareRequirement)
class SoftwareRequirementAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'business_requirement', 'module', 'status']
    list_filter = ['status', 'module']
    search_fields = ['code', 'name']
