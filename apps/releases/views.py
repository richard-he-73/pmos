from rest_framework import viewsets
from .models import ReleaseDrill, ReleaseDeployment, ReleaseStep
from .serializers import ReleaseDrillSerializer, ReleaseDeploymentSerializer, ReleaseStepSerializer


class ReleaseDrillViewSet(viewsets.ModelViewSet):
    queryset = ReleaseDrill.objects.all()
    serializer_class = ReleaseDrillSerializer


class ReleaseDeploymentViewSet(viewsets.ModelViewSet):
    queryset = ReleaseDeployment.objects.all()
    serializer_class = ReleaseDeploymentSerializer


class ReleaseStepViewSet(viewsets.ModelViewSet):
    queryset = ReleaseStep.objects.all()
    serializer_class = ReleaseStepSerializer
