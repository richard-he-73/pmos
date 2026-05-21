from datetime import datetime
from typing import Optional

from pydantic import Field

from app.models.base import BaseDocument, TimestampMixin


class TestCaseBase(TimestampMixin):
    project_id: str
    title: str = Field(..., min_length=1, max_length=200)
    description: str = ""
    module: str = ""
    priority: str = Field(default="medium", pattern="^(low|medium|high|critical)$")
    status: str = Field(default="draft", pattern="^(draft|active|deprecated)$")
    preconditions: str = ""
    steps: list[str] = []
    expected_result: str = ""
    related_requirement_id: Optional[str] = None
    tags: list[str] = []


class TestCaseCreate(TestCaseBase):
    pass


class TestCaseUpdate(BaseDocument):
    title: Optional[str] = None
    description: Optional[str] = None
    module: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    preconditions: Optional[str] = None
    steps: Optional[list[str]] = None
    expected_result: Optional[str] = None
    related_requirement_id: Optional[str] = None
    tags: Optional[list[str]] = None


class TestCaseInDB(TestCaseBase):
    pass


class TestCaseResponse(TestCaseBase):
    id: str = Field(..., alias="_id")


class DefectBase(TimestampMixin):
    project_id: str
    title: str = Field(..., min_length=1, max_length=200)
    description: str = ""
    severity: str = Field(default="medium", pattern="^(low|medium|high|critical)$")
    priority: str = Field(default="medium", pattern="^(low|medium|high|critical)$")
    status: str = Field(
        default="new", pattern="^(new|open|in_progress|resolved|closed|rejected)$"
    )
    reporter_id: str
    assignee_id: Optional[str] = None
    environment: str = ""
    steps_to_reproduce: str = ""
    actual_result: str = ""
    expected_result: str = ""
    related_test_case_id: Optional[str] = None
    related_task_id: Optional[str] = None
    resolution: str = ""
    tags: list[str] = []


class DefectCreate(DefectBase):
    pass


class DefectUpdate(BaseDocument):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assignee_id: Optional[str] = None
    environment: Optional[str] = None
    steps_to_reproduce: Optional[str] = None
    actual_result: Optional[str] = None
    expected_result: Optional[str] = None
    related_test_case_id: Optional[str] = None
    related_task_id: Optional[str] = None
    resolution: Optional[str] = None
    tags: Optional[list[str]] = None


class DefectInDB(DefectBase):
    pass


class DefectResponse(DefectBase):
    id: str = Field(..., alias="_id")


class TestReportBase(TimestampMixin):
    project_id: str
    iteration_id: Optional[str] = None
    name: str = Field(..., min_length=1, max_length=200)
    total_cases: int = 0
    passed: int = 0
    failed: int = 0
    blocked: int = 0
    pass_rate: float = Field(default=0.0, ge=0, le=100)
    defects_found: int = 0
    summary: str = ""
    tester_id: str


class TestReportCreate(TestReportBase):
    pass


class TestReportUpdate(BaseDocument):
    iteration_id: Optional[str] = None
    name: Optional[str] = None
    total_cases: Optional[int] = None
    passed: Optional[int] = None
    failed: Optional[int] = None
    blocked: Optional[int] = None
    pass_rate: Optional[float] = None
    defects_found: Optional[int] = None
    summary: Optional[str] = None


class TestReportInDB(TestReportBase):
    pass


class TestReportResponse(TestReportBase):
    id: str = Field(..., alias="_id")
