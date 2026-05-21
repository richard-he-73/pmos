from datetime import datetime
from typing import Optional

from pydantic import Field

from app.models.base import BaseDocument, TimestampMixin


class ResourceBase(TimestampMixin):
    name: str = Field(..., min_length=1, max_length=100)
    type: str = Field(..., pattern="^(human|equipment|budget)$")
    category: str = ""
    capacity: float = Field(default=100.0, ge=0)
    allocated: float = Field(default=0.0, ge=0)
    availability: str = Field(
        default="available", pattern="^(available|busy|unavailable)$"
    )
    skills: list[str] = []
    cost_per_hour: Optional[float] = None


class ResourceCreate(ResourceBase):
    pass


class ResourceUpdate(BaseDocument):
    name: Optional[str] = None
    category: Optional[str] = None
    capacity: Optional[float] = None
    allocated: Optional[float] = None
    availability: Optional[str] = None
    skills: Optional[list[str]] = None
    cost_per_hour: Optional[float] = None


class ResourceInDB(ResourceBase):
    pass


class ResourceResponse(ResourceBase):
    id: str = Field(..., alias="_id")
