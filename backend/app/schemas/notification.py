from datetime import datetime
from typing import Optional

from pydantic import Field

from app.models.base import BaseDocument, TimestampMixin


class NotificationBase(TimestampMixin):
    user_id: str
    title: str = Field(..., min_length=1, max_length=200)
    content: str = ""
    type: str = Field(default="info", pattern="^(info|warning|error|success|system)$")
    is_read: bool = False
    read_at: Optional[datetime] = None
    source_type: str = ""
    source_id: str = ""
    expire_at: Optional[datetime] = None


class NotificationCreate(NotificationBase):
    pass


class NotificationUpdate(BaseDocument):
    is_read: Optional[bool] = None
    read_at: Optional[datetime] = None


class NotificationInDB(NotificationBase):
    pass


class NotificationResponse(NotificationBase):
    id: str = Field(..., alias="_id")
