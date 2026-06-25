import json
from datetime import datetime
from pathlib import Path

from django.conf import settings
from django.http import HttpResponse
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core import serializers
from django.apps import apps

BACKUP_DIR = Path(settings.BASE_DIR) / 'data_backup'
BACKUP_DIR.mkdir(parents=True, exist_ok=True)

EXCLUDED_APPS = {'admin', 'auth', 'contenttypes', 'sessions', 'authtoken', 'socialaccount', 'authtoken'}


class BackupListView(APIView):
    """备份列表 / 创建备份"""

    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response(self._list_backup_files())

    def post(self, request):
        ts = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'pmos_backup_{ts}.json'
        filepath = BACKUP_DIR / filename

        data = {}
        for app_config in apps.get_app_configs():
            if app_config.label in EXCLUDED_APPS:
                continue
            for model in app_config.get_models():
                try:
                    qs = model.objects.all()
                    if qs.exists():
                        key = f'{app_config.label}.{model._meta.object_name}'
                        data[key] = json.loads(serializers.serialize('json', qs))
                except Exception:
                    pass

        data['_meta'] = {
            'created_at': datetime.now().isoformat(),
            'version': '1.0',
        }

        filepath.write_text(json.dumps(data, ensure_ascii=False, indent=2, default=str), encoding='utf-8')

        summary = {k: len(v) if isinstance(v, list) else 0 for k, v in data.items() if k != '_meta'}
        return Response({
            'filename': filename,
            'file_size': filepath.stat().st_size,
            'created_at': datetime.fromtimestamp(filepath.stat().st_mtime).isoformat(),
            'summary': summary,
            'total_tables': len(summary),
            'total_records': sum(summary.values()),
        }, status=status.HTTP_201_CREATED)

    def _list_backup_files(self):
        files = []
        if not BACKUP_DIR.exists():
            return files
        for fpath in sorted(BACKUP_DIR.iterdir(), key=lambda p: p.name, reverse=True):
            if fpath.is_file() and fpath.suffix == '.json':
                summary = {}
                try:
                    content = json.loads(fpath.read_text(encoding='utf-8'))
                    if isinstance(content, dict):
                        summary = {k: len(v) if isinstance(v, list) else 0 for k, v in content.items() if k != '_meta'}
                except Exception:
                    pass
                files.append({
                    'filename': fpath.name,
                    'file_size': fpath.stat().st_size,
                    'created_at': datetime.fromtimestamp(fpath.stat().st_mtime).isoformat(),
                    'summary': summary,
                    'total_tables': len(summary),
                    'total_records': sum(summary.values()),
                })
        return files


class BackupDetailView(APIView):
    """备份详情 / 恢复 / 删除"""

    permission_classes = [IsAdminUser]

    def get(self, request, filename):
        filepath = BACKUP_DIR / filename
        if not filepath.exists():
            return Response({'error': '备份文件不存在'}, status=status.HTTP_404_NOT_FOUND)

        raw = request.query_params.get('raw') == 'true'
        if raw:
            content = filepath.read_text(encoding='utf-8')
            return HttpResponse(content, content_type='application/json; charset=utf-8')

        data = json.loads(filepath.read_text(encoding='utf-8'))
        meta = data.pop('_meta', {})
        summary = {k: len(v) if isinstance(v, list) else 0 for k, v in data.items()}
        return Response({
            'filename': filename,
            'file_size': filepath.stat().st_size,
            'created_at': datetime.fromtimestamp(filepath.stat().st_mtime).isoformat(),
            'summary': summary,
            'total_tables': len(summary),
            'total_records': sum(summary.values()),
            'meta': meta,
        })

    def post(self, request, filename):
        filepath = BACKUP_DIR / filename
        if not filepath.exists():
            return Response({'error': '备份文件不存在'}, status=status.HTTP_404_NOT_FOUND)

        try:
            data = json.loads(filepath.read_text(encoding='utf-8'))
            data.pop('_meta', None)
            count = 0
            for key, records in data.items():
                if isinstance(records, list) and records:
                    try:
                        for obj in serializers.deserialize('json', json.dumps(records), ignorenonexistent=True):
                            obj.save()
                            count += 1
                    except Exception:
                        pass
            return Response({'status': 'ok', 'restored_records': count})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, filename):
        filepath = BACKUP_DIR / filename
        if not filepath.exists():
            return Response({'error': '备份文件不存在'}, status=status.HTTP_404_NOT_FOUND)
        filepath.unlink()
        return Response({'status': 'deleted'})
