from datetime import datetime
from typing import Optional

from pydantic import Field

from app.models.base import BaseDocument, TimestampMixin


class CommunicationBase(TimestampMixin):
    project_id: str
    title: str = Field(..., min_length=1, max_length=200)
    description: str = ""
    type: str = Field(default="meeting", pattern="^(meeting|email|call|discussion|report)$")
    participants: list[str] = []
    date: datetime
    location: str = ""
    outcome: str = ""
    attachments: list[str] = []
    tags: list[str] = []


class CommunicationCreate(BaseDocument):
    project_id: str
    title: str = Field(..., min_length=1, max_length=200)
    description: str = ""
    type: str = Field(default="meeting", pattern="^(meeting|email|call|discussion|report)$")
    participants: list[str] = []
    date: datetime
    location: str = ""
    outcome: str = ""
    attachments: list[str] = []
    tags: list[str] = []


class CommunicationUpdate(BaseDocument):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    participants: Optional[list[str]] = None
    date: Optional[datetime] = None
    location: Optional[str] = None
    outcome: Optional[str] = None
    attachments: Optional[list[str]] = None
    tags: Optional[list[str]] = None


class CommunicationInDB(CommunicationBase):
    pass


class CommunicationResponse(CommunicationBase):
    id: str = Field(..., alias="_id")


class ConfigItemBase(TimestampMixin):
    name: str = Field(..., min_length=1, max_length=100)
    value: str = ""
    type: str = Field(default="string", pattern="^(string|number|boolean|json)$")
    category: str = ""
    description: str = ""
    is_sensitive: bool = False


class ConfigItemCreate(BaseDocument):
    name: str = Field(..., min_length=1, max_length=100)
    value: str = ""
    type: str = Field(default="string", pattern="^(string|number|boolean|json)$")
    category: str = ""
    description: str = ""
    is_sensitive: bool = False


class ConfigItemUpdate(BaseDocument):
    value: Optional[str] = None
    description: Optional[str] = None
    is_sensitive: Optional[bool] = None


class ConfigItemInDB(ConfigItemBase):
    pass


class ConfigItemResponse(ConfigItemBase):
    id: str = Field(..., alias="_id")


class DrillPlanBase(TimestampMixin):
    project_id: str
    name: str = Field(..., min_length=1, max_length=200)
    description: str = ""
    type: str = Field(default="fire", pattern="^(fire|disaster|security|network|database)$")
    status: str = Field(default="planned", pattern="^(planned|in_progress|completed|cancelled)$")
    scheduled_date: datetime
    actual_date: Optional[datetime] = None
    participants: list[str] = []
    result: str = ""
    lessons_learned: str = ""


class DrillPlanCreate(BaseDocument):
    project_id: str
    name: str = Field(..., min_length=1, max_length=200)
    description: str = ""
    type: str = Field(default="fire", pattern="^(fire|disaster|security|network|database)$")
    status: str = Field(default="planned", pattern="^(planned|in_progress|completed|cancelled)$")
    scheduled_date: datetime
    actual_date: Optional[datetime] = None
    participants: list[str] = []
    result: str = ""
    lessons_learned: str = ""


class DrillPlanUpdate(BaseDocument):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    actual_date: Optional[datetime] = None
    participants: Optional[list[str]] = None
    result: Optional[str] = None
    lessons_learned: Optional[str] = None


class DrillPlanInDB(DrillPlanBase):
    pass


class DrillPlanResponse(DrillPlanBase):
    id: str = Field(..., alias="_id")


class DeploymentPlanBase(TimestampMixin):
    project_id: str
    name: str = Field(..., min_length=1, max_length=200)
    description: str = ""
    version: str = ""
    status: str = Field(default="planned", pattern="^(planned|approved|deploying|success|failed|rolled_back)$")
    scheduled_date: datetime
    actual_date: Optional[datetime] = None
    rollback_plan: str = ""
    approver_id: str = ""
    deployed_by: str = ""
    result: str = ""


class DeploymentPlanCreate(BaseDocument):
    project_id: str
    name: str = Field(..., min_length=1, max_length=200)
    description: str = ""
    version: str = ""
    status: str = Field(default="planned", pattern="^(planned|approved|deploying|success|failed|rolled_back)$")
    scheduled_date: datetime
    actual_date: Optional[datetime] = None
    rollback_plan: str = ""
    approver_id: str = ""
    deployed_by: str = ""
    result: str = ""


class DeploymentPlanUpdate(BaseDocument):
    name: Optional[str] = None
    description: Optional[str] = None
    version: Optional[str] = None
    status: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    actual_date: Optional[datetime] = None
    rollback_plan: Optional[str] = None
    approver_id: Optional[str] = None
    deployed_by: Optional[str] = None
    result: Optional[str] = None


class DeploymentPlanInDB(DeploymentPlanBase):
    pass


class DeploymentPlanResponse(DeploymentPlanBase):
    id: str = Field(..., alias="_id")


class WorkRecordBase(TimestampMixin):
    user_id: str
    project_id: str
    date: datetime
    hours: float = Field(default=8.0, ge=0, le=24)
    type: str = Field(default="work", pattern="^(work|overtime|leave|training)$")
    description: str = ""
    status: str = Field(default="submitted", pattern="^(submitted|approved|rejected)$")


class WorkRecordCreate(BaseDocument):
    user_id: str
    project_id: str
    date: datetime
    hours: float = Field(default=8.0, ge=0, le=24)
    type: str = Field(default="work", pattern="^(work|overtime|leave|training)$")
    description: str = ""
    status: str = Field(default="submitted", pattern="^(submitted|approved|rejected)$")


class WorkRecordUpdate(BaseDocument):
    hours: Optional[float] = None
    type: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class WorkRecordInDB(WorkRecordBase):
    pass


class WorkRecordResponse(WorkRecordBase):
    id: str = Field(..., alias="_id")