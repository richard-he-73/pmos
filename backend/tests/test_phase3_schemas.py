import pytest
from datetime import datetime, UTC
from bson import ObjectId
from unittest.mock import MagicMock, AsyncMock

from app.schemas.risk import RiskCreate, RiskUpdate, RiskResponse
from app.schemas.requirement import RequirementCreate, RequirementUpdate, RequirementResponse
from app.schemas.development import IterationCreate, CodeReviewCreate
from app.schemas.testing import TestCaseCreate, DefectCreate, TestReportCreate


class TestRiskSchema:
    def test_risk_create_valid(self):
        risk = RiskCreate(
            project_id="proj_1",
            title="Security Vulnerability",
            description="Potential SQL injection",
            category="technical",
            probability="high",
            impact="high",
            severity=9,
            status="identified",
            owner_id="user_1",
        )
        assert risk.project_id == "proj_1"
        assert risk.category == "technical"
        assert risk.severity == 9

    def test_risk_create_invalid_category(self):
        with pytest.raises(Exception):
            RiskCreate(
                project_id="proj_1",
                title="Test",
                category="invalid_category",
                probability="high",
                impact="high",
                owner_id="user_1",
            )

    def test_risk_create_invalid_probability(self):
        with pytest.raises(Exception):
            RiskCreate(
                project_id="proj_1",
                title="Test",
                category="technical",
                probability="extreme",
                impact="high",
                owner_id="user_1",
            )

    def test_risk_update_partial(self):
        update = RiskUpdate(status="mitigating")
        data = update.model_dump(exclude_unset=True)
        assert "status" in data
        assert data["status"] == "mitigating"
        assert "title" not in data

    def test_risk_response(self):
        now = datetime.now(UTC)
        data = {
            "_id": str(ObjectId()),
            "project_id": "proj_1",
            "title": "Test Risk",
            "description": "Desc",
            "category": "technical",
            "probability": "medium",
            "impact": "high",
            "severity": 6,
            "status": "identified",
            "owner_id": "user_1",
            "mitigation_plan": "",
            "contingency_plan": "",
            "triggered_at": None,
            "closed_at": None,
            "created_at": now,
            "updated_at": now,
        }
        response = RiskResponse(**data)
        assert response.id == data["_id"]
        assert response.title == "Test Risk"


class TestRequirementSchema:
    def test_requirement_create_valid(self):
        req = RequirementCreate(
            project_id="proj_1",
            code="REQ-001",
            title="User Login Feature",
            description="As a user I want to login",
            type="functional",
            status="draft",
            priority="high",
            source="Product Manager",
            acceptance_criteria=["User can login", "Error on wrong password"],
        )
        assert req.code == "REQ-001"
        assert req.type == "functional"
        assert len(req.acceptance_criteria) == 2

    def test_requirement_create_invalid_type(self):
        with pytest.raises(Exception):
            RequirementCreate(
                project_id="proj_1",
                code="REQ-002",
                title="Test",
                type="invalid_type",
                status="draft",
                priority="medium",
            )

    def test_requirement_update_partial(self):
        update = RequirementUpdate(status="approved", version=2)
        data = update.model_dump(exclude_unset=True)
        assert "status" in data
        assert "version" in data
        assert "title" not in data

    def test_requirement_response(self):
        now = datetime.now(UTC)
        data = {
            "_id": str(ObjectId()),
            "project_id": "proj_1",
            "code": "REQ-001",
            "title": "Test Req",
            "description": "",
            "type": "functional",
            "status": "draft",
            "priority": "medium",
            "source": "",
            "acceptance_criteria": [],
            "related_tasks": [],
            "version": 1,
            "created_at": now,
            "updated_at": now,
        }
        response = RequirementResponse(**data)
        assert response.id == data["_id"]
        assert response.code == "REQ-001"


class TestIterationSchema:
    def test_iteration_create_valid(self):
        start = datetime.now(UTC)
        end = datetime.now(UTC)
        iteration = IterationCreate(
            project_id="proj_1",
            name="Sprint 1",
            description="First sprint",
            status="planning",
            start_date=start,
            end_date=end,
            tasks=[],
            progress=0.0,
        )
        assert iteration.name == "Sprint 1"
        assert iteration.status == "planning"
        assert iteration.progress == 0.0

    def test_iteration_create_invalid_status(self):
        with pytest.raises(Exception):
            IterationCreate(
                project_id="proj_1",
                name="Sprint 1",
                status="invalid",
                start_date=datetime.now(UTC),
                tasks=[],
                progress=0.0,
            )


class TestCodeReviewSchema:
    def test_code_review_create_valid(self):
        review = CodeReviewCreate(
            project_id="proj_1",
            task_id="task_1",
            reviewer_id="reviewer_1",
            author_id="author_1",
            status="pending",
            comment="",
            code_url="https://github.com/repo/pr/1",
        )
        assert review.status == "pending"
        assert review.task_id == "task_1"

    def test_code_review_create_invalid_status(self):
        with pytest.raises(Exception):
            CodeReviewCreate(
                project_id="proj_1",
                task_id="task_1",
                reviewer_id="reviewer_1",
                author_id="author_1",
                status="invalid_status",
                code_url="",
                comment="",
            )


class TestTestCaseSchema:
    def test_test_case_create_valid(self):
        tc = TestCaseCreate(
            project_id="proj_1",
            title="Login Test",
            description="Test login functionality",
            module="auth",
            priority="high",
            status="active",
            preconditions="User exists",
            steps=["Navigate to login", "Enter credentials", "Click login"],
            expected_result="User is logged in",
        )
        assert tc.title == "Login Test"
        assert len(tc.steps) == 3

    def test_test_case_create_invalid_status(self):
        with pytest.raises(Exception):
            TestCaseCreate(
                project_id="proj_1",
                title="Test",
                status="invalid",
                priority="medium",
                module="",
                preconditions="",
                steps=[],
                expected_result="",
            )


class TestDefectSchema:
    def test_defect_create_valid(self):
        defect = DefectCreate(
            project_id="proj_1",
            title="Login fails with correct password",
            description="User cannot login",
            severity="critical",
            priority="high",
            status="new",
            reporter_id="user_1",
            environment="staging",
            steps_to_reproduce="1. Go to login\n2. Enter creds\n3. Click",
            actual_result="Error page",
            expected_result="Dashboard",
            resolution="",
            tags=["auth", "critical"],
        )
        assert defect.severity == "critical"
        assert defect.status == "new"

    def test_defect_create_invalid_severity(self):
        with pytest.raises(Exception):
            DefectCreate(
                project_id="proj_1",
                title="Test",
                severity="extreme",
                priority="medium",
                status="new",
                reporter_id="user_1",
                environment="",
                steps_to_reproduce="",
                actual_result="",
                expected_result="",
                resolution="",
                tags=[],
            )


class TestTestReportSchema:
    def test_test_report_create_valid(self):
        report = TestReportCreate(
            project_id="proj_1",
            name="Sprint 1 Test Report",
            total_cases=100,
            passed=85,
            failed=10,
            blocked=5,
            pass_rate=85.0,
            defects_found=10,
            summary="Overall good results",
            tester_id="tester_1",
        )
        assert report.total_cases == 100
        assert report.pass_rate == 85.0

    def test_test_report_pass_rate_validation(self):
        report = TestReportCreate(
            project_id="proj_1",
            name="Test",
            total_cases=10,
            passed=5,
            failed=5,
            blocked=0,
            pass_rate=50.0,
            defects_found=5,
            summary="",
            tester_id="tester_1",
        )
        assert report.pass_rate == 50.0
