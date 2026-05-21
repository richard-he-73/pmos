import pytest
from bson import ObjectId
from datetime import UTC, datetime
from fastapi.testclient import TestClient

from tests.conftest import get_auth_headers


class TestStatsEndpoints:
    def test_get_stats(self, client: TestClient, mock_db, auth_token):
        mock_db.projects._aggregate_result = [
            {"_id": "active", "count": 5},
            {"_id": "completed", "count": 3},
        ]
        mock_db.tasks._aggregate_result = [
            {"_id": "todo", "count": 10},
            {"_id": "done", "count": 7},
        ]
        mock_db.resources._aggregate_result = [
            {"_id": "human", "count": 8},
        ]
        mock_db.projects._count_documents_result = 10
        mock_db.tasks._count_documents_result = 25
        mock_db.resources._count_documents_result = 15

        response = client.get(
            "/api/v1/stats",
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 200
        data = response.json()
        assert "projects" in data
        assert "tasks" in data
        assert "resources" in data
        assert data["projects"]["total"] == 10
        assert data["tasks"]["total"] == 25
        assert data["resources"]["total"] == 15

    def test_get_stats_empty(self, client: TestClient, mock_db, auth_token):
        mock_db.projects._aggregate_result = []
        mock_db.tasks._aggregate_result = []
        mock_db.resources._aggregate_result = []
        mock_db.projects._count_documents_result = 0
        mock_db.tasks._count_documents_result = 0
        mock_db.resources._count_documents_result = 0

        response = client.get(
            "/api/v1/stats",
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 200
        data = response.json()
        assert data["projects"]["total"] == 0
        assert data["tasks"]["total"] == 0
        assert data["resources"]["total"] == 0
        assert data["projects"]["by_status"] == {}
