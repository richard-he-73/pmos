from django.conf import settings
from rest_framework import serializers
from .models import TestEnvironment, TestCase, TestPlan, TestExecution, TestDefect


def _user_name(user):
    """获取用户显示名，real_name 为空时回退到 username"""
    if user is None:
        return None
    return user.real_name or user.username


class TestEnvironmentSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = TestEnvironment
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_created_by_name(self, obj):
        return _user_name(obj.created_by)


class TestCaseSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    baseline_name = serializers.CharField(source='requirement_baseline.name', read_only=True)
    baseline_version = serializers.CharField(source='requirement_baseline.version', read_only=True)
    related_requirement_names = serializers.SerializerMethodField()

    class Meta:
        model = TestCase
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_created_by_name(self, obj):
        return _user_name(obj.created_by)

    def get_related_requirement_names(self, obj):
        return list(obj.related_requirements.values_list('name', flat=True))


class TestPlanSerializer(serializers.ModelSerializer):
    assignee_name = serializers.SerializerMethodField()
    test_environment_name = serializers.CharField(
        source='test_environment.name', read_only=True,
    )
    test_case_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False,
    )
    test_case_names = serializers.SerializerMethodField()
    stakeholder_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False,
    )
    stakeholder_names = serializers.SerializerMethodField()

    class Meta:
        model = TestPlan
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_assignee_name(self, obj):
        return _user_name(obj.assignee)

    def get_test_case_names(self, obj):
        return list(obj.test_cases.values_list('name', flat=True))

    def get_stakeholder_names(self, obj):
        return [(_user_name(u) or '') for u in obj.stakeholders.all()]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['test_case_ids'] = list(instance.test_cases.values_list('id', flat=True))
        ret['stakeholder_ids'] = list(instance.stakeholders.values_list('id', flat=True))
        return ret

    def create(self, validated_data):
        test_case_ids = validated_data.pop('test_case_ids', [])
        stakeholder_ids = validated_data.pop('stakeholder_ids', [])
        instance = super().create(validated_data)
        if test_case_ids:
            instance.test_cases.set(TestCase.objects.filter(id__in=test_case_ids))
        if stakeholder_ids:
            instance.stakeholders.set(
                settings.AUTH_USER_MODEL.objects.filter(id__in=stakeholder_ids)
            )
        return instance

    def update(self, instance, validated_data):
        test_case_ids = validated_data.pop('test_case_ids', None)
        stakeholder_ids = validated_data.pop('stakeholder_ids', None)
        instance = super().update(instance, validated_data)
        if test_case_ids is not None:
            instance.test_cases.set(TestCase.objects.filter(id__in=test_case_ids))
        if stakeholder_ids is not None:
            instance.stakeholders.set(
                settings.AUTH_USER_MODEL.objects.filter(id__in=stakeholder_ids)
            )
        return instance


class TestExecutionSerializer(serializers.ModelSerializer):
    executor_name = serializers.SerializerMethodField()
    test_case_name = serializers.CharField(source='test_case.name', read_only=True)
    test_plan_name = serializers.CharField(source='test_plan.name', read_only=True)

    class Meta:
        model = TestExecution
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_executor_name(self, obj):
        return _user_name(obj.executor)


class TestDefectSerializer(serializers.ModelSerializer):
    assignee_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    test_case_name = serializers.CharField(source='related_test_case.name', read_only=True)

    class Meta:
        model = TestDefect
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_assignee_name(self, obj):
        return _user_name(obj.assignee)

    def get_created_by_name(self, obj):
        return _user_name(obj.created_by)
