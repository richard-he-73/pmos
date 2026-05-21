from datetime import datetime
from typing import Optional

from pydantic import Field

from app.models.base import BaseDocument, TimestampMixin


class RequirementBase(TimestampMixin):
    project_id: str
    code: str = Field(..., min_length=1, max_length=50)
    title: str = Field(..., min_length=1, max_length=200)
    description: str = ""
    type: str = Field(
        default="functional", pattern="^(functional|non_functional|business|technical)$"
    )
    status: str = Field(
        default="draft",
        pattern="^(draft|reviewing|approved|in_progress|done|rejected)$",
    )
    priority: str = Field(default="medium", pattern="^(low|medium|high|critical)$")
    source: str = ""
    acceptance_criteria: list[str] = []
    related_tasks: list[str] = []
    version: int = 1


class RequirementCreate(RequirementBase):
    pass


class RequirementUpdate(BaseDocument):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    source: Optional[str] = None
    acceptance_criteria: Optional[list[str]] = None
    related_tasks: Optional[list[str]] = None
    version: Optional[int] = None


class RequirementInDB(RequirementBase):
    pass


class RequirementResponse(RequirementBase):
    id: str = Field(..., alias="_id")
