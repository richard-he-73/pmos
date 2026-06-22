from rest_framework import viewsets, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django.utils import timezone
from .models import DocumentCategory, Document
from .serializers import DocumentCategorySerializer, DocumentSerializer


class DocumentCategoryViewSet(viewsets.ModelViewSet):
    queryset = DocumentCategory.objects.all()
    serializer_class = DocumentCategorySerializer


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        qs = Document.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    def perform_create(self, serializer):
        # 新建时默认上传人为当前用户，updated_at 留空
        uploader = serializer.validated_data.get('uploader')
        if uploader is None:
            serializer.save(uploader=self.request.user)
        else:
            serializer.save()

    def perform_update(self, serializer):
        # 对比数据项，只有发生实际变更时才更新 updated_at
        instance = serializer.instance
        changed = False
        for field, value in serializer.validated_data.items():
            old_val = getattr(instance, field)
            # FileField 特殊处理：比较文件名
            if hasattr(old_val, 'name'):
                old_val = old_val.name
                new_val = getattr(value, 'name', value) if value else ''
            else:
                new_val = value
            if old_val != new_val:
                changed = True
                break
        if changed:
            serializer.save(updated_at=timezone.now())
        else:
            serializer.save()
