from django.contrib import admin
from .models import Notification, NotificationTemplate


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['recipient', 'type', 'title', 'is_read', 'created_at']
    list_filter = ['type', 'is_read']


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ['code', 'description']
