from rest_framework import serializers
from .models import TestPlan, TestCase, TestRun, Bug


class TestPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestPlan
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class TestRunSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestRun
        fields = '__all__'
        read_only_fields = ['created_at']


class BugSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bug
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class BugListSerializer(serializers.ModelSerializer):
    """Bugs list with fewer fields for performance"""
    reporter_name = serializers.CharField(source='reporter.real_name', read_only=True)

    class Meta:
        model = Bug
        fields = [
            'id', 'title', 'severity', 'status', 'module',
            'reporter', 'reporter_name', 'assignee', 'created_at',
        ]
