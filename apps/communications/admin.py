from django.contrib import admin
from .models import CommType, CommRecord


@admin.register(CommType)
class CommTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'sort_order']


@admin.register(CommRecord)
class CommRecordAdmin(admin.ModelAdmin):
    list_display = ['subject', 'comm_type', 'project', 'initiator', 'comm_date']
    list_filter = ['comm_type', 'comm_date']
    search_fields = ['subject']
