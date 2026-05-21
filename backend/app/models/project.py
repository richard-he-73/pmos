from datetime import datetime
from typing import Optional

from pydantic import Field

from app.models.base import BaseDocument, TimestampMixin


class ProjectBase(TimestampMixin):
    code: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=200)
    description: str = ""
    owner_id: str
    stakeholders: list[str] = []
    status: str = Field(
        default="planning", pattern="^(planning|active|on_hold|completed|archived)$"
    )
    priority: str = Field(default="medium", pattern="^(low|medium|high|critical)$")
    start_date: datetime
    end_date: Optional[datetime] = None
    budget_total: float = 0.0
    budget_used: float = 0.0
    budget_currency: str = "CNY"
    progress: float = Field(default=0.0, ge=0, le=100)
    tags: list[str] = []


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseDocument):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    end_date: Optional[datetime] = None
    budget_used: Optional[float] = None
    progress: Optional[float] = None
    tags: Optional[list[str]] = None


class ProjectInDB(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    id: str = Field(..., alias="_id")
    budget: dict = {}

    def model_post_init(self, __context) -> None:
        self.budget = {
            "total": self.budget_total,
            "used": self.budget_used,
            "currency": self.budget_currency,
        }
