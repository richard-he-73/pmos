from rest_framework import viewsets
from .models import CommType, CommRecord
from .serializers import CommTypeSerializer, CommRecordSerializer


class CommTypeViewSet(viewsets.ModelViewSet):
    queryset = CommType.objects.all()
    serializer_class = CommTypeSerializer


class CommRecordViewSet(viewsets.ModelViewSet):
    queryset = CommRecord.objects.all()
    serializer_class = CommRecordSerializer
