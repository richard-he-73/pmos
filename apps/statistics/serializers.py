from rest_framework import serializers
from .models import DashboardConfig


class DashboardConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardConfig
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
