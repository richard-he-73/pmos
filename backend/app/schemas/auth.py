from datetime import datetime

from pydantic import EmailStr, Field

from app.models.base import BaseDocument, TimestampMixin


class UserBase(TimestampMixin):
    username: str = Field(..., min_length=3, max_length=50)
    email: str
    display_name: str = Field(..., min_length=1, max_length=100)
    avatar: str | None = None
    role: str = Field(default="operator", pattern="^(system|operator)$")
    department: str = ""
    status: str = Field(default="active", pattern="^(active|inactive|suspended)$")


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    email: EmailStr


class UserUpdate(BaseDocument):
    display_name: str | None = None
    avatar: str | None = None
    department: str | None = None
    status: str | None = None


class UserInDB(UserBase):
    password_hash: str
    permissions: list[str] = []
    last_login: datetime | None = None


class UserResponse(UserBase):
    id: str = Field(..., alias="_id")
    last_login: datetime | None = None


class UserLogin(BaseDocument):
    username: str
    password: str


class TokenResponse(BaseDocument):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
