from datetime import datetime
from typing import Optional

from pydantic import Field

from app.models.base import BaseDocument, TimestampMixin


class RiskBase(TimestampMixin):
    project_id: str
    title: str = Field(..., min_length=1, max_length=200)
    description: str = ""
    category: str = Field(
        default="technical", pattern="^(technical|schedule|budget|resource|external)$"
    )
    probability: str = Field(default="medium", pattern="^(low|medium|high)$")
    impact: str = Field(default="medium", pattern="^(low|medium|high)$")
    severity: int = Field(default=1, ge=1, le=10)
    status: str = Field(
        default="identified", pattern="^(identified|assessed|mitigating|closed)$"
    )
    owner_id: str
    mitigation_plan: str = ""
    contingency_plan: str = ""
    triggered_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None


class RiskCreate(RiskBase):
    pass


class RiskUpdate(BaseDocument):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    probability: Optional[str] = None
    impact: Optional[str] = None
    severity: Optional[int] = None
    status: Optional[str] = None
    owner_id: Optional[str] = None
    mitigation_plan: Optional[str] = None
    contingency_plan: Optional[str] = None
    triggered_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None


class RiskInDB(RiskBase):
    pass


class RiskResponse(RiskBase):
    id: str = Field(..., alias="_id")
