import asyncio
from datetime import UTC, datetime
from typing import Callable
from unittest.mock import MagicMock

import pytest
from bson import ObjectId
from fastapi.testclient import TestClient

from app.core.security import create_access_token, get_password_hash


def async_return(value):
    """Create a coroutine that returns a value."""

    async def coro():
        return value

    return coro()


class MockCursor:
    def __init__(self, items):
        self.items = items

    def skip(self, n):
        return self

    def limit(self, n):
        return self

    def sort(self, *args):
        return self

    async def to_list(self, length):
        return self.items


class MockCollection:
    def __init__(self):
        self._find_one_result = None
        self._insert_one_result = MagicMock(inserted_id=ObjectId())
        self._update_one_result = MagicMock(matched_count=1)
        self._delete_one_result = MagicMock(deleted_count=1)
        self._find_items = []
        self._aggregate_result = []
        self._count_documents_result = 0

    def find_one(self, *args, **kwargs):
        return async_return(self._find_one_result)

    def insert_one(self, *args, **kwargs):
        return async_return(self._insert_one_result)

    def update_one(self, *args, **kwargs):
        return async_return(self._update_one_result)

    def delete_one(self, *args, **kwargs):
        return async_return(self._delete_one_result)

    def find(self, *args, **kwargs):
        return MockCursor(self._find_items)

    def aggregate(self, *args, **kwargs):
        return MockCursor(self._aggregate_result)

    async def count_documents(self, *args, **kwargs):
        return self._count_documents_result


@pytest.fixture
def mock_db():
    mock = MagicMock()
    mock.users = MockCollection()
    mock.projects = MockCollection()
    mock.tasks = MockCollection()
    mock.resources = MockCollection()
    return mock


@pytest.fixture
def test_user_id():
    return str(ObjectId())


@pytest.fixture
def test_user(test_user_id):
    return {
        "_id": ObjectId(test_user_id),
        "username": "testuser",
        "email": "test@example.com",
        "display_name": "Test User",
        "password_hash": get_password_hash("testpassword123"),
        "role": "member",
        "department": "Test",
        "status": "active",
        "permissions": [],
        "created_at": datetime.now(UTC),
        "updated_at": datetime.now(UTC),
    }


@pytest.fixture
def auth_token(test_user_id):
    return create_access_token(
        data={"sub": test_user_id, "role": "member"},
    )


@pytest.fixture
def admin_token(test_user_id):
    return create_access_token(
        data={"sub": test_user_id, "role": "admin"},
    )


@pytest.fixture
def client(mock_db):
    from app.main import create_app
    from app.dependencies import get_current_user
    from app.core.database import get_db

    from pydantic import BaseModel

    class MockUser(BaseModel):
        id: str = str(ObjectId())
        username: str = "testuser"
        email: str = "test@example.com"
        display_name: str = "Test User"
        password_hash: str = ""
        role: str = "member"
        status: str = "active"
        permissions: list = []
        created_at: datetime = datetime.now(UTC)
        updated_at: datetime = datetime.now(UTC)

    test_user_data = MockUser()

    def override_get_db():
        return mock_db

    def override_get_current_user():
        return test_user_data

    test_app = create_app()
    test_app.dependency_overrides[get_db] = override_get_db
    test_app.dependency_overrides[get_current_user] = override_get_current_user

    with TestClient(test_app) as test_client:
        yield test_client

    test_app.dependency_overrides.clear()


def get_auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}
