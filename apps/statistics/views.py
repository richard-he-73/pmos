from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Sum, Q
from apps.projects.models import Project
from apps.plans.models import Task, Plan
from apps.testing.models import TestDefect, TestExecution, TestCase
from apps.work_management.models import Timesheet


class StatisticsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def project_overview(self, request):
        """项目总览统计"""
        total = Project.objects.count()
        stats = Project.objects.values('status').annotate(count=Count('id'))
        return Response({'total': total, 'by_status': list(stats)})

    @action(detail=False, methods=['get'])
    def project_detail(self, request):
        """单个项目详细统计"""
        project_id = request.query_params.get('project')
        if not project_id:
            return Response({'error': 'project parameter required'}, status=400)

        plans = Plan.objects.filter(project_id=project_id)
        tasks = Task.objects.filter(plan__project_id=project_id)
        defects = TestDefect.objects.filter(project_id=project_id)
        test_cases = TestCase.objects.filter(project_id=project_id)

        return Response({
            'plans': {
                'total': plans.count(),
                'completed': plans.filter(status__in=['completed_on_time', 'completed_late', 'completed_early']).count(),
                'in_progress': plans.filter(status='in_progress').count(),
            },
            'tasks': {
                'total': tasks.count(),
                'completed': tasks.filter(status__in=['completed_on_time', 'completed_late', 'completed_early']).count(),
                'in_progress': tasks.filter(status='in_progress').count(),
            },
            'defects': {
                'total': defects.count(),
                'open': defects.exclude(status__in=['resolved']).count(),
                'by_severity': list(
                    defects.values('severity').annotate(count=Count('id')),
                ),
            },
            'test_cases': {
                'total': test_cases.count(),
                'by_type': list(test_cases.values('type').annotate(count=Count('id'))),
                'by_status': list(test_cases.values('status').annotate(count=Count('id'))),
            },
            'test_executions': {
                'total': TestExecution.objects.filter(project_id=project_id).count(),
                'by_result': list(
                    TestExecution.objects.filter(project_id=project_id)
                    .values('result').annotate(count=Count('id'))
                ),
            },
        })

    @action(detail=False, methods=['get'])
    def bug_trend(self, request):
        """缺陷趋势统计"""
        project_id = request.query_params.get('project')
        defects = TestDefect.objects.all()
        if project_id:
            defects = defects.filter(project_id=project_id)

        return Response({
            'by_status': list(defects.values('status').annotate(count=Count('id'))),
            'by_severity': list(defects.values('severity').annotate(count=Count('id'))),
        })

    @action(detail=False, methods=['get'])
    def timesheet_summary(self, request):
        """工时统计（通过 TimesheetDetail 聚合）"""
        project_id = request.query_params.get('project')
        user_id = request.query_params.get('user')

        from apps.work_management.models import TimesheetDetail

        qs = TimesheetDetail.objects.all()
        if project_id:
            qs = qs.filter(timesheet__project_id=project_id)
        if user_id:
            qs = qs.filter(timesheet__reporter_id=user_id)

        total_hours = qs.aggregate(total=Sum('hours'))['total'] or 0

        return Response({
            'total_hours': total_hours,
            'by_project': list(qs.values('timesheet__project__name').annotate(
                total=Sum('hours'),
            )),
            'by_user': list(qs.values('timesheet__reporter__name').annotate(
                total=Sum('hours'),
            )),
        })
