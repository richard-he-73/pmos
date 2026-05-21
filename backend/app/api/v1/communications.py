import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.dependencies import get_current_user
from app.schemas.auth import UserInDB
from app.schemas.module import (
    CommunicationCreate,
    CommunicationResponse,
    CommunicationUpdate,
    ConfigItemCreate,
    ConfigItemResponse,
    ConfigItemUpdate,
    DeploymentPlanCreate,
    DeploymentPlanResponse,
    DeploymentPlanUpdate,
    DrillPlanCreate,
    DrillPlanResponse,
    DrillPlanUpdate,
    WorkRecordCreate,
    WorkRecordResponse,
    WorkRecordUpdate,
)

router = APIRouter(prefix="/communications", tags=["沟通管理"])


@router.get("", response_model=list[CommunicationResponse])
async def list_communications(
    skip: int = 0,
    limit: int = 20,
    project_id: str | None = None,
    type_filter: str | None = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    query = {}
    if project_id:
        query["project_id"] = project_id
    if type_filter:
        query["type"] = type_filter
    cursor = db.communications.find(query).skip(skip).limit(limit).sort("created_at", -1)
    comms = await cursor.to_list(length=limit)
    result = []
    for c in comms:
        c["_id"] = str(c["_id"])
        result.append(CommunicationResponse(**c))
    return result


@router.post("", response_model=CommunicationResponse, status_code=status.HTTP_201_CREATED)
async def create_communication(
    comm_data: CommunicationCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    comm_dict = comm_data.model_dump()
    comm_dict["created_at"] = datetime.datetime.now(datetime.UTC)
    comm_dict["updated_at"] = datetime.datetime.now(datetime.UTC)
    result = await db.communications.insert_one(comm_dict)
    comm_dict["_id"] = str(result.inserted_id)
    return CommunicationResponse(**comm_dict)


@router.put("/{comm_id}", response_model=CommunicationResponse)
async def update_communication(
    comm_id: str,
    comm_data: CommunicationUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(comm_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="无效的记录ID")
    update_data = comm_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="没有提供更新数据")
    update_data["updated_at"] = datetime.datetime.now(datetime.UTC)
    result = await db.communications.update_one({"_id": ObjectId(comm_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="记录不存在")
    updated = await db.communications.find_one({"_id": ObjectId(comm_id)})
    updated["_id"] = str(updated["_id"])
    return CommunicationResponse(**updated)


@router.delete("/{comm_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_communication(
    comm_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(comm_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="无效的记录ID")
    result = await db.communications.delete_one({"_id": ObjectId(comm_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="记录不存在")
