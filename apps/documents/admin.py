from django.contrib import admin
from .models import DocumentCategory, Document


@admin.register(DocumentCategory)
class DocumentCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'sort_order']
    list_filter = ['project']


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'project', 'creator', 'status', 'version']
    list_filter = ['status']
    search_fields = ['title']
