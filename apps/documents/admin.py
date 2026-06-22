from django.contrib import admin
from .models import DocumentCategory, Document


@admin.register(DocumentCategory)
class DocumentCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'sort_order']
    list_filter = ['project']


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'doc_type', 'project', 'uploader', 'archive_status', 'version']
    list_filter = ['doc_type', 'archive_status']
    search_fields = ['title']
