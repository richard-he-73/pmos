from datetime import datetime
from typing import Optional

from pydantic import EmailStr, Field

from app.models.base import BaseDocument, TimestampMixin


class UserBase(TimestampMixin):
    username: str = Field(..., min_length=3, max_length=50)
    email: str
    display_name: str = Field(..., min_length=1, max_length=100)
    avatar: Optional[str] = None
    role: str = Field(default="member", pattern="^(admin|manager|member|viewer)$")
    department: str = ""
    status: str = Field(default="active", pattern="^(active|inactive|suspended)$")


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    email: EmailStr


class UserUpdate(BaseDocument):
    display_name: Optional[str] = None
    avatar: Optional[str] = None
    department: Optional[str] = None
    status: Optional[str] = None


class UserInDB(UserBase):
    password_hash: str
    permissions: list[str] = []
    last_login: Optional[datetime] = None


class UserResponse(UserBase):
    id: str = Field(..., alias="_id")
    last_login: Optional[datetime] = None
