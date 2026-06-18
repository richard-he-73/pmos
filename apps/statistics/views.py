from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Sum, Q
from apps.projects.models import Project
from apps.plans.models import Task, Plan
from apps.testing.models import Bug, TestRun, TestCase
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
        bugs = Bug.objects.filter(related_test_run__test_plan__project_id=project_id)
        test_cases = TestCase.objects.filter(
            test_runs__test_plan__project_id=project_id,
        ).distinct()

        return Response({
            'plans': {
                'total': plans.count(),
                'completed': plans.filter(status='completed').count(),
                'in_progress': plans.filter(status='in_progress').count(),
            },
            'tasks': {
                'total': tasks.count(),
                'completed': tasks.filter(status='done').count(),
                'in_progress': tasks.filter(status='in_progress').count(),
            },
            'bugs': {
                'total': bugs.count(),
                'open': bugs.exclude(status__in=['resolved', 'closed']).count(),
                'by_severity': list(
                    bugs.values('severity').annotate(count=Count('id')),
                ),
            },
            'test_cases': {
                'total': test_cases.count(),
            },
        })

    @action(detail=False, methods=['get'])
    def bug_trend(self, request):
        """缺陷趋势统计"""
        project_id = request.query_params.get('project')
        bugs = Bug.objects.all()
        if project_id:
            bugs = bugs.filter(related_test_run__test_plan__project_id=project_id)

        return Response({
            'by_status': list(bugs.values('status').annotate(count=Count('id'))),
            'by_severity': list(bugs.values('severity').annotate(count=Count('id'))),
            'by_module': list(bugs.values('module').annotate(count=Count('id'))),
        })

    @action(detail=False, methods=['get'])
    def timesheet_summary(self, request):
        """工时统计"""
        project_id = request.query_params.get('project')
        user_id = request.query_params.get('user')

        qs = Timesheet.objects.all()
        if project_id:
            qs = qs.filter(project_id=project_id)
        if user_id:
            qs = qs.filter(user_id=user_id)

        total_hours = qs.aggregate(total=Sum('hours'))['total'] or 0

        return Response({
            'total_hours': total_hours,
            'by_project': list(qs.values('project__name').annotate(
                total=Sum('hours'),
            )),
            'by_user': list(qs.values('user__real_name').annotate(
                total=Sum('hours'),
            )),
        })
