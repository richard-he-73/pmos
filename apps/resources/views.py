from rest_framework import viewsets
from django.db.models import Case, When, Value, IntegerField, F
from .models import Consultant, ProjectResource, ResourceChangeLog
from .serializers import ConsultantSerializer, ProjectResourceSerializer, ResourceChangeLogSerializer


class ConsultantViewSet(viewsets.ModelViewSet):
    queryset = Consultant.objects.all()
    serializer_class = ConsultantSerializer

    def get_queryset(self):
        rank_order = Case(
            When(rank='director', then=Value(0)),
            When(rank='senior', then=Value(1)),
            When(rank='consultant', then=Value(2)),
            When(rank='assistant', then=Value(3)),
            When(rank='other', then=Value(4)),
            default=Value(99),
            output_field=IntegerField(),
        )
        return Consultant.objects.all().annotate(
            rank_order=rank_order
        ).order_by(
            'rank_order',
            F('entry_date').asc(nulls_last=True),
            F('exit_date').asc(nulls_last=True),
        )


class ProjectResourceViewSet(viewsets.ModelViewSet):
    queryset = ProjectResource.objects.all()
    serializer_class = ProjectResourceSerializer


class ResourceChangeLogViewSet(viewsets.ModelViewSet):
    queryset = ResourceChangeLog.objects.all()
    serializer_class = ResourceChangeLogSerializer
