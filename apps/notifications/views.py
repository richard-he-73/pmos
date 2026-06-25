from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.timezone import now
from django.db.models import Q
from .models import Notification, NotificationTemplate
from .serializers import NotificationSerializer, NotificationTemplateSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    queryset = Notification.objects.none()  # Default empty, overridden by get_queryset

    def get_queryset(self):
        qs = Notification.objects.filter(recipient=self.request.user)
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(Q(project_id=project_id) | Q(project_id__isnull=True))
        return qs

    def perform_create(self, serializer):
        serializer.save(recipient=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.read_at = now()
        notification.save()
        return Response(NotificationSerializer(notification).data)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'status': 'ok'})


class NotificationTemplateViewSet(viewsets.ModelViewSet):
    queryset = NotificationTemplate.objects.all()
    serializer_class = NotificationTemplateSerializer
