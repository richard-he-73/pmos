import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.dependencies import get_current_user
from app.schemas.auth import UserInDB
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["任务"])


@router.get("", response_model=list[TaskResponse])
async def list_tasks(
    skip: int = 0,
    limit: int = 50,
    project_id: str | None = None,
    assignee_id: str | None = None,
    status_filter: str | None = None,
    priority: str | None = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    query = {}
    if project_id:
        query["project_id"] = project_id
    if assignee_id:
        query["assignee_id"] = assignee_id
    if status_filter:
        query["status"] = status_filter
    if priority:
        query["priority"] = priority

    cursor = db.tasks.find(query).skip(skip).limit(limit).sort("created_at", -1)
    tasks = await cursor.to_list(length=limit)

    result = []
    for t in tasks:
        t["_id"] = str(t["_id"])
        result.append(TaskResponse(**t))
    return result


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(task_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的任务ID"
        )

    task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="任务不存在")

    task["_id"] = str(task["_id"])
    return TaskResponse(**task)


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    task_dict = task_data.model_dump()
    task_dict["reporter_id"] = task_dict.get("reporter_id", str(current_user.id))
    task_dict["created_at"] = datetime.datetime.now(datetime.UTC)
    task_dict["updated_at"] = datetime.datetime.now(datetime.UTC)

    result = await db.tasks.insert_one(task_dict)
    task_dict["_id"] = str(result.inserted_id)

    return TaskResponse(**task_dict)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(task_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的任务ID"
        )

    update_data = task_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="没有提供更新数据"
        )

    if "status" in update_data and update_data["status"] == "done":
        update_data["completed_at"] = datetime.datetime.now(datetime.UTC)

    update_data["updated_at"] = datetime.datetime.now(datetime.UTC)

    result = await db.tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": update_data},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="任务不存在")

    updated = await db.tasks.find_one({"_id": ObjectId(task_id)})
    updated["_id"] = str(updated["_id"])
    return TaskResponse(**updated)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(task_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的任务ID"
        )

    result = await db.tasks.delete_one({"_id": ObjectId(task_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="任务不存在")


@router.get("/{task_id}/dependencies", response_model=dict)
async def get_task_dependencies(
    task_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(task_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的任务ID"
        )

    task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="任务不存在")

    task["_id"] = str(task["_id"])
    dependencies = task.get("dependencies", [])

    dep_tasks = []
    for dep_id in dependencies:
        if ObjectId.is_valid(dep_id):
            dep_task = await db.tasks.find_one({"_id": ObjectId(dep_id)})
            if dep_task:
                dep_task["_id"] = str(dep_task["_id"])
                dep_tasks.append(dep_task)

    return {
        "task_id": task_id,
        "task_title": task.get("title"),
        "dependencies": dep_tasks,
        "dependency_count": len(dep_tasks),
    }


@router.post("/{task_id}/dependencies", response_model=TaskResponse)
async def add_task_dependency(
    task_id: str,
    dep_data: dict,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(task_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的任务ID"
        )

    dependency_id = dep_data.get("dependency_id")
    if not dependency_id or not ObjectId.is_valid(dependency_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的依赖任务ID"
        )

    task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="任务不存在")

    dep_task = await db.tasks.find_one({"_id": ObjectId(dependency_id)})
    if not dep_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="依赖任务不存在")

    dependencies = task.get("dependencies", [])
    if dependency_id in dependencies:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="依赖已存在")

    if str(task["_id"]) == dependency_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="不能依赖自身")

    await _check_circular_dependency(db, task_id, dependency_id)

    dependencies.append(dependency_id)
    await db.tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"dependencies": dependencies, "updated_at": datetime.datetime.now(datetime.UTC)}},
    )

    updated = await db.tasks.find_one({"_id": ObjectId(task_id)})
    updated["_id"] = str(updated["_id"])
    return TaskResponse(**updated)


@router.delete("/{task_id}/dependencies/{dependency_id}", response_model=TaskResponse)
async def remove_task_dependency(
    task_id: str,
    dependency_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(task_id) or not ObjectId.is_valid(dependency_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的任务ID"
        )

    task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="任务不存在")

    dependencies = task.get("dependencies", [])
    if dependency_id not in dependencies:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="依赖不存在")

    dependencies.remove(dependency_id)
    await db.tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"dependencies": dependencies, "updated_at": datetime.datetime.now(datetime.UTC)}},
    )

    updated = await db.tasks.find_one({"_id": ObjectId(task_id)})
    updated["_id"] = str(updated["_id"])
    return TaskResponse(**updated)


async def _check_circular_dependency(
    db: AsyncIOMotorDatabase, task_id: str, new_dep_id: str, visited: set | None = None
):
    if visited is None:
        visited = set()

    if task_id in visited:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="检测到循环依赖",
        )

    visited.add(task_id)

    dep_task = await db.tasks.find_one({"_id": ObjectId(new_dep_id)})
    if dep_task:
        for dep in dep_task.get("dependencies", []):
            if dep == task_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="检测到循环依赖",
                )
            await _check_circular_dependency(db, task_id, dep, visited.copy())
