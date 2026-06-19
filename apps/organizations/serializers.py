from rest_framework import serializers
from .models import Department, UserOrganization


class DepartmentSerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.name', read_only=True, allow_null=True)
    manager_name = serializers.CharField(source='manager.real_name', read_only=True, allow_null=True)

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
