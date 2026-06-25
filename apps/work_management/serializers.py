from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Equipment, Leave, Timesheet, TimesheetDetail, Issue, Risk


class TimesheetDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimesheetDetail
        fields = '__all__'


class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class LeaveSerializer(serializers.ModelSerializer):
    applicant_name = serializers.CharField(source='applicant.name', read_only=True)

    class Meta:
        model = Leave
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class TimesheetSerializer(serializers.ModelSerializer):
    reporter_name = serializers.CharField(source='reporter.name', read_only=True)

    class Meta:
        model = Timesheet
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        instance = super().create(validated_data)
        self._generate_details(instance)
        return instance

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        # Regenerate details
        instance.details.all().delete()
        self._generate_details(instance)
        return instance

    def _generate_details(self, instance):
        from datetime import timedelta
        from .models import TimesheetDetail
        from apps.work_management.models import Leave

        current = instance.start_date
        while current <= instance.end_date:
            # Determine type: check holidays first, then leave
            day_type = instance.type
            # Weekend auto-detect
            if current.weekday() >= 5 and day_type not in ('leave',):
                day_type = 'holiday'
            # Check if reporter has overlapping leave
            if instance.reporter_id:
                leaves = Leave.objects.filter(
                    applicant_id=instance.reporter_id,
                    start_date__date__lte=current,
                    end_date__date__gte=current,
                    status__in=['pending', 'approved'],
                )
                if leaves.exists():
                    day_type = 'leave'
            TimesheetDetail.objects.create(
                timesheet=instance,
                date=current,
                type=day_type,
                hours=8.0,
            )
            current += timedelta(days=1)


class IssueSerializer(serializers.ModelSerializer):
    reporter_name = serializers.SerializerMethodField()
    assignee_name = serializers.SerializerMethodField()
    stakeholder_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    stakeholder_names = serializers.SerializerMethodField()
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = Issue
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_reporter_name(self, obj):
        if obj.reporter:
            return obj.reporter.real_name or obj.reporter.username
        return ''

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
        issue = super().create(validated_data)
        if stakeholder_ids:
            users = get_user_model().objects.filter(id__in=stakeholder_ids)
            issue.stakeholders.add(*users)
        return issue

    def update(self, instance, validated_data):
        stakeholder_ids = validated_data.pop('stakeholder_ids', None)
        issue = super().update(instance, validated_data)
        if stakeholder_ids is not None:
            users = get_user_model().objects.filter(id__in=stakeholder_ids)
            issue.stakeholders.set(users)
        return issue


class RiskSerializer(serializers.ModelSerializer):
    reporter_name = serializers.SerializerMethodField()
    assignee_name = serializers.SerializerMethodField()
    stakeholder_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    stakeholder_names = serializers.SerializerMethodField()
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = Risk
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_reporter_name(self, obj):
        if obj.reporter:
            return obj.reporter.real_name or obj.reporter.username
        return ''

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
        risk = super().create(validated_data)
        if stakeholder_ids:
            users = get_user_model().objects.filter(id__in=stakeholder_ids)
            risk.stakeholders.add(*users)
        return risk

    def update(self, instance, validated_data):
        stakeholder_ids = validated_data.pop('stakeholder_ids', None)
        risk = super().update(instance, validated_data)
        if stakeholder_ids is not None:
            users = get_user_model().objects.filter(id__in=stakeholder_ids)
            risk.stakeholders.set(users)
        return risk
