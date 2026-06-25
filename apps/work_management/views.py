from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Equipment, Leave, Timesheet, TimesheetDetail, Issue, Risk
from .serializers import (
    EquipmentSerializer, LeaveSerializer, TimesheetSerializer,
    TimesheetDetailSerializer, IssueSerializer, RiskSerializer,
)


class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer

    def get_queryset(self):
        qs = Equipment.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs


class LeaveViewSet(viewsets.ModelViewSet):
    queryset = Leave.objects.all()
    serializer_class = LeaveSerializer

    def get_queryset(self):
        qs = Leave.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs


class TimesheetDetailViewSet(viewsets.ModelViewSet):
    queryset = TimesheetDetail.objects.all()
    serializer_class = TimesheetDetailSerializer

    def get_queryset(self):
        qs = TimesheetDetail.objects.all()
        timesheet_id = self.request.query_params.get('timesheet')
        if timesheet_id:
            qs = qs.filter(timesheet_id=timesheet_id)
        return qs


class TimesheetViewSet(viewsets.ModelViewSet):
    queryset = Timesheet.objects.all()
    serializer_class = TimesheetSerializer

    def get_queryset(self):
        qs = Timesheet.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs


class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer

    def get_queryset(self):
        qs = Issue.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        severity_filter = self.request.query_params.get('severity')
        if severity_filter:
            qs = qs.filter(severity=severity_filter)
        priority_filter = self.request.query_params.get('priority')
        if priority_filter:
            qs = qs.filter(priority=priority_filter)
        return qs

    @action(detail=True, methods=['post'])
    def report_risk(self, request, pk=None):
        """将问题报告为风险，创建一个关联的风险记录"""
        issue = self.get_object()
        risk = Risk.objects.create(
            project=issue.project,
            title=f'[来自问题] {issue.title}',
            description=issue.description,
            reporter=request.user,
            assignee=issue.assignee,
        )
        serializer = RiskSerializer(risk, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RiskViewSet(viewsets.ModelViewSet):
    queryset = Risk.objects.all()
    serializer_class = RiskSerializer

    def get_queryset(self):
        qs = Risk.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        category_filter = self.request.query_params.get('category')
        if category_filter:
            qs = qs.filter(category=category_filter)
        risk_level_filter = self.request.query_params.get('risk_level')
        if risk_level_filter:
            qs = qs.filter(risk_level=risk_level_filter)
        return qs

    @action(detail=True, methods=['post'])
    def convert_to_issue(self, request, pk=None):
        """将风险转为问题，创建一个关联的问题记录"""
        risk = self.get_object()
        issue = Issue.objects.create(
            project=risk.project,
            title=f'[来自风险] {risk.title}',
            description=risk.description,
            reporter=request.user,
            assignee=risk.assignee,
        )
        serializer = IssueSerializer(issue, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def recalculate_risk_level(self, request, pk=None):
        """重新自动计算风险等级"""
        risk = self.get_object()
        risk.risk_level = risk.calculate_risk_level()
        risk.save(update_fields=['risk_level'])
        serializer = self.get_serializer(risk)
        return Response(serializer.data)
