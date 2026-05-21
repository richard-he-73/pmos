import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.dependencies import get_current_user
from app.schemas.auth import UserInDB
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["项目"])


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
