from rest_framework import serializers
from .models import Plan, Task


class PlanSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = Plan
        fields = [
            'id', 'name', 'type', 'parent', 'project', 'project_name',
            'start_date', 'end_date', 'actual_end_date',
            'status', 'progress', 'assignee', 'description',
            'sort_order', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


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
