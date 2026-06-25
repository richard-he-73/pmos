from rest_framework import viewsets
from .models import ReleaseDrill, ReleasePlan
from .serializers import ReleaseDrillSerializer, ReleasePlanSerializer


class ReleaseDrillViewSet(viewsets.ModelViewSet):
    queryset = ReleaseDrill.objects.all()
    serializer_class = ReleaseDrillSerializer

    def get_queryset(self):
        qs = ReleaseDrill.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        scenario = self.request.query_params.get('scenario')
        if scenario:
            qs = qs.filter(scenario=scenario)
        return qs


class ReleasePlanViewSet(viewsets.ModelViewSet):
    queryset = ReleasePlan.objects.all()
    serializer_class = ReleasePlanSerializer

    def get_queryset(self):
        qs = ReleasePlan.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        release_type = self.request.query_params.get('release_type')
        if release_type:
            qs = qs.filter(release_type=release_type)
        return qs
