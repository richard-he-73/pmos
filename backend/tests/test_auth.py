import pytest
from datetime import UTC, datetime
from unittest.mock import MagicMock
from bson import ObjectId
from fastapi.testclient import TestClient

from app.core.security import verify_password
from tests.conftest import get_auth_headers


class TestAuthEndpoints:
    def test_register_success(self, client: TestClient, mock_db):
        user_data = {
            "username": "newuser",
            "email": "new@example.com",
            "password": "SecurePass123!",
            "display_name": "New User",
            "role": "member",
            "department": "IT",
        }

        response = client.post("/api/v1/auth/register", json=user_data)

        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "newuser"

    def test_register_duplicate_username(self, client: TestClient, mock_db, test_user):
        mock_db.users._find_one_result = test_user

        user_data = {
            "username": "testuser",
            "email": "different@example.com",
            "password": "SecurePass123!",
            "display_name": "New User",
        }

        response = client.post("/api/v1/auth/register", json=user_data)

        assert response.status_code == 400
        assert "已存在" in response.json()["detail"]

    def test_register_weak_password(self, client: TestClient):
        user_data = {
            "username": "newuser",
            "email": "new@example.com",
            "password": "short",
            "display_name": "New User",
        }

        response = client.post("/api/v1/auth/register", json=user_data)

        assert response.status_code == 422

    def test_register_invalid_email(self, client: TestClient):
        user_data = {
            "username": "newuser",
            "email": "invalid-email",
            "password": "SecurePass123!",
            "display_name": "New User",
        }

        response = client.post("/api/v1/auth/register", json=user_data)

        assert response.status_code == 422

    def test_login_success(self, client: TestClient, mock_db, test_user):
        mock_db.users._find_one_result = test_user

        login_data = {"username": "testuser", "password": "testpassword123"}

        response = client.post("/api/v1/auth/login", json=login_data)

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client: TestClient, mock_db, test_user):
        mock_db.users._find_one_result = test_user

        login_data = {"username": "testuser", "password": "wrongpassword"}

        response = client.post("/api/v1/auth/login", json=login_data)

        assert response.status_code == 401

    def test_login_user_not_found(self, client: TestClient, mock_db):
        mock_db.users._find_one_result = None

        login_data = {"username": "nonexistent", "password": "password123"}

        response = client.post("/api/v1/auth/login", json=login_data)

        assert response.status_code == 401

    def test_login_missing_fields(self, client: TestClient):
        response = client.post("/api/v1/auth/login", json={"username": "test"})
        assert response.status_code == 422

    def test_refresh_token_success(
        self, client: TestClient, mock_db, test_user, test_user_id
    ):
        from app.core.security import create_refresh_token

        mock_db.users._find_one_result = test_user

        refresh_tk = create_refresh_token(data={"sub": test_user_id, "role": "member"})

        response = client.post(
            "/api/v1/auth/refresh",
            params={"token": refresh_tk},
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data

    def test_refresh_token_invalid(self, client: TestClient):
        response = client.post(
            "/api/v1/auth/refresh",
            params={"token": "invalid-token"},
        )

        assert response.status_code == 401

    def test_health_check(self, client: TestClient):
        response = client.get("/health")

        assert response.status_code == 200
        assert response.json()["status"] == "ok"

    def test_root_endpoint(self, client: TestClient):
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "version" in data
        assert "docs" in data
