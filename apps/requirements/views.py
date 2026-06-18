from rest_framework import viewsets
from .models import BusinessRequirement, SoftwareRequirement
from .serializers import BusinessRequirementSerializer, SoftwareRequirementSerializer


class BusinessRequirementViewSet(viewsets.ModelViewSet):
    queryset = BusinessRequirement.objects.all()
    serializer_class = BusinessRequirementSerializer


class SoftwareRequirementViewSet(viewsets.ModelViewSet):
    queryset = SoftwareRequirement.objects.all()
    serializer_class = SoftwareRequirementSerializer
