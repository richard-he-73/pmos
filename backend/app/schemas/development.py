from datetime import datetime
from typing import Optional

from pydantic import Field

from app.models.base import BaseDocument, TimestampMixin


class IterationBase(TimestampMixin):
    project_id: str
    name: str = Field(..., min_length=1, max_length=200)
    description: str = ""
    status: str = Field(
        default="planning", pattern="^(planning|active|completed|cancelled)$"
    )
    start_date: datetime
    end_date: Optional[datetime] = None
    tasks: list[str] = []
    progress: float = Field(default=0.0, ge=0, le=100)


class IterationCreate(IterationBase):
    pass


class IterationUpdate(BaseDocument):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    tasks: Optional[list[str]] = None
    progress: Optional[float] = None


class IterationInDB(IterationBase):
    pass


class IterationResponse(IterationBase):
    id: str = Field(..., alias="_id")


class CodeReviewBase(TimestampMixin):
    project_id: str
    task_id: str
    reviewer_id: str
    author_id: str
    status: str = Field(
        default="pending", pattern="^(pending|approved|rejected|needs_changes)$"
    )
    comment: str = ""
    code_url: str = ""


class CodeReviewCreate(CodeReviewBase):
    pass


class CodeReviewUpdate(BaseDocument):
    status: Optional[str] = None
    comment: Optional[str] = None
    code_url: Optional[str] = None


class CodeReviewInDB(CodeReviewBase):
    pass


class CodeReviewResponse(CodeReviewBase):
    id: str = Field(..., alias="_id")
