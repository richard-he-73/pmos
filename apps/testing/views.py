from rest_framework import viewsets
from .models import TestPlan, TestCase, TestRun, Bug
from .serializers import (
    TestPlanSerializer, TestCaseSerializer,
    TestRunSerializer, BugSerializer, BugListSerializer,
)


class TestPlanViewSet(viewsets.ModelViewSet):
    queryset = TestPlan.objects.all()
    serializer_class = TestPlanSerializer

    def get_queryset(self):
        qs = TestPlan.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs


class TestCaseViewSet(viewsets.ModelViewSet):
    queryset = TestCase.objects.all()
    serializer_class = TestCaseSerializer

    def get_queryset(self):
        qs = TestCase.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs


class TestRunViewSet(viewsets.ModelViewSet):
    queryset = TestRun.objects.all()
    serializer_class = TestRunSerializer

    def get_queryset(self):
        qs = TestRun.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs


class BugViewSet(viewsets.ModelViewSet):
    queryset = Bug.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return BugListSerializer
        return BugSerializer

    def get_queryset(self):
        qs = Bug.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs
