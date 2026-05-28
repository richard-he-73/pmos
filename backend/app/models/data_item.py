from typing import Optional

from pydantic import Field

from app.models.base import BaseDocument, TimestampMixin


class DataItemBase(TimestampMixin):
    code: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    sort_order: int = Field(default=0)
    is_active: bool = True


class DataItemCreate(DataItemBase):
    pass


class DataItemUpdate(BaseDocument):
    code: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class DataItemResponse(DataItemBase):
    id: str = Field(..., validation_alias="_id")

    model_config = {"populate_by_name": True}
