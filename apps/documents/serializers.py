from rest_framework import serializers
from .models import DocumentCategory, Document


class DocumentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentCategory
        fields = '__all__'


class DocumentSerializer(serializers.ModelSerializer):
    uploader_name = serializers.CharField(source='uploader.real_name', read_only=True)

    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
