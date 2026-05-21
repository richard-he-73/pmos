from datetime import datetime
from typing import Optional

from pydantic import Field

from app.models.base import BaseDocument, TimestampMixin


class RoleBase(TimestampMixin):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = ""
    permissions: list[str] = []
    is_system: bool = False


class RoleCreate(RoleBase):
    pass


class RoleUpdate(BaseDocument):
    name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[list[str]] = None


class RoleInDB(RoleBase):
    pass


class RoleResponse(RoleBase):
    id: str = Field(..., alias="_id")


class UserGroupBase(TimestampMixin):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = ""
    members: list[str] = []
    parent_group_id: Optional[str] = None


class UserGroupCreate(UserGroupBase):
    pass


class UserGroupUpdate(BaseDocument):
    name: Optional[str] = None
    description: Optional[str] = None
    members: Optional[list[str]] = None
    parent_group_id: Optional[str] = None


class UserGroupInDB(UserGroupBase):
    pass


class UserGroupResponse(UserGroupBase):
    id: str = Field(..., alias="_id")


class OperationLogBase(TimestampMixin):
    user_id: str
    action: str = Field(..., min_length=1, max_length=100)
    resource_type: str = ""
    resource_id: str = ""
    description: str = ""
    ip_address: str = ""
    user_agent: str = ""
    status: str = "success"
    details: dict = {}


class OperationLogCreate(OperationLogBase):
    pass


class OperationLogInDB(OperationLogBase):
    pass


class OperationLogResponse(OperationLogBase):
    id: str = Field(..., alias="_id")
