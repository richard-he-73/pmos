from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from .models import Project, ProjectMember
from .serializers import ProjectSerializer, ProjectDetailSerializer, ProjectMemberSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectSerializer

    def get_queryset(self):
        qs = Project.objects.all()
        status = self.request.query_params.get('status')
        project_type = self.request.query_params.get('project_type')
        contract_status = self.request.query_params.get('contract_status')
        search = self.request.query_params.get('search')
        if status:
            qs = qs.filter(status=status)
        if project_type:
            qs = qs.filter(project_type=project_type)
        if contract_status:
            qs = qs.filter(contract_status=contract_status)
        if search:
            qs = qs.filter(
                models.Q(name__icontains=search) |
                models.Q(code__icontains=search)
            )
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        project = self.get_object()
        members = ProjectMember.objects.filter(project=project, is_active=True)
        serializer = ProjectMemberSerializer(members, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        project = self.get_object()
        serializer = ProjectMemberSerializer(
            data={**request.data, 'project': project.id},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
