import uuid
from datetime import datetime
from pathlib import Path

from django.conf import settings
from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from .models import CommType, CommRecord
from .serializers import CommTypeSerializer, CommRecordSerializer


class CommTypeViewSet(viewsets.ModelViewSet):
    queryset = CommType.objects.all()
    serializer_class = CommTypeSerializer

    def get_queryset(self):
        qs = CommType.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs


class CommRecordViewSet(viewsets.ModelViewSet):
    queryset = CommRecord.objects.all()
    serializer_class = CommRecordSerializer

    def get_queryset(self):
        qs = CommRecord.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_file(request):
    """上传附件，支持 docx/xlsx/pptx/pdf"""
    file = request.FILES.get('file')
    if not file:
        return JsonResponse({'error': '请选择文件'}, status=400)

    ext = Path(file.name).suffix.lower()
    if ext not in ('.docx', '.xlsx', '.pptx', '.pdf'):
        return JsonResponse({'error': '仅支持 docx/xlsx/pptx/pdf 格式'}, status=400)

    # 按日期分目录存储
    date_str = datetime.now().strftime('%Y/%m/%d')
    upload_dir = settings.MEDIA_ROOT / 'comm_attachments' / date_str
    Path(upload_dir).mkdir(parents=True, exist_ok=True)

    # 生成唯一文件名
    unique_name = f"{uuid.uuid4().hex}{ext}"
    filepath = upload_dir / unique_name

    with Path(filepath).open('wb+') as f:
        for chunk in file.chunks():
            f.write(chunk)

    url = f"{settings.MEDIA_URL}comm_attachments/{date_str}/{unique_name}"
    return JsonResponse({'name': file.name, 'url': url, 'size': file.size})
