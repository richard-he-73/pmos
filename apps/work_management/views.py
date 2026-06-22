from rest_framework import viewsets
from .models import Equipment, Leave, Timesheet, TimesheetDetail
from .serializers import EquipmentSerializer, LeaveSerializer, TimesheetSerializer, TimesheetDetailSerializer


class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer

    def get_queryset(self):
        qs = Equipment.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs


class LeaveViewSet(viewsets.ModelViewSet):
    queryset = Leave.objects.all()
    serializer_class = LeaveSerializer

    def get_queryset(self):
        qs = Leave.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs


class TimesheetDetailViewSet(viewsets.ModelViewSet):
    queryset = TimesheetDetail.objects.all()
    serializer_class = TimesheetDetailSerializer

    def get_queryset(self):
        qs = TimesheetDetail.objects.all()
        timesheet_id = self.request.query_params.get('timesheet')
        if timesheet_id:
            qs = qs.filter(timesheet_id=timesheet_id)
        return qs


class TimesheetViewSet(viewsets.ModelViewSet):
    queryset = Timesheet.objects.all()
    serializer_class = TimesheetSerializer

    def get_queryset(self):
        qs = Timesheet.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs
