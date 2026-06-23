from rest_framework import serializers
from .models import Requirement, RequirementReview, RequirementBaseline, RequirementChange


class RequirementSerializer(serializers.ModelSerializer):
    assignee_name = serializers.CharField(source='assignee.name', read_only=True, allow_null=True)
    submitter_name = serializers.CharField(source='submitter.real_name', read_only=True, allow_null=True)
    review_assignee_name = serializers.CharField(source='review_assignee.name', read_only=True, allow_null=True)
    document_url = serializers.SerializerMethodField()

    class Meta:
        model = Requirement
        fields = '__all__'
        read_only_fields = ['submitter', 'created_at', 'updated_at']

    def get_document_url(self, obj):
        if obj.document:
            return obj.document.url
        return None


class RequirementReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.name', read_only=True, allow_null=True)
    requirement_name = serializers.CharField(source='requirement.name', read_only=True)
    document_url = serializers.SerializerMethodField()
    stakeholders_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    stakeholders_names = serializers.SerializerMethodField()

    class Meta:
        model = RequirementReview
        fields = '__all__'
        read_only_fields = ['created_at']

    def get_document_url(self, obj):
        if obj.document:
            return obj.document.url
        return None

    def get_stakeholders_names(self, obj):
        return [s.name for s in obj.stakeholders.all()]

    def create(self, validated_data):
        stakeholder_ids = validated_data.pop('stakeholders_ids', [])
        review = super().create(validated_data)
        if stakeholder_ids:
            from apps.organizations.models import UserOrganization
            stakeholders = UserOrganization.objects.filter(id__in=stakeholder_ids)
            review.stakeholders.add(*stakeholders)
        return review


class RequirementBaselineSerializer(serializers.ModelSerializer):
    requirement_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    requirements_data = RequirementSerializer(source='requirements', many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.real_name', read_only=True, allow_null=True)
    change_counts = serializers.SerializerMethodField()

    class Meta:
        model = RequirementBaseline
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'requirements']

    def get_change_counts(self, obj):
        """返回 { requirement_id: 审批通过的变更次数 }"""
        approved_changes = obj.changes.filter(approval_status='approved')
        result = {}
        for req in obj.requirements.all():
            count = approved_changes.filter(object_desc__contains=req.name).count()
            result[req.id] = count
        return result


class RequirementChangeSerializer(serializers.ModelSerializer):
    assignee_name = serializers.CharField(source='assignee.name', read_only=True, allow_null=True)
    approver_name = serializers.CharField(source='approver.name', read_only=True, allow_null=True)
    baseline_name = serializers.CharField(source='baseline.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.real_name', read_only=True, allow_null=True)

    class Meta:
        model = RequirementChange
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'baseline_version']
