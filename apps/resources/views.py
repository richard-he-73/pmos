from rest_framework import viewsets
from .models import ProjectResource, ResourceChangeLog
from .serializers import ProjectResourceSerializer, ResourceChangeLogSerializer


class ProjectResourceViewSet(viewsets.ModelViewSet):
    queryset = ProjectResource.objects.all()
    serializer_class = ProjectResourceSerializer


class ResourceChangeLogViewSet(viewsets.ModelViewSet):
    queryset = ResourceChangeLog.objects.all()
    serializer_class = ResourceChangeLogSerializer
