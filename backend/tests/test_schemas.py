from datetime import UTC, datetime

import pytest
from pydantic import ValidationError

from app.schemas.auth import UserCreate, UserInDB, UserResponse, UserUpdate
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from app.schemas.resource import ResourceCreate, ResourceResponse, ResourceUpdate


class TestUserCreate:
    def test_valid_user_create(self):
        user = UserCreate(
            username="testuser",
            email="test@example.com",
            password="SecurePass123!",
            display_name="Test User",
        )
        assert user.username == "testuser"
        assert user.email == "test@example.com"
        assert user.role == "member"
        assert user.status == "active"

    def test_user_create_short_username(self):
        with pytest.raises(ValidationError):
            UserCreate(
                username="ab",
                email="test@example.com",
                password="SecurePass123!",
                display_name="Test User",
            )

    def test_user_create_invalid_email(self):
        with pytest.raises(ValidationError):
            UserCreate(
                username="testuser",
                email="invalid-email",
                password="SecurePass123!",
                display_name="Test User",
            )

    def test_user_create_weak_password(self):
        with pytest.raises(ValidationError):
            UserCreate(
                username="testuser",
                email="test@example.com",
                password="short",
                display_name="Test User",
            )

    def test_user_create_with_role_admin(self):
        user = UserCreate(
            username="adminuser",
            email="admin@example.com",
            password="SecurePass123!",
            display_name="Admin User",
            role="admin",
        )
        assert user.role == "admin"

    def test_user_create_invalid_role(self):
        with pytest.raises(ValidationError):
            UserCreate(
                username="testuser",
                email="test@example.com",
                password="SecurePass123!",
                display_name="Test User",
                role="invalid_role",
            )


class TestUserUpdate:
    def test_valid_user_update(self):
        update = UserUpdate(display_name="New Name", status="inactive")
        assert update.display_name == "New Name"
        assert update.status == "inactive"

    def test_user_update_all_fields(self):
        update = UserUpdate(
            display_name="Updated",
            avatar="http://example.com/avatar.png",
            department="IT",
            status="active",
        )
        assert update.avatar == "http://example.com/avatar.png"

    def test_user_update_empty(self):
        update = UserUpdate()
        assert update.display_name is None


class TestUserInDB:
    def test_user_in_db(self):
        user = UserInDB(
            username="testuser",
            email="test@example.com",
            password_hash="hashed_password_123",
            display_name="Test User",
        )
        assert user.password_hash == "hashed_password_123"
        assert user.permissions == []


class TestUserResponse:
    def test_user_response_with_alias(self):
        user = UserResponse(
            _id="507f191e810c19729de860ea",
            username="testuser",
            email="test@example.com",
            display_name="Test User",
        )
        assert user.id == "507f191e810c19729de860ea"


class TestProjectCreate:
    def test_valid_project_create(self):
        project = ProjectCreate(
            code="PRJ-001",
            name="Test Project",
            owner_id="owner123",
            start_date=datetime.now(UTC),
        )
        assert project.code == "PRJ-001"
        assert project.status == "planning"
        assert project.priority == "medium"
        assert project.budget_total == 0.0
        assert project.progress == 0.0

    def test_project_create_with_dates(self):
        start = datetime.now(UTC)
        end = datetime(2026, 12, 31, tzinfo=UTC)
        project = ProjectCreate(
            code="PRJ-002",
            name="Dated Project",
            owner_id="owner123",
            start_date=start,
            end_date=end,
        )
        assert project.start_date == start
        assert project.end_date == end

    def test_project_create_missing_code(self):
        with pytest.raises(ValidationError):
            ProjectCreate(
                name="Test Project",
                owner_id="owner123",
                start_date=datetime.now(UTC),
            )

    def test_project_create_missing_name(self):
        with pytest.raises(ValidationError):
            ProjectCreate(
                code="PRJ-001",
                owner_id="owner123",
                start_date=datetime.now(UTC),
            )

    def test_project_create_invalid_status(self):
        with pytest.raises(ValidationError):
            ProjectCreate(
                code="PRJ-001",
                name="Test Project",
                owner_id="owner123",
                start_date=datetime.now(UTC),
                status="invalid_status",
            )

    def test_project_create_negative_progress(self):
        with pytest.raises(ValidationError):
            ProjectCreate(
                code="PRJ-001",
                name="Test Project",
                owner_id="owner123",
                start_date=datetime.now(UTC),
                progress=-10,
            )

    def test_project_create_progress_over_100(self):
        with pytest.raises(ValidationError):
            ProjectCreate(
                code="PRJ-001",
                name="Test Project",
                owner_id="owner123",
                start_date=datetime.now(UTC),
                progress=150,
            )


