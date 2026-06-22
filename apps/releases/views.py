from rest_framework import viewsets
from .models import ReleaseDrill, ReleaseDeployment, ReleaseStep
from .serializers import ReleaseDrillSerializer, ReleaseDeploymentSerializer, ReleaseStepSerializer


class ReleaseDrillViewSet(viewsets.ModelViewSet):
    queryset = ReleaseDrill.objects.all()
    serializer_class = ReleaseDrillSerializer

    def get_queryset(self):
        qs = ReleaseDrill.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs


class ReleaseDeploymentViewSet(viewsets.ModelViewSet):
    queryset = ReleaseDeployment.objects.all()
    serializer_class = ReleaseDeploymentSerializer

    def get_queryset(self):
        qs = ReleaseDeployment.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs


class ReleaseStepViewSet(viewsets.ModelViewSet):
    queryset = ReleaseStep.objects.all()
    serializer_class = ReleaseStepSerializer

    def get_queryset(self):
        qs = ReleaseStep.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs
