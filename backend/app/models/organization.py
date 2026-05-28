from typing import Optional

from pydantic import Field

from app.models.base import BaseDocument, TimestampMixin


class DepartmentBase(TimestampMixin):
    code: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    parent_id: Optional[str] = None
    is_active: bool = True


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseDocument):
    code: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[str] = None
    is_active: Optional[bool] = None


class DepartmentResponse(DepartmentBase):
    id: str = Field(..., validation_alias="_id")

    model_config = {"populate_by_name": True}


class JobLevelBase(TimestampMixin):
    code: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    is_active: bool = True


class JobLevelCreate(JobLevelBase):
    pass


class JobLevelUpdate(BaseDocument):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class JobLevelResponse(JobLevelBase):
    id: str = Field(..., validation_alias="_id")

    model_config = {"populate_by_name": True}