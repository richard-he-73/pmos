from datetime import UTC, datetime, timedelta

import pytest
from bson import ObjectId
from fastapi.testclient import TestClient
from unittest.mock import MagicMock

from tests.conftest import get_auth_headers


class TestProjectEndpoints:
    @pytest.fixture
    def project_data(self):
        return {
            "code": "PRJ-2024-001",
            "name": "Test Project",
            "description": "A test project",
            "owner_id": "owner123",
            "status": "planning",
            "priority": "medium",
            "start_date": (datetime.now(UTC) - timedelta(days=10)).isoformat(),
            "budget_total": 100000,
            "budget_used": 50000,
            "progress": 25.0,
            "tags": ["test", "demo"],
        }

    def test_create_project(self, client: TestClient, mock_db, auth_token):
        project_data = {
            "code": "PRJ-2024-002",
            "name": "New Project",
            "owner_id": "owner123",
            "start_date": datetime.now(UTC).isoformat(),
        }

        mock_db.projects._find_one_result = None

        response = client.post(
            "/api/v1/projects",
            json=project_data,
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "New Project"

    def test_create_project_duplicate_code(
        self, client: TestClient, mock_db, auth_token, project_data
    ):
        mock_db.projects._find_one_result = {"_id": ObjectId(), "code": "PRJ-2024-001"}

        response = client.post(
            "/api/v1/projects",
            json=project_data,
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 400
        assert "已存在" in response.json()["detail"]

    def test_list_projects(self, client: TestClient, mock_db, auth_token):
        mock_project = {
            "_id": ObjectId(),
            "code": "PRJ-001",
            "name": "Project 1",
            "owner_id": "owner1",
            "status": "active",
            "priority": "high",
            "start_date": datetime.now(UTC),
            "end_date": None,
            "budget_total": 100000,
            "budget_used": 50000,
            "budget_currency": "CNY",
            "progress": 50.0,
            "tags": [],
            "created_at": datetime.now(UTC),
            "updated_at": datetime.now(UTC),
        }
        mock_db.projects._find_items = [mock_project]

        response = client.get(
            "/api/v1/projects",
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["name"] == "Project 1"

    def test_list_projects_with_status_filter(
        self, client: TestClient, mock_db, auth_token
    ):
        mock_db.projects._find_items = []

        response = client.get(
            "/api/v1/projects?status_filter=active",
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 200

    def test_get_project_success(self, client: TestClient, mock_db, auth_token):
        project_id = str(ObjectId())
        mock_db.projects._find_one_result = {
            "_id": ObjectId(project_id),
            "code": "PRJ-001",
            "name": "Test Project",
            "owner_id": "owner1",
            "status": "active",
            "priority": "high",
            "start_date": datetime.now(UTC),
            "budget_total": 100000,
            "budget_used": 50000,
            "budget_currency": "CNY",
            "progress": 50.0,
            "tags": [],
            "created_at": datetime.now(UTC),
            "updated_at": datetime.now(UTC),
        }

        response = client.get(
            f"/api/v1/projects/{project_id}",
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Test Project"

    def test_get_project_not_found(self, client: TestClient, mock_db, auth_token):
        project_id = str(ObjectId())
        mock_db.projects._find_one_result = None

        response = client.get(
            f"/api/v1/projects/{project_id}",
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 404

    def test_get_project_invalid_id(self, client: TestClient, auth_token):
        response = client.get(
            "/api/v1/projects/invalid-id",
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 400

    def test_update_project(self, client: TestClient, mock_db, auth_token):
        project_id = str(ObjectId())
        update_data = {"name": "Updated Project Name", "progress": 75.0}

        mock_db.projects._update_one_result = MagicMock(matched_count=1)
        mock_db.projects._find_one_result = {
            "_id": ObjectId(project_id),
            "code": "PRJ-001",
            "name": "Updated Project Name",
            "owner_id": "owner1",
            "status": "active",
            "priority": "high",
            "start_date": datetime.now(UTC),
            "budget_total": 100000,
            "budget_used": 50000,
            "budget_currency": "CNY",
            "progress": 75.0,
            "tags": [],
            "created_at": datetime.now(UTC),
            "updated_at": datetime.now(UTC),
        }

        response = client.put(
            f"/api/v1/projects/{project_id}",
            json=update_data,
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Project Name"

    def test_update_project_empty_data(self, client: TestClient, mock_db, auth_token):
        project_id = str(ObjectId())

        response = client.put(
            f"/api/v1/projects/{project_id}",
            json={},
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 400

    def test_delete_project(self, client: TestClient, mock_db, auth_token):
        project_id = str(ObjectId())
        mock_db.projects._delete_one_result = MagicMock(deleted_count=1)

        response = client.delete(
            f"/api/v1/projects/{project_id}",
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 204

    def test_delete_project_not_found(self, client: TestClient, mock_db, auth_token):
        project_id = str(ObjectId())
        mock_db.projects._delete_one_result = MagicMock(deleted_count=0)

        response = client.delete(
            f"/api/v1/projects/{project_id}",
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 404

    def test_clone_project(self, client: TestClient, mock_db, auth_token):
        original_id = str(ObjectId())
        mock_db.projects._find_one_result = {
            "_id": ObjectId(original_id),
            "code": "PRJ-001",
            "name": "Original Project",
            "owner_id": "owner1",
            "status": "active",
            "priority": "high",
            "start_date": datetime.now(UTC),
            "budget_total": 100000,
            "budget_used": 50000,
            "budget_currency": "CNY",
            "progress": 50.0,
            "tags": [],
            "description": "Test",
            "stakeholders": [],
            "created_at": datetime.now(UTC),
            "updated_at": datetime.now(UTC),
        }

        response = client.post(
            f"/api/v1/projects/{original_id}/clone",
            json={"name": "Cloned Project"},
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 201
        data = response.json()
        assert "COPY" in data["code"]

    def test_clone_project_not_found(self, client: TestClient, mock_db, auth_token):
        project_id = str(ObjectId())
        mock_db.projects._find_one_result = None

        response = client.post(
            f"/api/v1/projects/{project_id}/clone",
            json={"name": "Clone"},
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 404
