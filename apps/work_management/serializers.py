from rest_framework import serializers
from .models import Equipment, Leave, Timesheet, TimesheetDetail


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
        from apps.organizations.models import UserOrganization
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
