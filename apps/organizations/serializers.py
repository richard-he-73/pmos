from rest_framework import serializers
from .models import Department, UserOrganization


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'
        read_only_fields = ['created_at']


class UserOrganizationSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.real_name', read_only=True)
    dept_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = UserOrganization
        fields = '__all__'
