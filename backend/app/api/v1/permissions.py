import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Request, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.dependencies import get_current_user
from app.schemas.auth import UserInDB
from app.schemas.permission import (
    OperationLogCreate,
    OperationLogResponse,
    RoleCreate,
    RoleResponse,
    RoleUpdate,
    UserGroupCreate,
    UserGroupResponse,
    UserGroupUpdate,
)

router = APIRouter(prefix="/permissions", tags=["权限管理"])


@router.get("/roles", response_model=list[RoleResponse])
async def list_roles(
    skip: int = 0,
    limit: int = 20,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    cursor = db.roles.find({}).skip(skip).limit(limit).sort("created_at", -1)
    roles = await cursor.to_list(length=limit)
    result = []
    for r in roles:
        r["_id"] = str(r["_id"])
        result.append(RoleResponse(**r))
    return result


@router.post("/roles", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
async def create_role(
    role_data: RoleCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    role_dict = role_data.model_dump()
    role_dict["created_at"] = datetime.datetime.now(datetime.UTC)
    role_dict["updated_at"] = datetime.datetime.now(datetime.UTC)
    result = await db.roles.insert_one(role_dict)
    role_dict["_id"] = str(result.inserted_id)
    return RoleResponse(**role_dict)


@router.put("/roles/{role_id}", response_model=RoleResponse)
async def update_role(
    role_id: str,
    role_data: RoleUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(role_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="无效的角色ID")
    update_data = role_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="没有提供更新数据")
    update_data["updated_at"] = datetime.datetime.now(datetime.UTC)
    result = await db.roles.update_one({"_id": ObjectId(role_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="角色不存在")
    updated = await db.roles.find_one({"_id": ObjectId(role_id)})
    updated["_id"] = str(updated["_id"])
    return RoleResponse(**updated)


@router.delete("/roles/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_role(
    role_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(role_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="无效的角色ID")
    role = await db.roles.find_one({"_id": ObjectId(role_id)})
    if role and role.get("is_system"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="系统角色不可删除")
    result = await db.roles.delete_one({"_id": ObjectId(role_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="角色不存在")


@router.get("/groups", response_model=list[UserGroupResponse])
async def list_groups(
    skip: int = 0,
    limit: int = 20,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    cursor = db.user_groups.find({}).skip(skip).limit(limit).sort("created_at", -1)
    groups = await cursor.to_list(length=limit)
    result = []
    for g in groups:
        g["_id"] = str(g["_id"])
        result.append(UserGroupResponse(**g))
    return result


@router.post("/groups", response_model=UserGroupResponse, status_code=status.HTTP_201_CREATED)
async def create_group(
    group_data: UserGroupCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    group_dict = group_data.model_dump()
    group_dict["created_at"] = datetime.datetime.now(datetime.UTC)
    group_dict["updated_at"] = datetime.datetime.now(datetime.UTC)
    result = await db.user_groups.insert_one(group_dict)
    group_dict["_id"] = str(result.inserted_id)
    return UserGroupResponse(**group_dict)


@router.put("/groups/{group_id}", response_model=UserGroupResponse)
async def update_group(
    group_id: str,
    group_data: UserGroupUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(group_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="无效的分组ID")
    update_data = group_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="没有提供更新数据")
    update_data["updated_at"] = datetime.datetime.now(datetime.UTC)
    result = await db.user_groups.update_one({"_id": ObjectId(group_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="分组不存在")
    updated = await db.user_groups.find_one({"_id": ObjectId(group_id)})
    updated["_id"] = str(updated["_id"])
    return UserGroupResponse(**updated)


@router.delete("/groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_group(
    group_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(group_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="无效的分组ID")
    result = await db.user_groups.delete_one({"_id": ObjectId(group_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="分组不存在")


@router.get("/logs", response_model=list[OperationLogResponse])
async def list_operation_logs(
    skip: int = 0,
    limit: int = 50,
    user_id: str | None = None,
    action: str | None = None,
    resource_type: str | None = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    query = {}
    if user_id:
        query["user_id"] = user_id
    if action:
        query["action"] = action
    if resource_type:
        query["resource_type"] = resource_type
    cursor = db.operation_logs.find(query).skip(skip).limit(limit).sort("created_at", -1)
    logs = await cursor.to_list(length=limit)
    result = []
    for log in logs:
        log["_id"] = str(log["_id"])
        result.append(OperationLogResponse(**log))
    return result


@router.post("/logs", response_model=OperationLogResponse, status_code=status.HTTP_201_CREATED)
async def create_operation_log(
    log_data: OperationLogCreate,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    log_dict = log_data.model_dump()
    log_dict["ip_address"] = request.client.host if request.client else ""
    log_dict["user_agent"] = request.headers.get("user-agent", "")
    log_dict["created_at"] = datetime.datetime.now(datetime.UTC)
    log_dict["updated_at"] = datetime.datetime.now(datetime.UTC)
    result = await db.operation_logs.insert_one(log_dict)
    log_dict["_id"] = str(result.inserted_id)
    return OperationLogResponse(**log_dict)
