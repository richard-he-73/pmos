from datetime import UTC, datetime
from typing import List

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.models.data_dictionary import (
    DataDictionaryCreate,
    DataDictionaryUpdate,
    DataDictionaryResponse,
)

router = APIRouter(prefix="/data-dictionaries", tags=["数据字典"])


@router.get("", response_model=List[DataDictionaryResponse])
async def get_all_data_dictionaries(
    category: str = None,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    query = {}
    if category:
        query["category"] = category

    items = []
    cursor = db.data_dictionaries.find(query).sort("sort_order", 1)
    async for item in cursor:
        item["_id"] = str(item["_id"])
        items.append(DataDictionaryResponse(**item))

    return items


@router.post("", response_model=DataDictionaryResponse, status_code=status.HTTP_201_CREATED)
async def create_data_dictionary(
    item: DataDictionaryCreate,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    existing = await db.data_dictionaries.find_one({
        "category": item.category,
        "code": item.code
    })
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该分类下已存在相同的编码"
        )

    item_dict = item.model_dump()
    item_dict["created_at"] = datetime.now(UTC)
    item_dict["updated_at"] = datetime.now(UTC)

    result = await db.data_dictionaries.insert_one(item_dict)
    item_dict["_id"] = str(result.inserted_id)

    return DataDictionaryResponse(**item_dict)


@router.get("/{item_id}", response_model=DataDictionaryResponse)
async def get_data_dictionary(
    item_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    item = await db.data_dictionaries.find_one({"_id": ObjectId(item_id)})
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="数据字典不存在"
        )

    item["_id"] = str(item["_id"])
    return DataDictionaryResponse(**item)


@router.put("/{item_id}", response_model=DataDictionaryResponse)
async def update_data_dictionary(
    item_id: str,
    item: DataDictionaryUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    existing = await db.data_dictionaries.find_one({"_id": ObjectId(item_id)})
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="数据字典不存在"
        )

    update_dict = item.model_dump(exclude_unset=True)
    if update_dict:
        update_dict["updated_at"] = datetime.now(UTC)
        await db.data_dictionaries.update_one(
            {"_id": ObjectId(item_id)},
            {"$set": update_dict}
        )

    updated_item = await db.data_dictionaries.find_one({"_id": ObjectId(item_id)})
    updated_item["_id"] = str(updated_item["_id"])

    return DataDictionaryResponse(**updated_item)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_data_dictionary(
    item_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    existing = await db.data_dictionaries.find_one({"_id": ObjectId(item_id)})
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="数据字典不存在"
        )

    if existing.get("is_system", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="系统内置数据字典不能删除"
        )

    await db.data_dictionaries.delete_one({"_id": ObjectId(item_id)})
    return None


@router.post("/initialize", status_code=status.HTTP_201_CREATED)
async def initialize_default_data(db: AsyncIOMotorDatabase = Depends(get_db)):
    existing_count = await db.data_dictionaries.count_documents({})
    if existing_count > 0:
        return {"message": "数据字典已存在，跳过初始化"}

    default_data = [
        {
            "category": "department",
            "code": "tech",
            "name": "技术部",
            "value": "tech",
            "description": "负责技术研发工作",
            "sort_order": 1,
            "is_active": True,
            "is_system": True,
        },
        {
            "category": "department",
            "code": "product",
            "name": "产品部",
            "value": "product",
            "description": "负责产品规划和设计",
            "sort_order": 2,
            "is_active": True,
            "is_system": True,
        },
        {
            "category": "department",
            "code": "testing",
            "name": "测试部",
            "value": "testing",
            "description": "负责质量保证和测试",
            "sort_order": 3,
            "is_active": True,
            "is_system": True,
        },
        {
            "category": "department",
            "code": "ops",
            "name": "运维部",
            "value": "ops",
            "description": "负责系统运维和保障",
            "sort_order": 4,
            "is_active": True,
            "is_system": True,
        },
        {
            "category": "department",
            "code": "hr",
            "name": "人力资源部",
            "value": "hr",
            "description": "负责人员招聘和管理",
            "sort_order": 5,
            "is_active": True,
            "is_system": True,
        },
        {
            "category": "department",
            "code": "finance",
            "name": "财务部",
            "value": "finance",
            "description": "负责财务和预算管理",
            "sort_order": 6,
            "is_active": True,
            "is_system": True,
        },
        {
            "category": "job_level",
            "code": "intern",
            "name": "实习生",
            "value": "intern",
            "description": "实习岗位",
            "sort_order": 1,
            "is_active": True,
            "is_system": True,
        },
        {
            "category": "job_level",
            "code": "junior",
            "name": "初级",
            "value": "junior",
            "description": "初级工程师/专员",
            "sort_order": 2,
            "is_active": True,
            "is_system": True,
        },
        {
            "category": "job_level",
            "code": "intermediate",
            "name": "中级",
            "value": "intermediate",
            "description": "中级工程师/主管",
            "sort_order": 3,
            "is_active": True,
            "is_system": True,
        },
        {
            "category": "job_level",
            "code": "senior",
            "name": "高级",
            "value": "senior",
            "description": "高级工程师/经理",
            "sort_order": 4,
            "is_active": True,
            "is_system": True,
        },
        {
            "category": "job_level",
            "code": "expert",
            "name": "专家",
            "value": "expert",
            "description": "专家/总监",
            "sort_order": 5,
            "is_active": True,
            "is_system": True,
        },
        {
            "category": "job_level",
            "code": "vp",
            "name": "VP",
            "value": "vp",
            "description": "副总裁",
            "sort_order": 6,
            "is_active": True,
            "is_system": True,
        },
        {
            "category": "user_role",
            "code": "admin",
            "name": "管理员",
            "value": "admin",
            "description": "系统管理员，拥有全部权限",
            "sort_order": 1,
            "is_active": True,
            "is_system": True,
        },
        {
            "category": "user_role",
            "code": "manager",
            "name": "项目经理",
            "value": "manager",
            "description": "负责项目管理的用户",
            "sort_order": 2,
            "is_active": True,
            "is_system": True,
        },
        {
            "category": "user_role",
            "code": "member",
            "name": "成员",
            "value": "member",
            "description": "普通项目成员",
            "sort_order": 3,
            "is_active": True,
            "is_system": True,
        },
        {
            "category": "user_role",
            "code": "viewer",
            "name": "查看者",
            "value": "viewer",
            "description": "只读权限的用户",
            "sort_order": 4,
            "is_active": True,
            "is_system": True,
        },
        {
            "category": "project_role",
            "code": "pm",
            "name": "项目经理",
            "value": "pm",
            "description": "负责项目整体管理",
            "sort_order": 1,
            "is_active": True,
            "is_system": True,
        },
        {
            "category": "project_role",
            "code": "dev",
            "name": "开发人员",
            "value": "dev",
            "description": "负责项目开发工作",
            "sort_order": 2,
            "is_active": True,
            "is_system": True,
        },
        {
            "category": "project_role",
            "code": "tester",
            "name": "测试人员",
            "value": "tester",
            "description": "负责项目测试工作",
            "sort_order": 3,
            "is_active": True,
            "is_system": True,
        },
        {
            "category": "project_role",
            "code": "designer",
            "name": "设计师",
            "value": "designer",
            "description": "负责项目设计工作",
            "sort_order": 4,
            "is_active": True,
            "is_system": True,
        },
        {
            "category": "project_role",
            "code": "stakeholder",
            "name": "干系人",
            "value": "stakeholder",
            "description": "项目干系人",
            "sort_order": 5,
            "is_active": True,
            "is_system": True,
        },
        {
            "category": "org_level",
            "code": "level1",
            "name": "决策层",
            "value": "level1",
            "description": "项目决策层",
            "sort_order": 1,
            "is_active": True,
            "is_system": True,
        },
        {
            "category": "org_level",
            "code": "level2",
            "name": "管理层",
            "value": "level2",
            "description": "项目管理层",
            "sort_order": 2,
            "is_active": True,
            "is_system": True,
        },
        {
            "category": "org_level",
            "code": "level3",
            "name": "执行层",
            "value": "level3",
            "description": "项目执行层",
            "sort_order": 3,
            "is_active": True,
            "is_system": True,
        },
    ]

    for item in default_data:
        item["created_at"] = datetime.now(UTC)
        item["updated_at"] = datetime.now(UTC)

    await db.data_dictionaries.insert_many(default_data)

    return {"message": f"已初始化 {len(default_data)} 条数据字典"}
