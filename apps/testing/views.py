from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import TestEnvironment, TestCase, TestPlan, TestExecution, TestDefect
from .serializers import (
    TestEnvironmentSerializer, TestCaseSerializer, TestPlanSerializer,
    TestExecutionSerializer, TestDefectSerializer,
)
from apps.notifications.services import notify_users


class TestEnvironmentViewSet(viewsets.ModelViewSet):
    queryset = TestEnvironment.objects.all()
    serializer_class = TestEnvironmentSerializer
    search_fields = ['name', 'description']
    filterset_fields = ['status']

    def get_queryset(self):
        qs = TestEnvironment.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search))
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class TestCaseViewSet(viewsets.ModelViewSet):
    queryset = TestCase.objects.all()
    serializer_class = TestCaseSerializer
    search_fields = ['name', 'module']
    filterset_fields = ['type', 'priority', 'status']

    def get_queryset(self):
        qs = TestCase.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(module__icontains=search))
        # Filter by status for dropdown (only active)
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class TestPlanViewSet(viewsets.ModelViewSet):
    queryset = TestPlan.objects.all()
    serializer_class = TestPlanSerializer
    search_fields = ['name', 'goal']

    def get_queryset(self):
        qs = TestPlan.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(goal__icontains=search))
        return qs

    def _notify_plan_participants(self, plan):
        """向测试负责人和干系人发送消息通知"""
        user_ids = set()
        if plan.assignee:
            user_ids.add(plan.assignee.id)
        stakeholder_ids = list(plan.stakeholders.values_list('id', flat=True))
        user_ids.update(stakeholder_ids)
        if user_ids:
            notify_users(list(user_ids), 'test_plan_created', related_obj=plan)

    def perform_create(self, serializer):
        plan = serializer.save(created_by=self.request.user)
        self._notify_plan_participants(plan)

    def perform_update(self, serializer):
        plan = serializer.save()
        self._notify_plan_participants(plan)

    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        """执行测试计划：创建测试执行记录"""
        plan = self.get_object()
        test_cases = plan.test_cases.all()
        if not test_cases:
            return Response(
                {'detail': '该测试计划没有关联测试用例，无法执行'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        executions = []
        for tc in test_cases:
            execution = TestExecution.objects.create(
                test_plan=plan,
                test_case=tc,
                executor=request.user,
                execution_date=None,
                result=TestExecution.Result.PASS,
                project=plan.project,
                created_by=request.user,
            )
            executions.append(execution)

        serializer = TestExecutionSerializer(executions, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TestExecutionViewSet(viewsets.ModelViewSet):
    queryset = TestExecution.objects.all()
    serializer_class = TestExecutionSerializer
    filterset_fields = ['result', 'test_plan']

    def get_queryset(self):
        qs = TestExecution.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        test_plan_id = self.request.query_params.get('test_plan')
        if test_plan_id:
            qs = qs.filter(test_plan_id=test_plan_id)
        test_case_id = self.request.query_params.get('test_case')
        if test_case_id:
            qs = qs.filter(test_case_id=test_case_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class TestDefectViewSet(viewsets.ModelViewSet):
    queryset = TestDefect.objects.all()
    serializer_class = TestDefectSerializer
    search_fields = ['name', 'description']
    filterset_fields = ['severity', 'priority', 'status']

    def get_queryset(self):
        qs = TestDefect.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        test_case_id = self.request.query_params.get('test_case')
        if test_case_id:
            qs = qs.filter(related_test_case_id=test_case_id)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search))
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def _notify_defect_participants(self, defect):
        """向负责人发送消息通知"""
        if defect.assignee:
            notify_users([defect.assignee.id], 'defect_reported', related_obj=defect)

    def perform_create(self, serializer):
        defect = serializer.save(created_by=self.request.user)
        self._notify_defect_participants(defect)

    def perform_update(self, serializer):
        defect = serializer.save()
        self._notify_defect_participants(defect)
