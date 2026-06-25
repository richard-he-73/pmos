import pytest
import os
from django.conf import settings


BACKUP_DIR = os.path.join(settings.BASE_DIR, 'data_backup')


@pytest.mark.django_db
class TestBackupAPI:
    """数据备份 API 测试"""

    def test_backup_list_as_admin(self, admin_client):
        res = admin_client.get('/api/v1/system/backup/')
        assert res.status_code == 200
        assert isinstance(res.data, list)

    def test_backup_list_as_normal(self, auth_client):
        res = auth_client.get('/api/v1/system/backup/')
        assert res.status_code == 403

    def test_create_backup_as_admin(self, admin_client):
        res = admin_client.post('/api/v1/system/backup/')
        assert res.status_code == 201
        assert 'filename' in res.data
        fpath = os.path.join(BACKUP_DIR, res.data['filename'])
        if os.path.exists(fpath):
            os.remove(fpath)

    def test_create_backup_as_normal(self, auth_client):
        res = auth_client.post('/api/v1/system/backup/')
        assert res.status_code == 403

    def test_backup_detail_not_found(self, admin_client):
        res = admin_client.get('/api/v1/system/backup/nonexistent.json/')
        assert res.status_code == 404

    def test_delete_backup_not_found(self, admin_client):
        res = admin_client.delete('/api/v1/system/backup/nonexistent.json/')
        assert res.status_code == 404

    def test_full_backup_cycle(self, admin_client):
        create_res = admin_client.post('/api/v1/system/backup/')
        assert create_res.status_code == 201
        filename = create_res.data['filename']
        fpath = os.path.join(BACKUP_DIR, filename)
        try:
            detail_res = admin_client.get(f'/api/v1/system/backup/{filename}/')
            assert detail_res.status_code == 200
            assert detail_res.data['filename'] == filename
            list_res = admin_client.get('/api/v1/system/backup/')
            assert any(f['filename'] == filename for f in list_res.data)
            del_res = admin_client.delete(f'/api/v1/system/backup/{filename}/')
            assert del_res.status_code == 200
            assert del_res.data['status'] == 'deleted'
        finally:
            if os.path.exists(fpath):
                os.remove(fpath)
