from datetime import datetime
from typing import Optional

from pydantic import Field

from app.models.base import BaseDocument, TimestampMixin


class DataDictionaryBase(TimestampMixin):
    category: str = Field(..., min_length=1, max_length=50, description="字典分类")
    code: str = Field(..., min_length=1, max_length=50, description="字典编码")
    name: str = Field(..., min_length=1, max_length=100, description="字典名称")
    value: str = Field(..., min_length=1, max_length=100, description="字典值")
    description: Optional[str] = Field(default="", max_length=500, description="描述")
    sort_order: int = Field(default=0, ge=0, description="排序号")
    is_active: bool = Field(default=True, description="是否启用")
    is_system: bool = Field(default=False, description="是否系统内置")


class DataDictionaryCreate(DataDictionaryBase):
    pass


class DataDictionaryUpdate(BaseDocument):
    category: Optional[str] = None
    code: Optional[str] = None
    name: Optional[str] = None
    value: Optional[str] = None
    description: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class DataDictionaryInDB(DataDictionaryBase):
    pass


class DataDictionaryResponse(DataDictionaryBase):
    id: str = Field(..., alias="_id")
