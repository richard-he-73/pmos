import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.dependencies import get_current_user
from app.schemas.auth import UserInDB
from app.schemas.requirement import (
    RequirementCreate,
    RequirementResponse,
    RequirementUpdate,
)

router = APIRouter(prefix="/requirements", tags=["需求管理"])


@router.get("", response_model=list[RequirementResponse])
async def list_requirements(
    skip: int = 0,
    limit: int = 20,
    project_id: str | None = None,
    status_filter: str | None = None,
    type_filter: str | None = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    query = {}
    if project_id:
        query["project_id"] = project_id
    if status_filter:
        query["status"] = status_filter
    if type_filter:
        query["type"] = type_filter

    cursor = db.requirements.find(query).skip(skip).limit(limit).sort("created_at", -1)
    requirements = await cursor.to_list(length=limit)

    result = []
    for r in requirements:
        r["_id"] = str(r["_id"])
        result.append(RequirementResponse(**r))
    return result


@router.get("/{requirement_id}", response_model=RequirementResponse)
async def get_requirement(
    requirement_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(requirement_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的需求ID"
        )

    requirement = await db.requirements.find_one({"_id": ObjectId(requirement_id)})
    if not requirement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="需求不存在")

    requirement["_id"] = str(requirement["_id"])
    return RequirementResponse(**requirement)


@router.post(
    "", response_model=RequirementResponse, status_code=status.HTTP_201_CREATED
)
async def create_requirement(
    requirement_data: RequirementCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    existing = await db.requirements.find_one({"code": requirement_data.code})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="需求编号已存在"
        )

    requirement_dict = requirement_data.model_dump()
    requirement_dict["created_at"] = datetime.datetime.now(datetime.UTC)
    requirement_dict["updated_at"] = datetime.datetime.now(datetime.UTC)

    result = await db.requirements.insert_one(requirement_dict)
    requirement_dict["_id"] = str(result.inserted_id)

    return RequirementResponse(**requirement_dict)


@router.put("/{requirement_id}", response_model=RequirementResponse)
async def update_requirement(
    requirement_id: str,
    requirement_data: RequirementUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(requirement_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的需求ID"
        )

    update_data = requirement_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="没有提供更新数据"
        )

    update_data["updated_at"] = datetime.datetime.now(datetime.UTC)

    result = await db.requirements.update_one(
        {"_id": ObjectId(requirement_id)},
        {"$set": update_data},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="需求不存在")

    updated = await db.requirements.find_one({"_id": ObjectId(requirement_id)})
    updated["_id"] = str(updated["_id"])
    return RequirementResponse(**updated)


@router.delete("/{requirement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_requirement(
    requirement_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(requirement_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的需求ID"
        )

    result = await db.requirements.delete_one({"_id": ObjectId(requirement_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="需求不存在")
