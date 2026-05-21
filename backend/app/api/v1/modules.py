import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.dependencies import get_current_user
from app.schemas.auth import UserInDB
from app.schemas.module import (
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

router = APIRouter(prefix="/configuration", tags=["配置管理"])


@router.get("/items", response_model=list[ConfigItemResponse])
async def list_config_items(
    skip: int = 0,
    limit: int = 50,
    category: str | None = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    query = {}
    if category:
        query["category"] = category
    cursor = db.config_items.find(query).skip(skip).limit(limit).sort("created_at", -1)
    items = await cursor.to_list(length=limit)
    result = []
    for item in items:
        item["_id"] = str(item["_id"])
        if item.get("is_sensitive"):
            item["value"] = "***"
        result.append(ConfigItemResponse(**item))
    return result


@router.post("/items", response_model=ConfigItemResponse, status_code=status.HTTP_201_CREATED)
async def create_config_item(
    item_data: ConfigItemCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    item_dict = item_data.model_dump()
    item_dict["created_at"] = datetime.datetime.now(datetime.UTC)
    item_dict["updated_at"] = datetime.datetime.now(datetime.UTC)
    result = await db.config_items.insert_one(item_dict)
    item_dict["_id"] = str(result.inserted_id)
    return ConfigItemResponse(**item_dict)


@router.put("/items/{item_id}", response_model=ConfigItemResponse)
async def update_config_item(
    item_id: str,
    item_data: ConfigItemUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="无效的配置ID")
    update_data = item_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="没有提供更新数据")
    update_data["updated_at"] = datetime.datetime.now(datetime.UTC)
    result = await db.config_items.update_one({"_id": ObjectId(item_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="配置不存在")
    updated = await db.config_items.find_one({"_id": ObjectId(item_id)})
    updated["_id"] = str(updated["_id"])
    if updated.get("is_sensitive"):
        updated["value"] = "***"
    return ConfigItemResponse(**updated)


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_config_item(
    item_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="无效的配置ID")
    result = await db.config_items.delete_one({"_id": ObjectId(item_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="配置不存在")


@router.get("/drills", response_model=list[DrillPlanResponse])
async def list_drills(
    skip: int = 0,
    limit: int = 20,
    project_id: str | None = None,
    status_filter: str | None = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    query = {}
    if project_id:
        query["project_id"] = project_id
    if status_filter:
        query["status"] = status_filter
    cursor = db.drill_plans.find(query).skip(skip).limit(limit).sort("created_at", -1)
    drills = await cursor.to_list(length=limit)
    result = []
    for d in drills:
        d["_id"] = str(d["_id"])
        result.append(DrillPlanResponse(**d))
    return result


@router.post("/drills", response_model=DrillPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_drill(
    drill_data: DrillPlanCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    drill_dict = drill_data.model_dump()
    drill_dict["created_at"] = datetime.datetime.now(datetime.UTC)
    drill_dict["updated_at"] = datetime.datetime.now(datetime.UTC)
    result = await db.drill_plans.insert_one(drill_dict)
    drill_dict["_id"] = str(result.inserted_id)
    return DrillPlanResponse(**drill_dict)


@router.put("/drills/{drill_id}", response_model=DrillPlanResponse)
async def update_drill(
    drill_id: str,
    drill_data: DrillPlanUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(drill_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="无效的演练ID")
    update_data = drill_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="没有提供更新数据")
    update_data["updated_at"] = datetime.datetime.now(datetime.UTC)
    result = await db.drill_plans.update_one({"_id": ObjectId(drill_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="演练不存在")
    updated = await db.drill_plans.find_one({"_id": ObjectId(drill_id)})
    updated["_id"] = str(updated["_id"])
    return DrillPlanResponse(**updated)


@router.delete("/drills/{drill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_drill(
    drill_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(drill_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="无效的演练ID")
    result = await db.drill_plans.delete_one({"_id": ObjectId(drill_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="演练不存在")


@router.get("/deployments", response_model=list[DeploymentPlanResponse])
async def list_deployments(
    skip: int = 0,
    limit: int = 20,
    project_id: str | None = None,
    status_filter: str | None = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    query = {}
    if project_id:
        query["project_id"] = project_id
    if status_filter:
        query["status"] = status_filter
    cursor = db.deployment_plans.find(query).skip(skip).limit(limit).sort("created_at", -1)
    deployments = await cursor.to_list(length=limit)
    result = []
    for d in deployments:
        d["_id"] = str(d["_id"])
        result.append(DeploymentPlanResponse(**d))
    return result


@router.post("/deployments", response_model=DeploymentPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_deployment(
    deployment_data: DeploymentPlanCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    deploy_dict = deployment_data.model_dump()
    deploy_dict["created_at"] = datetime.datetime.now(datetime.UTC)
    deploy_dict["updated_at"] = datetime.datetime.now(datetime.UTC)
    result = await db.deployment_plans.insert_one(deploy_dict)
    deploy_dict["_id"] = str(result.inserted_id)
    return DeploymentPlanResponse(**deploy_dict)


@router.put("/deployments/{deployment_id}", response_model=DeploymentPlanResponse)
async def update_deployment(
    deployment_id: str,
    deployment_data: DeploymentPlanUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(deployment_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="无效的投产ID")
    update_data = deployment_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="没有提供更新数据")
    update_data["updated_at"] = datetime.datetime.now(datetime.UTC)
    result = await db.deployment_plans.update_one({"_id": ObjectId(deployment_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="投产不存在")
    updated = await db.deployment_plans.find_one({"_id": ObjectId(deployment_id)})
    updated["_id"] = str(updated["_id"])
    return DeploymentPlanResponse(**updated)


@router.delete("/deployments/{deployment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_deployment(
    deployment_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(deployment_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="无效的投产ID")
    result = await db.deployment_plans.delete_one({"_id": ObjectId(deployment_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="投产不存在")


@router.get("/work-records", response_model=list[WorkRecordResponse])
async def list_work_records(
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
    cursor = db.work_records.find(query).skip(skip).limit(limit).sort("created_at", -1)
    records = await cursor.to_list(length=limit)
    result = []
    for r in records:
        r["_id"] = str(r["_id"])
        result.append(WorkRecordResponse(**r))
    return result


@router.post("/work-records", response_model=WorkRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_work_record(
    record_data: WorkRecordCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    record_dict = record_data.model_dump()
    record_dict["created_at"] = datetime.datetime.now(datetime.UTC)
    record_dict["updated_at"] = datetime.datetime.now(datetime.UTC)
    result = await db.work_records.insert_one(record_dict)
    record_dict["_id"] = str(result.inserted_id)
    return WorkRecordResponse(**record_dict)


@router.put("/work-records/{record_id}", response_model=WorkRecordResponse)
async def update_work_record(
    record_id: str,
    record_data: WorkRecordUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(record_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="无效的工时记录ID")
    update_data = record_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="没有提供更新数据")
    update_data["updated_at"] = datetime.datetime.now(datetime.UTC)
    result = await db.work_records.update_one({"_id": ObjectId(record_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="记录不存在")
    updated = await db.work_records.find_one({"_id": ObjectId(record_id)})
    updated["_id"] = str(updated["_id"])
    return WorkRecordResponse(**updated)


@router.delete("/work-records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_work_record(
    record_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(record_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="无效的工时记录ID")
    result = await db.work_records.delete_one({"_id": ObjectId(record_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="记录不存在")
