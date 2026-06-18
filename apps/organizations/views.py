from rest_framework import viewsets
from .models import Department, UserOrganization
from .serializers import DepartmentSerializer, UserOrganizationSerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer


class UserOrganizationViewSet(viewsets.ModelViewSet):
    queryset = UserOrganization.objects.all()
    serializer_class = UserOrganizationSerializer