class TestProjectUpdate:
    def test_valid_project_update(self):
        update = ProjectUpdate(name="Updated Name", progress=75.0)
        assert update.name == "Updated Name"
        assert update.progress == 75.0

    def test_project_update_partial(self):
        update = ProjectUpdate(status="completed")
        assert update.status == "completed"
        assert update.name is None

    def test_project_update_empty(self):
        update = ProjectUpdate()
        assert update.name is None


class TestProjectResponse:
    def test_project_response_with_budget(self):
        project = ProjectResponse(
            _id="507f191e810c19729de860ea",
            code="PRJ-001",
            name="Test Project",
            owner_id="owner123",
            start_date=datetime.now(UTC),
            budget_total=100000,
            budget_used=50000,
        )
        assert project.budget["total"] == 100000
        assert project.budget["used"] == 50000
        assert project.budget["currency"] == "CNY"


class TestTaskCreate:
    def test_valid_task_create(self):
        task = TaskCreate(
            project_id="proj123",
            title="Test Task",
            reporter_id="reporter123",
        )
        assert task.status == "todo"
        assert task.priority == "medium"
        assert task.type == "task"

    def test_task_create_with_dates(self):
        task = TaskCreate(
            project_id="proj123",
            title="Test Task",
            reporter_id="reporter123",
            start_date=datetime.now(UTC),
            due_date=datetime(2026, 12, 31, tzinfo=UTC),
        )
        assert task.start_date is not None
        assert task.due_date is not None

    def test_task_create_missing_title(self):
        with pytest.raises(ValidationError):
            TaskCreate(
                project_id="proj123",
                reporter_id="reporter123",
            )

    def test_task_create_invalid_status(self):
        with pytest.raises(ValidationError):
            TaskCreate(
                project_id="proj123",
                title="Test Task",
                reporter_id="reporter123",
                status="invalid",
            )


class TestTaskUpdate:
    def test_valid_task_update(self):
        update = TaskUpdate(status="done", title="Completed Task")
        assert update.status == "done"

    def test_task_update_empty(self):
        update = TaskUpdate()
        assert update.status is None


class TestResourceCreate:
    def test_valid_resource_create(self):
        resource = ResourceCreate(
            name="Dev Resource",
            type="human",
        )
        assert resource.type == "human"
        assert resource.capacity == 100.0
        assert resource.allocated == 0.0
        assert resource.availability == "available"

    def test_resource_create_equipment(self):
        resource = ResourceCreate(
            name="Server",
            type="equipment",
            category="Infrastructure",
        )
        assert resource.type == "equipment"

    def test_resource_create_budget(self):
        resource = ResourceCreate(
            name="Q4 Budget",
            type="budget",
            capacity=50000,
        )
        assert resource.type == "budget"
        assert resource.capacity == 50000

    def test_resource_create_missing_name(self):
        with pytest.raises(ValidationError):
            ResourceCreate(type="human")

    def test_resource_create_invalid_type(self):
        with pytest.raises(ValidationError):
            ResourceCreate(name="Test", type="invalid")

    def test_resource_create_negative_capacity(self):
        with pytest.raises(ValidationError):
            ResourceCreate(name="Test", type="human", capacity=-10)


class TestResourceUpdate:
    def test_valid_resource_update(self):
        update = ResourceUpdate(name="Updated", capacity=200)
        assert update.name == "Updated"
        assert update.capacity == 200

    def test_resource_update_empty(self):
        update = ResourceUpdate()
        assert update.name is None


class TestModelIdFields:
    def test_all_responses_have_id_alias(self):
        assert hasattr(UserResponse.model_fields.get("id"), "alias")
        assert hasattr(ProjectResponse.model_fields.get("id"), "alias")
