from rest_framework import viewsets
from .models import TestPlan, TestCase, TestRun, Bug
from .serializers import (
    TestPlanSerializer, TestCaseSerializer,
    TestRunSerializer, BugSerializer, BugListSerializer,
)


class TestPlanViewSet(viewsets.ModelViewSet):
    queryset = TestPlan.objects.all()
    serializer_class = TestPlanSerializer


class TestCaseViewSet(viewsets.ModelViewSet):
    queryset = TestCase.objects.all()
    serializer_class = TestCaseSerializer


class TestRunViewSet(viewsets.ModelViewSet):
    queryset = TestRun.objects.all()
    serializer_class = TestRunSerializer


class BugViewSet(viewsets.ModelViewSet):
    queryset = Bug.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return BugListSerializer
        return BugSerializer
