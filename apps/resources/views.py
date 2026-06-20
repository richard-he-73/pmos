from rest_framework import viewsets
from .models import Consultant, ProjectResource, ResourceChangeLog
from .serializers import ConsultantSerializer, ProjectResourceSerializer, ResourceChangeLogSerializer


class ConsultantViewSet(viewsets.ModelViewSet):
    queryset = Consultant.objects.all()
    serializer_class = ConsultantSerializer


class ProjectResourceViewSet(viewsets.ModelViewSet):
    queryset = ProjectResource.objects.all()
    serializer_class = ProjectResourceSerializer


class ResourceChangeLogViewSet(viewsets.ModelViewSet):
    queryset = ResourceChangeLog.objects.all()
    serializer_class = ResourceChangeLogSerializer
