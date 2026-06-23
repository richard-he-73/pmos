from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Requirement, RequirementReview, RequirementBaseline, RequirementChange
from .serializers import (
    RequirementSerializer, RequirementReviewSerializer,
    RequirementBaselineSerializer, RequirementChangeSerializer,
)


class RequirementViewSet(viewsets.ModelViewSet):
    serializer_class = RequirementSerializer

    def get_queryset(self):
        qs = Requirement.objects.all()
        project_id = self.request.query_params.get('project')
        status_filter = self.request.query_params.get('status')
        exclude_status = self.request.query_params.get('exclude_status')
        req_type = self.request.query_params.get('type')

        if project_id:
            qs = qs.filter(project_id=project_id)
        if status_filter:
            qs = qs.filter(status__in=status_filter.split(','))
        if exclude_status:
            for s in exclude_status.split(','):
                qs = qs.exclude(status=s)
        if req_type:
            qs = qs.filter(type=req_type)

        return qs

    def perform_create(self, serializer):
        serializer.save(submitter=self.request.user)

    @action(detail=True, methods=['post'])
    def submit_review(self, request, pk=None):
        """提交评审"""
        req = self.get_object()
        review_assignee_id = request.data.get('review_assignee_id')
        if review_assignee_id:
            from apps.organizations.models import UserOrganization
            try:
                req.review_assignee = UserOrganization.objects.get(id=review_assignee_id)
            except UserOrganization.DoesNotExist:
                pass
        req.status = 'pending_review'
        req.save()
        return Response(RequirementSerializer(req).data)

    @action(detail=True, methods=['post'])
    def withdraw_review(self, request, pk=None):
        """撤回评审"""
        req = self.get_object()
        req.status = 'submitted'
        req.review_assignee = None
        req.save()
        return Response(RequirementSerializer(req).data)


class RequirementReviewViewSet(viewsets.ModelViewSet):
    serializer_class = RequirementReviewSerializer

    def get_queryset(self):
        qs = RequirementReview.objects.all()
        requirement_id = self.request.query_params.get('requirement')
        if requirement_id:
            qs = qs.filter(requirement_id=requirement_id)
        return qs

    def perform_create(self, serializer):
        review = serializer.save()
        # 更新需求状态
        conclusion = serializer.validated_data.get('conclusion')
        requirement = review.requirement
        if conclusion in ('pass', 'conditional_pass'):
            requirement.status = 'review_passed'
        elif conclusion == 'fail':
            requirement.status = 'submitted'
        requirement.save()


class RequirementBaselineViewSet(viewsets.ModelViewSet):
    serializer_class = RequirementBaselineSerializer

    def get_queryset(self):
        qs = RequirementBaseline.objects.all()
        project_id = self.request.query_params.get('project')
        search = self.request.query_params.get('search')
        if project_id:
            qs = qs.filter(project_id=project_id)
        if search:
            qs = qs.filter(name__icontains=search)
        return qs

    def perform_create(self, serializer):
        requirement_ids = serializer.validated_data.pop('requirement_ids', [])
        baseline = serializer.save(created_by=self.request.user)
        if requirement_ids:
            reqs = Requirement.objects.filter(id__in=requirement_ids)
            baseline.requirements.add(*reqs)
            reqs.update(status='baselined')

    def perform_destroy(self, instance):
        instance.requirements.all().update(status='review_passed')
        instance.delete()


class RequirementChangeViewSet(viewsets.ModelViewSet):
    serializer_class = RequirementChangeSerializer

    def get_queryset(self):
        qs = RequirementChange.objects.all()
        baseline_id = self.request.query_params.get('baseline')
        if baseline_id:
            qs = qs.filter(baseline_id=baseline_id)
        return qs

    def perform_create(self, serializer):
        # 自动获取最新版本号
        baseline = serializer.validated_data.get('baseline')
        latest = RequirementChange.objects.filter(baseline=baseline).order_by('-created_at').first()
        version = latest.baseline_version if latest else baseline.version
        serializer.save(created_by=self.request.user, baseline_version=version)
