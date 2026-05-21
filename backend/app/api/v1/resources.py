import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.dependencies import get_current_user
from app.schemas.auth import UserInDB
from app.schemas.resource import ResourceCreate, ResourceResponse, ResourceUpdate

router = APIRouter(prefix="/resources", tags=["资源"])


@router.get("", response_model=list[ResourceResponse])
async def list_resources(
    skip: int = 0,
    limit: int = 50,
    type_filter: str | None = None,
    availability: str | None = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    query = {}
    if type_filter:
        query["type"] = type_filter
    if availability:
        query["availability"] = availability

    cursor = db.resources.find(query).skip(skip).limit(limit).sort("created_at", -1)
    resources = await cursor.to_list(length=limit)

    result = []
    for r in resources:
        r["_id"] = str(r["_id"])
        result.append(ResourceResponse(**r))
    return result


@router.get("/{resource_id}", response_model=ResourceResponse)
async def get_resource(
    resource_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(resource_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的资源ID"
        )

    resource = await db.resources.find_one({"_id": ObjectId(resource_id)})
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="资源不存在")

    resource["_id"] = str(resource["_id"])
    return ResourceResponse(**resource)


@router.post("", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
async def create_resource(
    resource_data: ResourceCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    resource_dict = resource_data.model_dump()
    resource_dict["created_at"] = datetime.datetime.now(datetime.UTC)
    resource_dict["updated_at"] = datetime.datetime.now(datetime.UTC)

    result = await db.resources.insert_one(resource_dict)
    resource_dict["_id"] = str(result.inserted_id)

    return ResourceResponse(**resource_dict)


@router.put("/{resource_id}", response_model=ResourceResponse)
async def update_resource(
    resource_id: str,
    resource_data: ResourceUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(resource_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的资源ID"
        )

    update_data = resource_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="没有提供更新数据"
        )

    update_data["updated_at"] = datetime.datetime.now(datetime.UTC)

    result = await db.resources.update_one(
        {"_id": ObjectId(resource_id)},
        {"$set": update_data},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="资源不存在")

    updated = await db.resources.find_one({"_id": ObjectId(resource_id)})
    updated["_id"] = str(updated["_id"])
    return ResourceResponse(**updated)


@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(
    resource_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(resource_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的资源ID"
        )

    result = await db.resources.delete_one({"_id": ObjectId(resource_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="资源不存在")


@router.get("/conflicts", response_model=dict)
async def check_resource_conflicts(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    tasks_cursor = db.tasks.find(
        {"assignee_id": {"$ne": None}, "start_date": {"$ne": None}, "due_date": {"$ne": None}},
        {"_id": 1, "title": 1, "assignee_id": 1, "start_date": 1, "due_date": 1, "project_id": 1}
    )
    tasks = await tasks_cursor.to_list(length=None)

    for t in tasks:
        t["_id"] = str(t["_id"])

    assignee_tasks = {}
    for task in tasks:
        assignee = task["assignee_id"]
        if assignee not in assignee_tasks:
            assignee_tasks[assignee] = []
        assignee_tasks[assignee].append(task)

    conflicts = []
    for assignee, assigned_tasks in assignee_tasks.items():
        for i, task_a in enumerate(assigned_tasks):
            for task_b in assigned_tasks[i + 1:]:
                if task_a["_id"] == task_b["_id"]:
                    continue

                a_start, a_end = task_a["start_date"], task_a["due_date"]
                b_start, b_end = task_b["start_date"], task_b["due_date"]

                if a_start and b_end and a_start < b_end and b_start and a_end and b_start < a_end:
                    conflicts.append({
                        "assignee_id": assignee,
                        "task_a": {"id": task_a["_id"], "title": task_a["title"], "project_id": task_a["project_id"]},
                        "task_b": {"id": task_b["_id"], "title": task_b["title"], "project_id": task_b["project_id"]},
                        "overlap_start": max(a_start, b_start).isoformat() if a_start > b_start else b_start.isoformat(),
                        "overlap_end": min(a_end, b_end).isoformat() if a_end < b_end else a_end.isoformat(),
                    })

    return {
        "total_conflicts": len(conflicts),
        "conflicts": conflicts,
    }


@router.get("/alerts", response_model=dict)
async def get_alerts(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    now = datetime.datetime.now(datetime.UTC)

    overdue_tasks_cursor = db.tasks.find({
        "due_date": {"$lt": now},
        "status": {"$nin": ["done", "cancelled"]},
    })
    overdue_tasks = await overdue_tasks_cursor.to_list(length=None)
    for t in overdue_tasks:
        t["_id"] = str(t["_id"])

    upcoming_deadlines_cursor = db.tasks.find({
        "due_date": {"$gte": now, "$lte": now + datetime.timedelta(days=3)},
        "status": {"$nin": ["done", "cancelled"]},
    })
    upcoming_deadlines = await upcoming_deadlines_cursor.to_list(length=None)
    for t in upcoming_deadlines:
        t["_id"] = str(t["_id"])

    over_budget_cursor = db.projects.find({
        "$expr": {"$gt": ["$budget_used", {"$multiply": ["$budget_total", 0.8]}]},
    })
    over_budget = await over_budget_cursor.to_list(length=None)
    for p in over_budget:
        p["_id"] = str(p["_id"])

    delayed_projects_cursor = db.projects.find({
        "end_date": {"$lt": now},
        "status": "active",
    })
    delayed_projects = await delayed_projects_cursor.to_list(length=None)
    for p in delayed_projects:
        p["_id"] = str(p["_id"])

    high_risks_cursor = db.risks.find({
        "probability": {"$gte": 0.7},
        "status": {"$nin": ["closed", "mitigated"]},
    })
    high_risks = await high_risks_cursor.to_list(length=None)
    for r in high_risks:
        r["_id"] = str(r["_id"])

    critical_defects_cursor = db.defects.find({
        "severity": "critical",
        "status": {"$nin": ["resolved", "closed"]},
    })
    critical_defects = await critical_defects_cursor.to_list(length=None)
    for d in critical_defects:
        d["_id"] = str(d["_id"])

    return {
        "alerts": {
            "overdue_tasks": {
                "count": len(overdue_tasks),
                "items": overdue_tasks[:10],
            },
            "upcoming_deadlines": {
                "count": len(upcoming_deadlines),
                "items": upcoming_deadlines[:10],
            },
            "over_budget_projects": {
                "count": len(over_budget),
                "items": over_budget[:5],
            },
            "delayed_projects": {
                "count": len(delayed_projects),
                "items": delayed_projects[:5],
            },
            "high_risks": {
                "count": len(high_risks),
                "items": high_risks[:10],
            },
            "critical_defects": {
                "count": len(critical_defects),
                "items": critical_defects[:10],
            },
        },
        "total_alerts": (
            len(overdue_tasks)
            + len(upcoming_deadlines)
            + len(over_budget)
            + len(delayed_projects)
            + len(high_risks)
            + len(critical_defects)
        ),
    }
