import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.dependencies import get_current_user
from app.schemas.auth import UserInDB
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate, ProjectStatusTransition

router = APIRouter(prefix="/projects", tags=["项目"])

PROJECT_STATUS_FLOW = {
    "planning": ["active", "on_hold"],
    "active": ["on_hold", "completed"],
    "on_hold": ["active", "archived"],
    "completed": ["archived"],
    "archived": [],
}

PROJECT_STATUS_TRANSITIONS = {
    "planning": {"active": "启动项目", "on_hold": "暂停项目"},
    "active": {"on_hold": "暂停项目", "completed": "完成项目"},
    "on_hold": {"active": "恢复项目", "archived": "归档项目"},
    "completed": {"archived": "归档项目"},
    "archived": {},
}


@router.get("", response_model=list[ProjectResponse])
async def list_projects(
    skip: int = 0,
    limit: int = 20,
    status_filter: str | None = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    query = {}
    if status_filter:
        query["status"] = status_filter

    cursor = db.projects.find(query).skip(skip).limit(limit).sort("created_at", -1)
    projects = await cursor.to_list(length=limit)

    result = []
    for p in projects:
        p["_id"] = str(p["_id"])
        result.append(ProjectResponse(**p))
    return result


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的项目ID"
        )

    project = await db.projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="项目不存在")

    project["_id"] = str(project["_id"])
    return ProjectResponse(**project)


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    existing = await db.projects.find_one({"code": project_data.code})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="项目编号已存在"
        )

    project_dict = project_data.model_dump()
    # 修复时区问题：将日期设置为当天的开始时间（本地时区）
    if project_dict.get("start_date"):
        dt = project_dict["start_date"]
        project_dict["start_date"] = datetime.datetime(dt.year, dt.month, dt.day)
    if project_dict.get("end_date"):
        dt = project_dict["end_date"]
        project_dict["end_date"] = datetime.datetime(dt.year, dt.month, dt.day)
    
    project_dict["created_at"] = datetime.datetime.now(datetime.UTC)
    project_dict["updated_at"] = datetime.datetime.now(datetime.UTC)

    result = await db.projects.insert_one(project_dict)
    project_dict["_id"] = str(result.inserted_id)

    return ProjectResponse(**project_dict)


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的项目ID"
        )

    update_data = project_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="没有提供更新数据"
        )

    # 修复时区问题：将日期设置为当天的开始时间（本地时区）
    if "start_date" in update_data and update_data["start_date"]:
        dt = update_data["start_date"]
        update_data["start_date"] = datetime.datetime(dt.year, dt.month, dt.day)
    if "end_date" in update_data and update_data["end_date"]:
        dt = update_data["end_date"]
        update_data["end_date"] = datetime.datetime(dt.year, dt.month, dt.day)

    update_data["updated_at"] = datetime.datetime.now(datetime.UTC)

    result = await db.projects.update_one(
        {"_id": ObjectId(project_id)},
        {"$set": update_data},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="项目不存在")

    updated = await db.projects.find_one({"_id": ObjectId(project_id)})
    updated["_id"] = str(updated["_id"])
    return ProjectResponse(**updated)


@router.post("/{project_id}/team-members", response_model=ProjectResponse)
async def add_team_member(
    project_id: str,
    member_data: dict,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的项目ID"
        )
    
    member_id = member_data.get("member_id")
    if not member_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="缺少成员ID"
        )
    
    project = await db.projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="项目不存在")
    
    current_members = project.get("team_members", [])
    if member_id in current_members:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="该成员已在团队中"
        )
    
    await db.projects.update_one(
        {"_id": ObjectId(project_id)},
        {
            "$push": {"team_members": member_id},
            "$set": {"updated_at": datetime.datetime.now(datetime.UTC)}
        }
    )
    
    updated = await db.projects.find_one({"_id": ObjectId(project_id)})
    updated["_id"] = str(updated["_id"])
    return ProjectResponse(**updated)


@router.delete("/{project_id}/team-members/{member_id}", response_model=ProjectResponse)
async def remove_team_member(
    project_id: str,
    member_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的项目ID"
        )
    
    project = await db.projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="项目不存在")
    
    await db.projects.update_one(
        {"_id": ObjectId(project_id)},
        {
            "$pull": {"team_members": member_id},
            "$set": {"updated_at": datetime.datetime.now(datetime.UTC)}
        }
    )
    
    updated = await db.projects.find_one({"_id": ObjectId(project_id)})
    updated["_id"] = str(updated["_id"])
    return ProjectResponse(**updated)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的项目ID"
        )

    result = await db.projects.delete_one({"_id": ObjectId(project_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="项目不存在")


@router.post(
    "/{project_id}/clone",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
async def clone_project(
    project_id: str,
    clone_data: dict,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的项目ID"
        )

    original = await db.projects.find_one({"_id": ObjectId(project_id)})
    if not original:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="项目不存在")

    original.pop("_id")
    original["code"] = f"{original['code']}-COPY"
    original["name"] = clone_data.get("name", f"{original['name']} (复制)")
    original["progress"] = 0
    original["status"] = "planning"
    original["budget_used"] = 0
    original["created_at"] = datetime.datetime.now(datetime.UTC)
    original["updated_at"] = datetime.datetime.now(datetime.UTC)

    result = await db.projects.insert_one(original)
    original["_id"] = str(result.inserted_id)

    return ProjectResponse(**original)


@router.get("/{project_id}/status-flow", response_model=dict)
async def get_status_flow(
    project_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的项目ID"
        )

    project = await db.projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="项目不存在")

    current_status = project.get("status", "planning")
    allowed_transitions = PROJECT_STATUS_FLOW.get(current_status, [])
    transition_descriptions = PROJECT_STATUS_TRANSITIONS.get(current_status, {})

    return {
        "project_id": project_id,
        "current_status": current_status,
        "allowed_transitions": [
            {"status": s, "description": transition_descriptions.get(s, "")}
            for s in allowed_transitions
        ],
        "all_statuses": ["planning", "active", "on_hold", "completed", "archived"],
    }


@router.post(
    "/{project_id}/status-transition",
    response_model=ProjectResponse,
)
async def transition_project_status(
    project_id: str,
    transition_data: ProjectStatusTransition,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的项目ID"
        )

    project = await db.projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="项目不存在")

    current_status = project.get("status", "planning")
    allowed_transitions = PROJECT_STATUS_FLOW.get(current_status, [])

    if transition_data.new_status not in allowed_transitions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"不允许从 '{current_status}' 转换到 '{transition_data.new_status}'。允许的转换: {allowed_transitions}",
        )

    now = datetime.datetime.now(datetime.UTC)
    update_data = {
        "status": transition_data.new_status,
        "updated_at": now,
        "status_transition_reason": transition_data.reason,
        "status_transition_at": now,
        "status_transition_from": current_status,
    }

    if transition_data.new_status == "completed":
        update_data["progress"] = 100.0
        update_data["completed_at"] = now
    elif transition_data.new_status == "active" and current_status == "planning":
        update_data["started_at"] = now
    elif transition_data.new_status == "archived":
        update_data["archived_at"] = now

    await db.projects.update_one(
        {"_id": ObjectId(project_id)},
        {"$set": update_data},
    )

    updated = await db.projects.find_one({"_id": ObjectId(project_id)})
    updated["_id"] = str(updated["_id"])
    return ProjectResponse(**updated)
