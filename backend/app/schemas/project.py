from datetime import datetime

from pydantic import Field

from app.models.base import BaseDocument, TimestampMixin


class ProjectBase(TimestampMixin):
    code: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=200)
    description: str = ""
    owner_id: str
    stakeholders: list[str] = []
    team_members: list[str] = []
    team_members_with_roles: list[dict] = []
    org_structure: list[dict] = []
    status: str = Field(
        default="planning", pattern="^(planning|active|on_hold|completed|archived)$"
    )
    priority: str = Field(default="medium", pattern="^(low|medium|high|critical)$")
    start_date: datetime
    end_date: datetime | None = None
    budget_total: float = 0.0
    budget_used: float = 0.0
    budget_currency: str = "CNY"
    progress: float = Field(default=0.0, ge=0, le=100)
    tags: list[str] = []
    is_default: bool = Field(default=False)


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseDocument):
    code: str | None = None
    name: str | None = None
    description: str | None = None
    owner_id: str | None = None
    stakeholders: list[str] | None = None
    team_members: list[str] | None = None
    team_members_with_roles: list[dict] | None = None
    org_structure: list[dict] | None = None
    status: str | None = None
    priority: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    budget_total: float | None = None
    budget_used: float | None = None
    budget_currency: str | None = None
    progress: float | None = None
    tags: list[str] | None = None
    is_default: bool | None = None


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


class ProjectStatusTransition(BaseDocument):
    new_status: str = Field(..., pattern="^(planning|active|on_hold|completed|archived)$")
    reason: str = ""
