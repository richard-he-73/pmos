from datetime import UTC, datetime
from typing import Annotated

from pydantic import BaseModel, BeforeValidator, ConfigDict

PyObjectId = Annotated[str, BeforeValidator(str)]


class BaseDocument(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={
            datetime: lambda v: v.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3] if v else None,
        },
    )
    id: PyObjectId | None = None


class TimestampMixin(BaseDocument):
    created_at: datetime = datetime.now(UTC)
    updated_at: datetime = datetime.now(UTC)
