from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Plan, Task
from .serializers import (
    PlanSerializer, PlanGanttSerializer,
    TaskSerializer, TaskGanttSerializer,
)


class PlanViewSet(viewsets.ModelViewSet):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer

    def get_queryset(self):
        qs = Plan.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    @action(detail=True, methods=['get'])
    def gantt(self, request, pk=None):
        """返回甘特图数据"""
        plan = self.get_object()
        tasks = Task.objects.filter(plan=plan)
        return Response({
            'plan': PlanGanttSerializer(plan).data,
            'tasks': TaskGanttSerializer(tasks, many=True).data,
        })

    @action(detail=True, methods=['get'])
    def tasks(self, request, pk=None):
        """返回计划下的所有任务"""
        plan = self.get_object()
        tasks = Task.objects.filter(plan=plan)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    def get_queryset(self):
        qs = Task.objects.all()
        plan_id = self.request.query_params.get('plan')
        if plan_id:
            qs = qs.filter(plan_id=plan_id)
        return qs

    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        task = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(Task.Status.choices):
            return Response(
                {'error': '无效的状态值'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        task.status = new_status
        task.save()
        return Response(TaskSerializer(task).data)

    @action(detail=True, methods=['patch'])
    def move(self, request, pk=None):
        """拖拽排序"""
        task = self.get_object()
        new_order = request.data.get('sort_order')
        new_plan_id = request.data.get('plan')
        if new_order is not None:
            task.sort_order = new_order
        if new_plan_id is not None:
            task.plan_id = new_plan_id
        task.save()
        return Response(TaskSerializer(task).data)
