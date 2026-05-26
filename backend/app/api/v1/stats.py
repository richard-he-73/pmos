import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.dependencies import get_current_user
from app.schemas.auth import UserInDB

router = APIRouter(prefix="/stats", tags=["统计"])


@router.get("")
async def get_stats(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    project_stats = await db.projects.aggregate(
        [
            {"$group": {"_id": "$status", "count": {"$sum": 1}}},
        ]
    ).to_list(length=10)

    task_stats = await db.tasks.aggregate(
        [
            {"$group": {"_id": "$status", "count": {"$sum": 1}}},
        ]
    ).to_list(length=10)

    task_priority_stats = await db.tasks.aggregate(
        [
            {"$group": {"_id": "$priority", "count": {"$sum": 1}}},
        ]
    ).to_list(length=10)

    resource_stats = await db.resources.aggregate(
        [
            {"$group": {"_id": "$type", "count": {"$sum": 1}}},
        ]
    ).to_list(length=10)

    total_projects = await db.projects.count_documents({})
    total_tasks = await db.tasks.count_documents({})
    total_resources = await db.resources.count_documents({})

    return {
        "projects": {
            "total": total_projects,
            "by_status": {s["_id"]: s["count"] for s in project_stats},
        },
        "tasks": {
            "total": total_tasks,
            "by_status": {s["_id"]: s["count"] for s in task_stats},
            "by_priority": {s["_id"]: s["count"] for s in task_priority_stats},
        },
        "resources": {
            "total": total_resources,
            "by_type": {s["_id"]: s["count"] for s in resource_stats},
        },
    }


@router.get("/chart/project-status")
async def get_project_status_chart(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    stats = await db.projects.aggregate(
        [
            {"$group": {"_id": "$status", "count": {"$sum": 1}}},
            {"$project": {"name": "$_id", "value": "$count", "_id": 0}},
        ]
    ).to_list(length=10)

    return stats


@router.get("/chart/task-priority")
async def get_task_priority_chart(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    stats = await db.tasks.aggregate(
        [
            {"$group": {"_id": "$priority", "count": {"$sum": 1}}},
            {"$project": {"name": "$_id", "value": "$count", "_id": 0}},
        ]
    ).to_list(length=10)

    return stats


@router.get("/chart/task-trend")
async def get_task_trend_chart(
    limit: int = 30,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    tasks = (
        await db.tasks.find(
            {},
            {"created_at": 1, "status": 1},
        )
        .sort("created_at", -1)
        .limit(limit)
        .to_list(length=limit)
    )

    tasks.reverse()

    trend_data = []
    for t in tasks:
        trend_data.append(
            {
                "date": (
                    t["created_at"].strftime("%Y-%m-%d")
                    if hasattr(t["created_at"], "strftime")
                    else str(t["created_at"])[:10]
                ),
                "status": t["status"],
            }
        )

    return trend_data


@router.get("/chart/budget-usage")
async def get_budget_usage_chart(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    projects = (
        await db.projects.find(
            {"budget_total": {"$gt": 0}},
            {"name": 1, "budget_total": 1, "budget_used": 1},
        )
        .limit(20)
        .to_list(length=20)
    )

    result = []
    for p in projects:
        result.append(
            {
                "name": p["name"],
                "total": p.get("budget_total", 0),
                "used": p.get("budget_used", 0),
                "usage_percent": (
                    round((p.get("budget_used", 0) / p.get("budget_total", 1)) * 100, 2)
                    if p.get("budget_total", 0) > 0
                    else 0
                ),
            }
        )

    return result


@router.get("/chart/resource-utilization")
async def get_resource_utilization_chart(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    resources = (
        await db.resources.find(
            {"capacity": {"$gt": 0}},
            {"name": 1, "capacity": 1, "allocated": 1, "type": 1},
        )
        .limit(20)
        .to_list(length=20)
    )

    result = []
    for r in resources:
        capacity = r.get("capacity", 1)
        allocated = r.get("allocated", 0)
        result.append(
            {
                "name": r["name"],
                "type": r.get("type", "unknown"),
                "capacity": capacity,
                "allocated": allocated,
                "utilization": (
                    round((allocated / capacity) * 100, 2) if capacity > 0 else 0
                ),
            }
        )

    return result


@router.get("/alerts")
async def get_alerts(
    level: str | None = None,
    limit: int = 20,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    query = {}
    if level:
        query["level"] = level
    
    alerts = (
        await db.alerts.find(query)
        .sort("created_at", -1)
        .limit(limit)
        .to_list(length=limit)
    )
    
    result = []
    for alert in alerts:
        alert["_id"] = str(alert["_id"])
        result.append(alert)
    
    return result


@router.post("/alerts")
async def create_alert(
    alert_data: dict,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    alert_dict = {
        **alert_data,
        "created_at": datetime.datetime.now(datetime.UTC),
        "updated_at": datetime.datetime.now(datetime.UTC),
        "is_read": False,
    }
    
    result = await db.alerts.insert_one(alert_dict)
    alert_dict["_id"] = str(result.inserted_id)
    
    return alert_dict


@router.put("/alerts/{alert_id}")
async def update_alert(
    alert_id: str,
    update_data: dict,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(alert_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="无效的预警ID")
    
    update_data["updated_at"] = datetime.datetime.now(datetime.UTC)
    
    result = await db.alerts.update_one(
        {"_id": ObjectId(alert_id)},
        {"$set": update_data},
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="预警不存在")
    
    updated = await db.alerts.find_one({"_id": ObjectId(alert_id)})
    updated["_id"] = str(updated["_id"])
    return updated


@router.get("/gantt/tasks")
async def get_task_gantt_data(
    project_id: str | None = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    query = {}
    if project_id:
        query["project_id"] = project_id

    tasks = (
        await db.tasks.find(
            {**query, "start_date": {"$exists": True}, "due_date": {"$exists": True}},
            {
                "_id": 1,
                "title": 1,
                "start_date": 1,
                "due_date": 1,
                "status": 1,
                "progress": 1,
                "dependencies": 1,
            },
        )
        .sort("start_date", 1)
        .limit(50)
        .to_list(length=50)
    )

    result = []
    for t in tasks:
        start_date = t.get("start_date")
        due_date = t.get("due_date")
        if not start_date or not due_date:
            continue

        result.append(
            {
                "id": str(t["_id"]),
                "name": t["title"],
                "start": (
                    start_date.strftime("%Y-%m-%d")
                    if hasattr(start_date, "strftime")
                    else str(start_date)[:10]
                ),
                "end": (
                    due_date.strftime("%Y-%m-%d")
                    if hasattr(due_date, "strftime")
                    else str(due_date)[:10]
                ),
                "progress": t.get("progress", 0),
                "status": t.get("status", "todo"),
                "dependencies": t.get("dependencies", []),
            }
        )

    return result
