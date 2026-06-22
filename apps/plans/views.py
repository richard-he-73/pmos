from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
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
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(
                Q(plan__project_id=project_id) |
                Q(plan__parent__project_id=project_id) |
                Q(plan__parent__parent__project_id=project_id)
            )
        plan_id = self.request.query_params.get('plan')
        if plan_id:
            qs = qs.filter(plan_id=plan_id)
        return qs

    def perform_create(self, serializer):
        # 如果传了 assignee_name，按姓名查找用户，并保存姓名文本
        assignee_name = self.request.data.get('assignee_name', '')
        if assignee_name:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user = User.objects.filter(
                Q(real_name=assignee_name) | Q(username=assignee_name)
            ).first()
            if user:
                task = serializer.save(created_by=self.request.user, assignee=user, assignee_name=assignee_name)
            else:
                task = serializer.save(created_by=self.request.user, assignee_name=assignee_name)
        else:
            task = serializer.save(created_by=self.request.user)
        # 发送通知给负责人和干系人
        self._notify_stakeholders(task)

    def perform_update(self, serializer):
        old = serializer.instance
        # 如果传了 assignee_name，按姓名查找用户，并保存姓名文本
        assignee_name = self.request.data.get('assignee_name', '')
        if assignee_name:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user = User.objects.filter(
                Q(real_name=assignee_name) | Q(username=assignee_name)
            ).first()
            if user:
                task = serializer.save(assignee=user, assignee_name=assignee_name)
            else:
                task = serializer.save(assignee_name=assignee_name)
        else:
            task = serializer.save()
        # 如果负责人或干系人变更，发送通知
        if old.assignee_id != task.assignee_id or old.stakeholders != task.stakeholders:
            self._notify_stakeholders(task)

    def _notify_stakeholders(self, task):
        """通知负责人和干系人"""
        from apps.notifications.services import notify_user

        # 通知负责人
        if task.assignee_id:
            notify_user(
                task.assignee_id, 'task_assigned', task,
                extra=f'任务: {task.name}',
            )

        # 通知干系人
        if task.stakeholders:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            names = [s.strip() for s in task.stakeholders.split(',') if s.strip()]
            for name in names:
                try:
                    user = User.objects.filter(
                        Q(real_name=name) | Q(username=name)
                    ).first()
                    if user and user.id != task.assignee_id:
                        notify_user(
                            user.id, 'task_assigned', task,
                            extra=f'任务: {task.name}',
                        )
                except Exception:
                    pass

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
