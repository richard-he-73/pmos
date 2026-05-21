import csv
import io
import json
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.dependencies import get_current_user
from app.schemas.auth import UserInDB

router = APIRouter(prefix="/export", tags=["报表导出"])


def dict_to_csv(data: list[dict]) -> str:
    if not data:
        return ""
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=data[0].keys())
    writer.writeheader()
    writer.writerows(data)
    return output.getvalue()


def clean_for_json(obj: dict) -> dict:
    cleaned = {}
    for key, value in obj.items():
        if isinstance(value, datetime):
            cleaned[key] = value.strftime("%Y-%m-%d %H:%M:%S")
        elif isinstance(value, dict):
            cleaned[key] = clean_for_json(value)
        else:
            cleaned[key] = value
    return cleaned


@router.get("/projects/csv")
async def export_projects_csv(
    response: Response,
    status_filter: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    query = {}
    if status_filter:
        query["status"] = status_filter

    cursor = db.projects.find(query).sort("created_at", -1)
    projects = await cursor.to_list(length=1000)

    data = []
    for p in projects:
        data.append(
            {
                "_id": str(p["_id"]),
                "code": p.get("code", ""),
                "name": p.get("name", ""),
                "description": p.get("description", ""),
                "status": p.get("status", ""),
                "priority": p.get("priority", ""),
                "progress": p.get("progress", 0),
                "budget_total": p.get("budget_total", 0),
                "budget_used": p.get("budget_used", 0),
                "start_date": (
                    p.get("start_date").strftime("%Y-%m-%d")
                    if p.get("start_date")
                    else ""
                ),
                "end_date": (
                    p.get("end_date").strftime("%Y-%m-%d") if p.get("end_date") else ""
                ),
                "created_at": (
                    p.get("created_at").strftime("%Y-%m-%d %H:%M:%S")
                    if p.get("created_at")
                    else ""
                ),
            }
        )

    csv_content = dict_to_csv(data)

    response.headers["Content-Disposition"] = "attachment; filename=projects.csv"
    return Response(content=csv_content, media_type="text/csv")


@router.get("/projects/json")
async def export_projects_json(
    status_filter: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    query = {}
    if status_filter:
        query["status"] = status_filter

    cursor = db.projects.find(query).sort("created_at", -1)
    projects = await cursor.to_list(length=1000)

    data = []
    for p in projects:
        p["_id"] = str(p["_id"])
        data.append(clean_for_json(p))

    return Response(
        content=json.dumps(data, ensure_ascii=False, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=projects.json"},
    )


@router.get("/tasks/csv")
async def export_tasks_csv(
    response: Response,
    project_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    query = {}
    if project_id:
        query["project_id"] = project_id
    if status_filter:
        query["status"] = status_filter

    cursor = db.tasks.find(query).sort("created_at", -1)
    tasks = await cursor.to_list(length=1000)

    data = []
    for t in tasks:
        data.append(
            {
                "_id": str(t["_id"]),
                "project_id": t.get("project_id", ""),
                "title": t.get("title", ""),
                "description": t.get("description", ""),
                "status": t.get("status", ""),
                "priority": t.get("priority", ""),
                "type": t.get("type", ""),
                "assignee_id": t.get("assignee_id", ""),
                "estimate_hours": t.get("estimate_hours", ""),
                "actual_hours": t.get("actual_hours", ""),
                "start_date": (
                    t.get("start_date").strftime("%Y-%m-%d")
                    if t.get("start_date")
                    else ""
                ),
                "due_date": (
                    t.get("due_date").strftime("%Y-%m-%d") if t.get("due_date") else ""
                ),
                "completed_at": (
                    t.get("completed_at").strftime("%Y-%m-%d %H:%M:%S")
                    if t.get("completed_at")
                    else ""
                ),
                "created_at": (
                    t.get("created_at").strftime("%Y-%m-%d %H:%M:%S")
                    if t.get("created_at")
                    else ""
                ),
            }
        )

    csv_content = dict_to_csv(data)

    response.headers["Content-Disposition"] = "attachment; filename=tasks.csv"
    return Response(content=csv_content, media_type="text/csv")


@router.get("/tasks/json")
async def export_tasks_json(
    project_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    query = {}
    if project_id:
        query["project_id"] = project_id
    if status_filter:
        query["status"] = status_filter

    cursor = db.tasks.find(query).sort("created_at", -1)
    tasks = await cursor.to_list(length=1000)

    data = []
    for t in tasks:
        t["_id"] = str(t["_id"])
        data.append(clean_for_json(t))

    return Response(
        content=json.dumps(data, ensure_ascii=False, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=tasks.json"},
    )


@router.get("/risks/csv")
async def export_risks_csv(
    response: Response,
    project_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    query = {}
    if project_id:
        query["project_id"] = project_id
    if status_filter:
        query["status"] = status_filter

    cursor = db.risks.find(query).sort("created_at", -1)
    risks = await cursor.to_list(length=1000)

    data = []
    for r in risks:
        data.append(
            {
                "_id": str(r["_id"]),
                "project_id": r.get("project_id", ""),
                "title": r.get("title", ""),
                "description": r.get("description", ""),
                "category": r.get("category", ""),
                "probability": r.get("probability", ""),
                "impact": r.get("impact", ""),
                "severity": r.get("severity", 0),
                "status": r.get("status", ""),
                "owner_id": r.get("owner_id", ""),
                "mitigation_plan": r.get("mitigation_plan", ""),
                "contingency_plan": r.get("contingency_plan", ""),
                "created_at": (
                    r.get("created_at").strftime("%Y-%m-%d %H:%M:%S")
                    if r.get("created_at")
                    else ""
                ),
            }
        )

    csv_content = dict_to_csv(data)

    response.headers["Content-Disposition"] = "attachment; filename=risks.csv"
    return Response(content=csv_content, media_type="text/csv")


@router.get("/requirements/csv")
async def export_requirements_csv(
    response: Response,
    project_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    query = {}
    if project_id:
        query["project_id"] = project_id
    if status_filter:
        query["status"] = status_filter

    cursor = db.requirements.find(query).sort("created_at", -1)
    requirements = await cursor.to_list(length=1000)

    data = []
    for req in requirements:
        data.append(
            {
                "_id": str(req["_id"]),
                "project_id": req.get("project_id", ""),
                "code": req.get("code", ""),
                "title": req.get("title", ""),
                "description": req.get("description", ""),
                "type": req.get("type", ""),
                "status": req.get("status", ""),
                "priority": req.get("priority", ""),
                "source": req.get("source", ""),
                "version": req.get("version", 1),
                "acceptance_criteria": "; ".join(req.get("acceptance_criteria", [])),
                "created_at": (
                    req.get("created_at").strftime("%Y-%m-%d %H:%M:%S")
                    if req.get("created_at")
                    else ""
                ),
            }
        )

    csv_content = dict_to_csv(data)

    response.headers["Content-Disposition"] = "attachment; filename=requirements.csv"
    return Response(content=csv_content, media_type="text/csv")


@router.get("/summary/report")
async def export_summary_report(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    project_stats = await db.projects.aggregate(
        [{"$group": {"_id": "$status", "count": {"$sum": 1}}}]
    ).to_list(length=10)

    task_stats = await db.tasks.aggregate(
        [{"$group": {"_id": "$status", "count": {"$sum": 1}}}]
    ).to_list(length=10)

    risk_stats = await db.risks.aggregate(
        [{"$group": {"_id": "$status", "count": {"$sum": 1}}}]
    ).to_list(length=10)

    req_stats = await db.requirements.aggregate(
        [{"$group": {"_id": "$status", "count": {"$sum": 1}}}]
    ).to_list(length=10)

    report = {
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "projects": {
            "total": await db.projects.count_documents({}),
            "by_status": {s["_id"]: s["count"] for s in project_stats},
        },
        "tasks": {
            "total": await db.tasks.count_documents({}),
            "by_status": {s["_id"]: s["count"] for s in task_stats},
        },
        "risks": {
            "total": await db.risks.count_documents({}),
            "by_status": {s["_id"]: s["count"] for s in risk_stats},
        },
        "requirements": {
            "total": await db.requirements.count_documents({}),
            "by_status": {s["_id"]: s["count"] for s in req_stats},
        },
    }

    return Response(
        content=json.dumps(report, ensure_ascii=False, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=summary_report.json"},
    )
