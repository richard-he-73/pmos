from rest_framework import serializers
from .models import CommType, CommRecord


class CommTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommType
        fields = '__all__'


class CommRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommRecord
        fields = '__all__'
        read_only_fields = ['created_at']
