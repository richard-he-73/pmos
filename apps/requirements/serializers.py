from rest_framework import serializers
from .models import BusinessRequirement, SoftwareRequirement


class BusinessRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessRequirement
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class SoftwareRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoftwareRequirement
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
