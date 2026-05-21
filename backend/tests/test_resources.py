import pytest
from datetime import UTC, datetime
from bson import ObjectId
from fastapi.testclient import TestClient
from unittest.mock import MagicMock

from tests.conftest import get_auth_headers


class TestResourceEndpoints:
    @pytest.fixture
    def resource_data(self):
        return {
            "name": "Developer 1",
            "type": "human",
            "category": "Development",
            "capacity": 100,
            "allocated": 50,
            "availability": "available",
            "skills": ["Python", "FastAPI"],
            "cost_per_hour": 100,
        }

    def test_create_resource(
        self, client: TestClient, mock_db, auth_token, resource_data
    ):
        response = client.post(
            "/api/v1/resources",
            json=resource_data,
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Developer 1"

    def test_create_resource_missing_name(
        self, client: TestClient, mock_db, auth_token
    ):
        resource_data = {"type": "human"}

        response = client.post(
            "/api/v1/resources",
            json=resource_data,
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 422

    def test_list_resources(self, client: TestClient, mock_db, auth_token):
        mock_resources = [
            {
                "_id": ObjectId(),
                "name": "Resource 1",
                "type": "human",
                "category": "Dev",
                "capacity": 100,
                "allocated": 50,
                "availability": "available",
                "skills": [],
                "cost_per_hour": 100,
                "created_at": datetime.now(UTC),
                "updated_at": datetime.now(UTC),
            }
        ]
        mock_db.resources._find_items = mock_resources

        response = client.get(
            "/api/v1/resources",
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1

    def test_list_resources_with_type_filter(
        self, client: TestClient, mock_db, auth_token
    ):
        mock_db.resources._find_items = []

        response = client.get(
            "/api/v1/resources?type_filter=human",
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 200

    def test_get_resource_success(self, client: TestClient, mock_db, auth_token):
        resource_id = str(ObjectId())
        mock_db.resources._find_one_result = {
            "_id": ObjectId(resource_id),
            "name": "Test Resource",
            "type": "equipment",
            "category": "Server",
            "capacity": 100,
            "allocated": 0,
            "availability": "available",
            "skills": [],
            "cost_per_hour": None,
            "created_at": datetime.now(UTC),
            "updated_at": datetime.now(UTC),
        }

        response = client.get(
            f"/api/v1/resources/{resource_id}",
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 200

    def test_get_resource_not_found(self, client: TestClient, mock_db, auth_token):
        resource_id = str(ObjectId())
        mock_db.resources._find_one_result = None

        response = client.get(
            f"/api/v1/resources/{resource_id}",
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 404

    def test_update_resource(self, client: TestClient, mock_db, auth_token):
        resource_id = str(ObjectId())
        update_data = {"name": "Updated Resource", "capacity": 200}

        mock_db.resources._update_one_result = MagicMock(matched_count=1)
        mock_db.resources._find_one_result = {
            "_id": ObjectId(resource_id),
            "name": "Updated Resource",
            "type": "human",
            "category": "Dev",
            "capacity": 200,
            "allocated": 50,
            "availability": "available",
            "skills": [],
            "cost_per_hour": 100,
            "created_at": datetime.now(UTC),
            "updated_at": datetime.now(UTC),
        }

        response = client.put(
            f"/api/v1/resources/{resource_id}",
            json=update_data,
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 200

    def test_update_resource_empty_data(self, client: TestClient, mock_db, auth_token):
        resource_id = str(ObjectId())

        response = client.put(
            f"/api/v1/resources/{resource_id}",
            json={},
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 400

    def test_delete_resource(self, client: TestClient, mock_db, auth_token):
        resource_id = str(ObjectId())
        mock_db.resources._delete_one_result = MagicMock(deleted_count=1)

        response = client.delete(
            f"/api/v1/resources/{resource_id}",
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 204

    def test_delete_resource_not_found(self, client: TestClient, mock_db, auth_token):
        resource_id = str(ObjectId())
        mock_db.resources._delete_one_result = MagicMock(deleted_count=0)

        response = client.delete(
            f"/api/v1/resources/{resource_id}",
            headers=get_auth_headers(auth_token),
        )

        assert response.status_code == 404
