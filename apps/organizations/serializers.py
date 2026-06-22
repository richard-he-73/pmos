from rest_framework import serializers
from .models import Department, UserOrganization


class DepartmentSerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.name', read_only=True, allow_null=True)
    manager_name = serializers.CharField(source='manager.name', read_only=True, allow_null=True)

    class Meta:
        model = Department
        fields = '__all__'
        read_only_fields = ['created_at']


class UserOrganizationSerializer(serializers.ModelSerializer):
    dept_name = serializers.CharField(source='department.name', read_only=True)
    consultant_name = serializers.CharField(source='consultant.name', read_only=True, allow_null=True)

    class Meta:
        model = UserOrganization
        fields = '__all__'
