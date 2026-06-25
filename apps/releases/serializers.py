from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import ReleaseDrill, ReleasePlan


class ReleaseDrillSerializer(serializers.ModelSerializer):
    assignee_name = serializers.SerializerMethodField()
    stakeholder_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    stakeholder_names = serializers.SerializerMethodField()
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = ReleaseDrill
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_assignee_name(self, obj):
        if obj.assignee:
            return obj.assignee.real_name or obj.assignee.username
        return ''

    def get_stakeholder_names(self, obj):
        return [s.real_name or s.username for s in obj.stakeholders.all()]

    def get_attachment_url(self, obj):
        if obj.attachment:
            try:
                return obj.attachment.url
            except Exception:
                return None
        return None

    def create(self, validated_data):
        stakeholder_ids = validated_data.pop('stakeholder_ids', [])
        drill = super().create(validated_data)
        if stakeholder_ids:
            users = get_user_model().objects.filter(id__in=stakeholder_ids)
            drill.stakeholders.add(*users)
        return drill

    def update(self, instance, validated_data):
        stakeholder_ids = validated_data.pop('stakeholder_ids', None)
        drill = super().update(instance, validated_data)
        if stakeholder_ids is not None:
            users = get_user_model().objects.filter(id__in=stakeholder_ids)
            drill.stakeholders.set(users)
        return drill


class ReleasePlanSerializer(serializers.ModelSerializer):
    assignee_name = serializers.SerializerMethodField()
    stakeholder_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    stakeholder_names = serializers.SerializerMethodField()
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = ReleasePlan
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_assignee_name(self, obj):
        if obj.assignee:
            return obj.assignee.real_name or obj.assignee.username
        return ''

    def get_stakeholder_names(self, obj):
        return [s.real_name or s.username for s in obj.stakeholders.all()]

    def get_attachment_url(self, obj):
        if obj.attachment:
            try:
                return obj.attachment.url
            except Exception:
                return None
        return None

    def create(self, validated_data):
        stakeholder_ids = validated_data.pop('stakeholder_ids', [])
        plan = super().create(validated_data)
        if stakeholder_ids:
            users = get_user_model().objects.filter(id__in=stakeholder_ids)
            plan.stakeholders.add(*users)
        return plan

    def update(self, instance, validated_data):
        stakeholder_ids = validated_data.pop('stakeholder_ids', None)
        plan = super().update(instance, validated_data)
        if stakeholder_ids is not None:
            users = get_user_model().objects.filter(id__in=stakeholder_ids)
            plan.stakeholders.set(users)
        return plan
