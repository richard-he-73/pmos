from rest_framework import serializers
from .models import Consultant, ProjectResource, ResourceChangeLog


class ConsultantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consultant
        fields = '__all__'
        read_only_fields = ['created_at']


class ProjectResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectResource
        fields = '__all__'
        read_only_fields = ['created_at']


class ResourceChangeLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceChangeLog
        fields = '__all__'
        read_only_fields = ['changed_at']
