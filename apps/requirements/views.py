from rest_framework import viewsets
from .models import BusinessRequirement, SoftwareRequirement
from .serializers import BusinessRequirementSerializer, SoftwareRequirementSerializer


class BusinessRequirementViewSet(viewsets.ModelViewSet):
    queryset = BusinessRequirement.objects.all()
    serializer_class = BusinessRequirementSerializer

    def get_queryset(self):
        qs = BusinessRequirement.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs


class SoftwareRequirementViewSet(viewsets.ModelViewSet):
    queryset = SoftwareRequirement.objects.all()
    serializer_class = SoftwareRequirementSerializer

    def get_queryset(self):
        qs = SoftwareRequirement.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs
