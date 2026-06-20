from rest_framework import serializers
from .models import Plan, Task


class PlanSerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.name', read_only=True, allow_null=True)
    assignee_name = serializers.CharField(source='assignee.real_name', read_only=True, allow_null=True)

    class Meta:
        model = Plan
        fields = [
            'id', 'name', 'type', 'parent', 'parent_name', 'project',
            'description', 'assignee', 'assignee_name', 'stakeholders',
            'start_date', 'end_date', 'actual_end_date',
            'status', 'progress', 'sort_order', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, attrs):
        plan_type = attrs.get('type') or (self.instance.type if self.instance else None)
        parent = attrs.get('parent') or (self.instance.parent if self.instance else None)
        if plan_type in ('middle', 'detail') and parent:
            start = attrs.get('start_date') or (self.instance.start_date if self.instance else None)
            end = attrs.get('end_date') or (self.instance.end_date if self.instance else None)
            if start and parent.start_date and start < parent.start_date:
                raise serializers.ValidationError({'start_date': f'开始日期不能早于上级计划开始日期 ({parent.start_date})'})
            if end and parent.end_date and end > parent.end_date:
                raise serializers.ValidationError({'end_date': f'结束日期不能晚于上级计划结束日期 ({parent.end_date})'})
        return attrs


class PlanGanttSerializer(serializers.ModelSerializer):
    """甘特图数据格式"""
    class Meta:
        model = Plan
        fields = ['id', 'name', 'type', 'start_date', 'end_date',
                  'progress', 'status', 'parent', 'sort_order']


class TaskSerializer(serializers.ModelSerializer):
    assignee_name = serializers.CharField(
        source='assignee.real_name', read_only=True,
    )

    class Meta:
        model = Task
        fields = [
            'id', 'name', 'description', 'plan', 'status', 'priority',
            'assignee', 'assignee_name', 'start_date', 'due_date',
            'estimated_hours', 'actual_hours', 'parent', 'sort_order',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class TaskGanttSerializer(serializers.ModelSerializer):
    """甘特图任务数据"""
    class Meta:
        model = Task
        fields = ['id', 'name', 'plan', 'status', 'priority',
                  'start_date', 'due_date', 'assignee', 'sort_order']
