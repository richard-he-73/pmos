from datetime import datetime
from typing import Optional

from pydantic import Field

from app.models.base import BaseDocument, TimestampMixin


class TaskBase(TimestampMixin):
    project_id: str
    parent_task_id: Optional[str] = None
    title: str = Field(..., min_length=1, max_length=200)
    description: str = ""
    assignee_id: Optional[str] = None
    reporter_id: str
    status: str = Field(
        default="todo", pattern="^(todo|in_progress|review|done|cancelled)$"
    )
    priority: str = Field(default="medium", pattern="^(low|medium|high|critical)$")
    type: str = Field(default="task", pattern="^(feature|bug|task|milestone)$")
    estimate_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    dependencies: list[str] = []
    tags: list[str] = []
    attachments: list[str] = []


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseDocument):
    title: Optional[str] = None
    description: Optional[str] = None
    assignee_id: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    type: Optional[str] = None
    estimate_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    dependencies: Optional[list[str]] = None
    tags: Optional[list[str]] = None


class TaskInDB(TaskBase):
    pass


class TaskResponse(TaskBase):
    id: str = Field(..., alias="_id")
