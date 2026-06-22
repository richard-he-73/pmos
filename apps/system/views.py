import os, json, io
from datetime import datetime
from django.conf import settings
from django.http import JsonResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.core import serializers
from django.apps import apps
from django.db import connection

BACKUP_DIR = os.path.join(settings.BASE_DIR, 'data_backup')
os.makedirs(BACKUP_DIR, exist_ok=True)

EXCLUDED_APPS = {'admin', 'auth', 'contenttypes', 'sessions', 'authtoken', 'socialaccount', 'authtoken'}


def _get_backup_summary():
    """获取所有表的数据条数统计"""
    summary = {}
    for app_config in apps.get_app_configs():
        if app_config.label in EXCLUDED_APPS:
            continue
        for model in app_config.get_models():
            try:
                count = model.objects.count()
                if count > 0:
                    key = f'{app_config.label}.{model._meta.object_name}'
                    summary[key] = count
            except Exception:
                pass
    return summary


def _list_backup_files():
    """列出 data_backup 目录下的所有备份文件"""
    files = []
    if not os.path.exists(BACKUP_DIR):
        return files
    for fname in sorted(os.listdir(BACKUP_DIR), reverse=True):
        fpath = os.path.join(BACKUP_DIR, fname)
        if os.path.isfile(fpath) and fname.endswith('.json'):
            stat = os.stat(fpath)
            # 读取文件头部获取备份摘要
            summary = {}
            try:
                with open(fpath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if isinstance(data, dict):
                        summary = {k: len(v) if isinstance(v, list) else 0 for k, v in data.items() if k != '_meta'}
            except Exception:
                pass
            files.append({
                'filename': fname,
                'file_size': stat.st_size,
                'created_at': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                'summary': summary,
                'total_tables': len(summary),
                'total_records': sum(summary.values()),
            })
    return files


@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def backup_list(request):
    """列出备份 / 创建备份"""
    if request.method == 'GET':
        return Response(_list_backup_files())

    # POST: 创建备份
    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f'pmos_backup_{ts}.json'
    filepath = os.path.join(BACKUP_DIR, filename)

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

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2, default=str)

    stat = os.stat(filepath)
    summary = {k: len(v) if isinstance(v, list) else 0 for k, v in data.items() if k != '_meta'}
    return Response({
        'filename': filename,
        'file_size': stat.st_size,
        'created_at': datetime.fromtimestamp(stat.st_mtime).isoformat(),
        'summary': summary,
        'total_tables': len(summary),
        'total_records': sum(summary.values()),
    }, status=status.HTTP_201_CREATED)


@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAdminUser])
def backup_detail(request, filename):
    """备份详情 / 恢复 / 删除"""
    filepath = os.path.join(BACKUP_DIR, filename)
    if not os.path.exists(filepath):
        return Response({'error': '备份文件不存在'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        stat = os.stat(filepath)
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        meta = data.pop('_meta', {})
        summary = {k: len(v) if isinstance(v, list) else 0 for k, v in data.items()}
        return Response({
            'filename': filename,
            'file_size': stat.st_size,
            'created_at': datetime.fromtimestamp(stat.st_mtime).isoformat(),
            'summary': summary,
            'total_tables': len(summary),
            'total_records': sum(summary.values()),
            'meta': meta,
        })

    elif request.method == 'POST':
        # 恢复备份
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            data.pop('_meta', None)
            count = 0
            for key, records in data.items():
                if isinstance(records, list) and records:
                    try:
                        serializers.deserialize('json', json.dumps(records), ignorenonexistent=True)
                        # 直接用 Raw SQL 或 loaddata 方式恢复
                        # 先用 deserialize 逐条处理
                        for obj in serializers.deserialize('json', json.dumps(records), ignorenonexistent=True):
                            obj.save()
                            count += 1
                    except Exception as e:
                        pass
            return Response({'status': 'ok', 'restored_records': count})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    elif request.method == 'DELETE':
        os.remove(filepath)
        return Response({'status': 'deleted'})
