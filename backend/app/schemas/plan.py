from datetime import datetime

from pydantic import Field, field_validator

from app.models.base import BaseDocument, TimestampMixin


def parse_date(date_input: str | datetime | None) -> datetime | None:
    """解析日期字符串或datetime对象"""
    if date_input is None:
        return None
    if isinstance(date_input, datetime):
        return date_input
    if isinstance(date_input, str):
        try:
            return datetime.strptime(date_input, "%Y-%m-%d")
        except ValueError:
            # 尝试其他日期格式
            try:
                return datetime.fromisoformat(date_input.split('T')[0])
            except ValueError:
                return None
    return date_input


# 里程碑模型
class MilestoneBase(TimestampMixin):
    project_id: str = Field(..., description="项目ID")
    name: str = Field(..., min_length=1, max_length=200)
    description: str = ""
    acceptance_criteria: str = ""
    owner: str = Field(..., min_length=1, description="负责人")
    current_status: str = Field(..., description="当前状态")
    plan_start_date: datetime
    actual_start_date: datetime | None = None
    plan_end_date: datetime
    actual_end_date: datetime | None = None
    status: str = Field(
        default="pending", pattern="^(pending|in_progress|completed)$"
    )
    progress: float = Field(default=0.0, ge=0, le=100)

    @field_validator("plan_start_date", "actual_start_date", "plan_end_date", "actual_end_date", mode="before")
    @classmethod
    def parse_dates(cls, v):
        return parse_date(v)


class MilestoneCreate(MilestoneBase):
    pass


class MilestoneUpdate(BaseDocument):
    name: str | None = None
    description: str | None = None
    acceptance_criteria: str | None = None
    owner: str | None = None
    current_status: str | None = None
    plan_start_date: datetime | None = None
    actual_start_date: datetime | None = None
    plan_end_date: datetime | None = None
    actual_end_date: datetime | None = None
    status: str | None = None
    progress: float | None = None

    @field_validator("plan_start_date", "actual_start_date", "plan_end_date", "actual_end_date", mode="before")
    @classmethod
    def parse_dates(cls, v):
        return parse_date(v)


class MilestoneResponse(MilestoneBase):
    id: str = Field(..., alias="_id")


# 小组计划模型
class GroupPlanBase(TimestampMixin):
    project_id: str = Field(..., description="项目ID")
    milestone_id: str = Field(..., description="隶属里程碑ID")
    name: str = Field(..., min_length=1, max_length=200)
    description: str = ""
    acceptance_criteria: str = ""
    owner: str = Field(..., description="负责人")
    current_status: str = Field(..., description="当前状态")
    plan_start_date: datetime
    actual_start_date: datetime | None = None
    plan_end_date: datetime
    actual_end_date: datetime | None = None
    status: str = Field(
        default="pending", pattern="^(pending|in_progress|completed)$"
    )
    progress: float = Field(default=0.0, ge=0, le=100)

    @field_validator("plan_start_date", "actual_start_date", "plan_end_date", "actual_end_date", mode="before")
    @classmethod
    def parse_dates(cls, v):
        return parse_date(v)


class GroupPlanCreate(GroupPlanBase):
    pass


class GroupPlanUpdate(BaseDocument):
    milestone_id: str | None = None
    name: str | None = None
    description: str | None = None
    acceptance_criteria: str | None = None
    owner: str | None = None
    current_status: str | None = None
    plan_start_date: datetime | None = None
    actual_start_date: datetime | None = None
    plan_end_date: datetime | None = None
    actual_end_date: datetime | None = None
    status: str | None = None
    progress: float | None = None

    @field_validator("plan_start_date", "actual_start_date", "plan_end_date", "actual_end_date", mode="before")
    @classmethod
    def parse_dates(cls, v):
        return parse_date(v)


class GroupPlanResponse(GroupPlanBase):
    id: str = Field(..., alias="_id")


# 详细任务模型
class DetailTaskBase(TimestampMixin):
    project_id: str = Field(..., description="项目ID")
    milestone_id: str = Field(..., description="隶属里程碑ID")
    group_id: str = Field(..., description="隶属小组计划ID")
    name: str = Field(..., min_length=1, max_length=200)
    description: str = ""
    acceptance_criteria: str = ""
    owner: str = Field(..., description="负责人")
    current_status: str = Field(..., description="当前状态")
    plan_start_date: datetime
    actual_start_date: datetime | None = None
    plan_end_date: datetime
    actual_end_date: datetime | None = None
    status: str = Field(
        default="pending", pattern="^(pending|in_progress|completed)$"
    )
    progress: float = Field(default=0.0, ge=0, le=100)

    @field_validator("plan_start_date", "actual_start_date", "plan_end_date", "actual_end_date", mode="before")
    @classmethod
    def parse_dates(cls, v):
        return parse_date(v)


class DetailTaskCreate(DetailTaskBase):
    pass


class DetailTaskUpdate(BaseDocument):
    milestone_id: str | None = None
    group_id: str | None = None
    name: str | None = None
    description: str | None = None
    acceptance_criteria: str | None = None
    owner: str | None = None
    current_status: str | None = None
    plan_start_date: datetime | None = None
    actual_start_date: datetime | None = None
    plan_end_date: datetime | None = None
    actual_end_date: datetime | None = None
    status: str | None = None
    progress: float | None = None

    @field_validator("plan_start_date", "actual_start_date", "plan_end_date", "actual_end_date", mode="before")
    @classmethod
    def parse_dates(cls, v):
        return parse_date(v)


class DetailTaskResponse(DetailTaskBase):
    id: str = Field(..., alias="_id")
