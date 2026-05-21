from datetime import UTC, datetime, timedelta

import pytest
from bson import ObjectId
from fastapi.testclient import TestClient
from unittest.mock import MagicMock

from tests.conftest import get_auth_headers


class TestTaskEndpoints:
    @pytest.fixture
    def task_data(self):
        return {
            "project_id": "proj123",
            "title": "Test Task",
            "description": "A test task",
            "reporter_id": "reporter123",
            "status": "todo",
            "priority": "medium",
            "type": "task",
            "tags": ["test"],
        }

    def test_create_task(self, client: TestClient, mock_db, auth_token, task_data):
        response = client.post(
            "/api/v1/tasks",
            json=task_data,
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Task"

    def test_create_task_missing_title(self, client: TestClient, mock_db, auth_token):
        task_data = {
            "project_id": "proj123",
            "reporter_id": "reporter123",
        }

        response = client.post(
            "/api/v1/tasks",
            json=task_data,
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 422

    def test_list_tasks(self, client: TestClient, mock_db, auth_token):
        mock_tasks = [
            {
                "_id": ObjectId(),
                "project_id": "proj123",
                "title": "Task 1",
                "description": "Test",
                "reporter_id": "reporter123",
                "status": "todo",
                "priority": "high",
                "type": "feature",
                "estimate_hours": 8,
                "actual_hours": None,
                "start_date": None,
                "due_date": None,
                "completed_at": None,
                "dependencies": [],
                "tags": [],
                "attachments": [],
                "created_at": datetime.now(UTC),
                "updated_at": datetime.now(UTC),
            }
        ]
        mock_db.tasks._find_items = mock_tasks

        response = client.get(
            "/api/v1/tasks",
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["title"] == "Task 1"

    def test_list_tasks_with_project_filter(
        self, client: TestClient, mock_db, auth_token
    ):
        mock_db.tasks._find_items = []

        response = client.get(
            "/api/v1/tasks?project_id=proj123",
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 200

    def test_list_tasks_with_status_filter(
        self, client: TestClient, mock_db, auth_token
    ):
        mock_db.tasks._find_items = []

        response = client.get(
            "/api/v1/tasks?status_filter=done",
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 200

    def test_get_task_success(self, client: TestClient, mock_db, auth_token):
        task_id = str(ObjectId())
        mock_db.tasks._find_one_result = {
            "_id": ObjectId(task_id),
            "project_id": "proj123",
            "title": "Test Task",
            "description": "Test",
            "reporter_id": "reporter123",
            "status": "in_progress",
            "priority": "high",
            "type": "bug",
            "estimate_hours": 4,
            "actual_hours": 2,
            "start_date": datetime.now(UTC),
            "due_date": None,
            "completed_at": None,
            "dependencies": [],
            "tags": ["urgent"],
            "attachments": [],
            "created_at": datetime.now(UTC),
            "updated_at": datetime.now(UTC),
        }

        response = client.get(
            f"/api/v1/tasks/{task_id}",
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Test Task"

    def test_get_task_not_found(self, client: TestClient, mock_db, auth_token):
        task_id = str(ObjectId())
        mock_db.tasks._find_one_result = None

        response = client.get(
            f"/api/v1/tasks/{task_id}",
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 404

    def test_get_task_invalid_id(self, client: TestClient, auth_token):
        response = client.get(
            "/api/v1/tasks/invalid-id",
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 400

    def test_update_task(self, client: TestClient, mock_db, auth_token):
        task_id = str(ObjectId())
        update_data = {"status": "done", "title": "Completed Task"}

        mock_db.tasks._update_one_result = MagicMock(matched_count=1)
        mock_db.tasks._find_one_result = {
            "_id": ObjectId(task_id),
            "project_id": "proj123",
            "title": "Completed Task",
            "description": "Test",
            "reporter_id": "reporter123",
            "status": "done",
            "priority": "high",
            "type": "bug",
            "estimate_hours": 4,
            "actual_hours": None,
            "start_date": None,
            "due_date": None,
            "completed_at": datetime.now(UTC),
            "dependencies": [],
            "tags": [],
            "attachments": [],
            "created_at": datetime.now(UTC),
            "updated_at": datetime.now(UTC),
        }

        response = client.put(
            f"/api/v1/tasks/{task_id}",
            json=update_data,
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "done"

    def test_update_task_empty_data(self, client: TestClient, mock_db, auth_token):
        task_id = str(ObjectId())

        response = client.put(
            f"/api/v1/tasks/{task_id}",
            json={},
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 400

    def test_update_task_not_found(self, client: TestClient, mock_db, auth_token):
        task_id = str(ObjectId())
        mock_db.tasks._update_one_result = MagicMock(matched_count=0)

        response = client.put(
            f"/api/v1/tasks/{task_id}",
            json={"title": "New Title"},
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 404

    def test_delete_task(self, client: TestClient, mock_db, auth_token):
        task_id = str(ObjectId())
        mock_db.tasks._delete_one_result = MagicMock(deleted_count=1)

        response = client.delete(
            f"/api/v1/tasks/{task_id}",
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 204

    def test_delete_task_not_found(self, client: TestClient, mock_db, auth_token):
        task_id = str(ObjectId())
        mock_db.tasks._delete_one_result = MagicMock(deleted_count=0)

        response = client.delete(
            f"/api/v1/tasks/{task_id}",
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 404
