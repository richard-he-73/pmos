import pytest
from datetime import datetime, UTC
from bson import ObjectId
from unittest.mock import MagicMock, AsyncMock

from app.schemas.permission import RoleCreate, RoleUpdate, RoleResponse, UserGroupCreate, OperationLogCreate
from app.schemas.notification import NotificationCreate, NotificationUpdate, NotificationResponse
from app.schemas.module import (
    CommunicationCreate, ConfigItemCreate, DrillPlanCreate, DeploymentPlanCreate, WorkRecordCreate,
)


class TestRoleSchema:
    def test_role_create_valid(self):
        role = RoleCreate(
            name="Project Manager",
            description="Can manage projects",
            permissions=["project.read", "project.write"],
            is_system=False,
        )
        assert role.name == "Project Manager"
        assert len(role.permissions) == 2
        assert not role.is_system

    def test_role_update_partial(self):
        update = RoleUpdate(permissions=["project.read", "task.write"])
        data = update.model_dump(exclude_unset=True)
        assert "permissions" in data
        assert "name" not in data

    def test_role_response(self):
        now = datetime.now(UTC)
        data = {
            "_id": str(ObjectId()),
            "name": "Admin",
            "description": "System admin",
            "permissions": ["*"],
            "is_system": True,
            "created_at": now,
            "updated_at": now,
        }
        response = RoleResponse(**data)
        assert response.id == data["_id"]
        assert response.is_system is True


class TestUserGroupSchema:
    def test_group_create_valid(self):
        group = UserGroupCreate(
            name="Dev Team A",
            description="Development team A",
            members=["user_1", "user_2"],
            parent_group_id=None,
        )
        assert group.name == "Dev Team A"
        assert len(group.members) == 2

    def test_group_with_parent(self):
        group = UserGroupCreate(
            name="Frontend Subteam",
            description="",
            members=["user_3"],
            parent_group_id=str(ObjectId()),
        )
        assert group.parent_group_id is not None


class TestOperationLogSchema:
    def test_log_create_valid(self):
        log = OperationLogCreate(
            user_id="user_1",
            action="project.create",
            resource_type="project",
            resource_id="proj_1",
            description="Created new project",
            ip_address="127.0.0.1",
            user_agent="Mozilla/5.0",
            status="success",
            details={"name": "Test Project"},
        )
        assert log.action == "project.create"
        assert log.status == "success"


class TestNotificationSchema:
    def test_notification_create_valid(self):
        notif = NotificationCreate(
            user_id="user_1",
            title="Task Assigned",
            content="You have been assigned a task",
            type="info",
            is_read=False,
            source_type="task",
            source_id="task_1",
        )
        assert notif.title == "Task Assigned"
        assert notif.type == "info"
        assert not notif.is_read

    def test_notification_update_read(self):
        now = datetime.now(UTC)
        update = NotificationUpdate(is_read=True, read_at=now)
        data = update.model_dump(exclude_unset=True)
        assert data["is_read"] is True
        assert "read_at" in data

    def test_notification_response(self):
        now = datetime.now(UTC)
        data = {
            "_id": str(ObjectId()),
            "user_id": "user_1",
            "title": "Test Notif",
            "content": "Content",
            "type": "warning",
            "is_read": False,
            "source_type": "",
            "source_id": "",
            "created_at": now,
            "updated_at": now,
        }
        response = NotificationResponse(**data)
        assert response.id == data["_id"]
        assert response.type == "warning"


class TestCommunicationSchema:
    def test_communication_create_valid(self):
        comm = CommunicationCreate(
            project_id="proj_1",
            title="Sprint Planning Meeting",
            description="Plan for sprint 1",
            type="meeting",
            participants=["user_1", "user_2"],
            date=datetime.now(UTC),
            location="Room A",
            outcome="Sprint backlog defined",
        )
        assert comm.type == "meeting"
        assert len(comm.participants) == 2


class TestConfigItemSchema:
    def test_config_create_valid(self):
        config = ConfigItemCreate(
            name="max_users",
            value="100",
            type="number",
            category="system",
            description="Maximum number of users",
            is_sensitive=False,
        )
        assert config.name == "max_users"
        assert config.type == "number"

    def test_config_sensitive(self):
        config = ConfigItemCreate(
            name="api_key",
            value="secret123",
            type="string",
            category="integration",
            is_sensitive=True,
        )
        assert config.is_sensitive is True


class TestDrillPlanSchema:
    def test_drill_create_valid(self):
        drill = DrillPlanCreate(
            project_id="proj_1",
            name="Fire Drill Q1",
            description="Quarterly fire drill",
            type="fire",
            status="planned",
            scheduled_date=datetime.now(UTC),
            participants=["user_1", "user_2"],
            result="",
            lessons_learned="",
        )
        assert drill.type == "fire"
        assert drill.status == "planned"


class TestDeploymentPlanSchema:
    def test_deployment_create_valid(self):
        deploy = DeploymentPlanCreate(
            project_id="proj_1",
            name="v1.0 Release",
            description="First release",
            version="1.0.0",
            status="planned",
            scheduled_date=datetime.now(UTC),
            rollback_plan="Rollback to v0.9",
            approver_id="manager_1",
            deployed_by="dev_1",
            result="",
        )
        assert deploy.version == "1.0.0"
        assert deploy.status == "planned"


class TestWorkRecordSchema:
    def test_work_record_create_valid(self):
        record = WorkRecordCreate(
            user_id="user_1",
            project_id="proj_1",
            date=datetime.now(UTC),
            hours=8.0,
            type="work",
            description="Implemented feature X",
            status="submitted",
        )
        assert record.hours == 8.0
        assert record.type == "work"

    def test_work_record_overtime(self):
        record = WorkRecordCreate(
            user_id="user_1",
            project_id="proj_1",
            date=datetime.now(UTC),
            hours=4.0,
            type="overtime",
            description="Emergency fix",
            status="submitted",
        )
        assert record.type == "overtime"
