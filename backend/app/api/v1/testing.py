import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.dependencies import get_current_user
from app.schemas.auth import UserInDB
from app.schemas.testing import (
    DefectCreate,
    DefectResponse,
    DefectUpdate,
    TestCaseCreate,
    TestCaseResponse,
    TestCaseUpdate,
    TestReportCreate,
    TestReportResponse,
    TestReportUpdate,
)

router = APIRouter(prefix="/testing", tags=["测试管理"])


@router.get("/test-cases", response_model=list[TestCaseResponse])
async def list_test_cases(
    skip: int = 0,
    limit: int = 20,
    project_id: str | None = None,
    status_filter: str | None = None,
    module: str | None = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    query = {}
    if project_id:
        query["project_id"] = project_id
    if status_filter:
        query["status"] = status_filter
    if module:
        query["module"] = module

    cursor = db.test_cases.find(query).skip(skip).limit(limit).sort("created_at", -1)
    test_cases = await cursor.to_list(length=limit)

    result = []
    for tc in test_cases:
        tc["_id"] = str(tc["_id"])
        result.append(TestCaseResponse(**tc))
    return result


@router.get("/test-cases/{test_case_id}", response_model=TestCaseResponse)
async def get_test_case(
    test_case_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(test_case_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的测试用例ID"
        )

    test_case = await db.test_cases.find_one({"_id": ObjectId(test_case_id)})
    if not test_case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="测试用例不存在"
        )

    test_case["_id"] = str(test_case["_id"])
    return TestCaseResponse(**test_case)


@router.post(
    "/test-cases", response_model=TestCaseResponse, status_code=status.HTTP_201_CREATED
)
async def create_test_case(
    test_case_data: TestCaseCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    test_case_dict = test_case_data.model_dump()
    test_case_dict["created_at"] = datetime.datetime.now(datetime.UTC)
    test_case_dict["updated_at"] = datetime.datetime.now(datetime.UTC)

    result = await db.test_cases.insert_one(test_case_dict)
    test_case_dict["_id"] = str(result.inserted_id)

    return TestCaseResponse(**test_case_dict)


@router.put("/test-cases/{test_case_id}", response_model=TestCaseResponse)
async def update_test_case(
    test_case_id: str,
    test_case_data: TestCaseUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(test_case_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的测试用例ID"
        )

    update_data = test_case_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="没有提供更新数据"
        )

    update_data["updated_at"] = datetime.datetime.now(datetime.UTC)

    result = await db.test_cases.update_one(
        {"_id": ObjectId(test_case_id)},
        {"$set": update_data},
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="测试用例不存在"
        )

    updated = await db.test_cases.find_one({"_id": ObjectId(test_case_id)})
    updated["_id"] = str(updated["_id"])
    return TestCaseResponse(**updated)


@router.delete("/test-cases/{test_case_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_test_case(
    test_case_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(test_case_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的测试用例ID"
        )

    result = await db.test_cases.delete_one({"_id": ObjectId(test_case_id)})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="测试用例不存在"
        )


@router.get("/defects", response_model=list[DefectResponse])
async def list_defects(
    skip: int = 0,
    limit: int = 20,
    project_id: str | None = None,
    status_filter: str | None = None,
    severity_filter: str | None = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    query = {}
    if project_id:
        query["project_id"] = project_id
    if status_filter:
        query["status"] = status_filter
    if severity_filter:
        query["severity"] = severity_filter

    cursor = db.defects.find(query).skip(skip).limit(limit).sort("created_at", -1)
    defects = await cursor.to_list(length=limit)

    result = []
    for d in defects:
        d["_id"] = str(d["_id"])
        result.append(DefectResponse(**d))
    return result


@router.get("/defects/{defect_id}", response_model=DefectResponse)
async def get_defect(
    defect_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(defect_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的缺陷ID"
        )

    defect = await db.defects.find_one({"_id": ObjectId(defect_id)})
    if not defect:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="缺陷不存在")

    defect["_id"] = str(defect["_id"])
    return DefectResponse(**defect)


@router.post(
    "/defects", response_model=DefectResponse, status_code=status.HTTP_201_CREATED
)
async def create_defect(
    defect_data: DefectCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    defect_dict = defect_data.model_dump()
    defect_dict["created_at"] = datetime.datetime.now(datetime.UTC)
    defect_dict["updated_at"] = datetime.datetime.now(datetime.UTC)

    result = await db.defects.insert_one(defect_dict)
    defect_dict["_id"] = str(result.inserted_id)

    return DefectResponse(**defect_dict)


@router.put("/defects/{defect_id}", response_model=DefectResponse)
async def update_defect(
    defect_id: str,
    defect_data: DefectUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(defect_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的缺陷ID"
        )

    update_data = defect_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="没有提供更新数据"
        )

    update_data["updated_at"] = datetime.datetime.now(datetime.UTC)

    result = await db.defects.update_one(
        {"_id": ObjectId(defect_id)},
        {"$set": update_data},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="缺陷不存在")

    updated = await db.defects.find_one({"_id": ObjectId(defect_id)})
    updated["_id"] = str(updated["_id"])
    return DefectResponse(**updated)


@router.delete("/defects/{defect_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_defect(
    defect_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(defect_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的缺陷ID"
        )

    result = await db.defects.delete_one({"_id": ObjectId(defect_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="缺陷不存在")


@router.get("/reports", response_model=list[TestReportResponse])
async def list_test_reports(
    skip: int = 0,
    limit: int = 20,
    project_id: str | None = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    query = {}
    if project_id:
        query["project_id"] = project_id

    cursor = db.test_reports.find(query).skip(skip).limit(limit).sort("created_at", -1)
    reports = await cursor.to_list(length=limit)

    result = []
    for r in reports:
        r["_id"] = str(r["_id"])
        result.append(TestReportResponse(**r))
    return result


@router.get("/reports/{report_id}", response_model=TestReportResponse)
async def get_test_report(
    report_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(report_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的报告ID"
        )

    report = await db.test_reports.find_one({"_id": ObjectId(report_id)})
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="报告不存在")

    report["_id"] = str(report["_id"])
    return TestReportResponse(**report)


@router.post(
    "/reports", response_model=TestReportResponse, status_code=status.HTTP_201_CREATED
)
async def create_test_report(
    report_data: TestReportCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    report_dict = report_data.model_dump()
    report_dict["created_at"] = datetime.datetime.now(datetime.UTC)
    report_dict["updated_at"] = datetime.datetime.now(datetime.UTC)

    if report_dict["total_cases"] > 0:
        report_dict["pass_rate"] = round(
            (report_dict["passed"] / report_dict["total_cases"]) * 100, 2
        )

    result = await db.test_reports.insert_one(report_dict)
    report_dict["_id"] = str(result.inserted_id)

    return TestReportResponse(**report_dict)


@router.put("/reports/{report_id}", response_model=TestReportResponse)
async def update_test_report(
    report_id: str,
    report_data: TestReportUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(report_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的报告ID"
        )

    update_data = report_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="没有提供更新数据"
        )

    if "total_cases" in update_data or "passed" in update_data:
        report = await db.test_reports.find_one({"_id": ObjectId(report_id)})
        if report:
            total = update_data.get("total_cases", report.get("total_cases", 0))
            passed = update_data.get("passed", report.get("passed", 0))
            if total > 0:
                update_data["pass_rate"] = round((passed / total) * 100, 2)

    update_data["updated_at"] = datetime.datetime.now(datetime.UTC)

    result = await db.test_reports.update_one(
        {"_id": ObjectId(report_id)},
        {"$set": update_data},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="报告不存在")

    updated = await db.test_reports.find_one({"_id": ObjectId(report_id)})
    updated["_id"] = str(updated["_id"])
    return TestReportResponse(**updated)


@router.delete("/reports/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_test_report(
    report_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(report_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的报告ID"
        )

    result = await db.test_reports.delete_one({"_id": ObjectId(report_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="报告不存在")
