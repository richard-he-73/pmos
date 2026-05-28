from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.organization import (
    DepartmentCreate,
    DepartmentResponse,
    DepartmentUpdate,
    JobLevelCreate,
    JobLevelResponse,
    JobLevelUpdate,
)
from app.schemas.auth import UserInDB


router = APIRouter(prefix="/organization", tags=["组织管理"])


# Department Routes
@router.get("/departments", response_model=list[DepartmentResponse])
async def get_departments(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    departments = await db.departments.find().sort("name", 1).to_list(100)
    result = []
    for dept in departments:
        dept["_id"] = str(dept["_id"])
        result.append(DepartmentResponse(**dept))
    return result


@router.get("/departments/{dept_id}", response_model=DepartmentResponse)
async def get_department(
    dept_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    department = await db.departments.find_one({"_id": ObjectId(dept_id)})
    if not department:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="部门不存在")
    department["_id"] = str(department["_id"])
    return DepartmentResponse(**department)


@router.post("/departments", response_model=DepartmentResponse)
async def create_department(
    data: DepartmentCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    existing_dept = await db.departments.find_one({"code": data.code})
    if existing_dept:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="部门编码已存在"
        )

    existing_name = await db.departments.find_one({"name": data.name})
    if existing_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="部门名称已存在"
        )

    now = datetime.now()
    new_dept = {
        "code": data.code,
        "name": data.name,
        "description": data.description,
        "parent_id": data.parent_id,
        "is_active": data.is_active,
        "created_at": now,
        "updated_at": now,
    }

    result = await db.departments.insert_one(new_dept)
    new_dept["_id"] = str(result.inserted_id)
    return DepartmentResponse(**new_dept)


@router.put("/departments/{dept_id}", response_model=DepartmentResponse)
async def update_department(
    dept_id: str,
    data: DepartmentUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="没有提供更新数据"
        )

    if "code" in update_data:
        existing = await db.departments.find_one(
            {"code": update_data["code"], "_id": {"$ne": ObjectId(dept_id)}}
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="部门编码已存在"
            )

    if "name" in update_data:
        existing = await db.departments.find_one(
            {"name": update_data["name"], "_id": {"$ne": ObjectId(dept_id)}}
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="部门名称已存在"
            )

    update_data["updated_at"] = datetime.now()
    result = await db.departments.update_one(
        {"_id": ObjectId(dept_id)}, {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="部门不存在")

    updated = await db.departments.find_one({"_id": ObjectId(dept_id)})
    updated["_id"] = str(updated["_id"])
    return DepartmentResponse(**updated)


@router.delete("/departments/{dept_id}")
async def delete_department(
    dept_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    has_children = await db.departments.find_one({"parent_id": dept_id})
    if has_children:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="该部门下有子部门，无法删除"
        )

    has_users = await db.users.find_one({"department": dept_id})
    if has_users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="该部门下有用户，无法删除"
        )

    result = await db.departments.delete_one({"_id": ObjectId(dept_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="部门不存在")

    return {"message": "部门已删除"}


# Job Level Routes
@router.get("/job-levels", response_model=list[JobLevelResponse])
async def get_job_levels(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    job_levels = await db.job_levels.find().sort("name", 1).to_list(100)
    result = []
    for level in job_levels:
        level["_id"] = str(level["_id"])
        result.append(JobLevelResponse(**level))
    return result


@router.get("/job-levels/{level_id}", response_model=JobLevelResponse)
async def get_job_level(
    level_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    job_level = await db.job_levels.find_one({"_id": ObjectId(level_id)})
    if not job_level:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="职级不存在")
    job_level["_id"] = str(job_level["_id"])
    return JobLevelResponse(**job_level)


@router.post("/job-levels", response_model=JobLevelResponse)
async def create_job_level(
    data: JobLevelCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    existing_code = await db.job_levels.find_one({"code": data.code})
    if existing_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="职级编码已存在"
        )

    existing_name = await db.job_levels.find_one({"name": data.name})
    if existing_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="职级名称已存在"
        )

    now = datetime.now()
    new_level = {
        "code": data.code,
        "name": data.name,
        "description": data.description,
        "is_active": data.is_active,
        "created_at": now,
        "updated_at": now,
    }

    result = await db.job_levels.insert_one(new_level)
    new_level["_id"] = str(result.inserted_id)
    return JobLevelResponse(**new_level)


@router.put("/job-levels/{level_id}", response_model=JobLevelResponse)
async def update_job_level(
    level_id: str,
    data: JobLevelUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="没有提供更新数据"
        )

    if "code" in update_data:
        existing = await db.job_levels.find_one(
            {"code": update_data["code"], "_id": {"$ne": ObjectId(level_id)}}
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="职级编码已存在"
            )

    if "name" in update_data:
        existing = await db.job_levels.find_one(
            {"name": update_data["name"], "_id": {"$ne": ObjectId(level_id)}}
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="职级名称已存在"
            )

    update_data["updated_at"] = datetime.now()
    result = await db.job_levels.update_one(
        {"_id": ObjectId(level_id)}, {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="职级不存在")

    updated = await db.job_levels.find_one({"_id": ObjectId(level_id)})
    updated["_id"] = str(updated["_id"])
    return JobLevelResponse(**updated)


@router.delete("/job-levels/{level_id}")
async def delete_job_level(
    level_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    has_users = await db.users.find_one({"position": level_id})
    if has_users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="该职级下有用户，无法删除"
        )

    result = await db.job_levels.delete_one({"_id": ObjectId(level_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="职级不存在")

    return {"message": "职级已删除"}


@router.post("/initialize")
async def initialize_organization_data(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    departments = await db.departments.find().to_list(1)
    job_levels = await db.job_levels.find().to_list(1)
    
    if len(departments) > 0 or len(job_levels) > 0:
        return {"message": "组织数据已存在"}
    
    now = datetime.now()
    
    initial_departments = [
        {"code": "tech", "name": "技术部", "description": "技术研发部门", "is_active": True, "created_at": now, "updated_at": now},
        {"code": "product", "name": "产品部", "description": "产品设计部门", "is_active": True, "created_at": now, "updated_at": now},
        {"code": "test", "name": "测试部", "description": "质量测试部门", "is_active": True, "created_at": now, "updated_at": now},
        {"code": "operation", "name": "运维部", "description": "系统运维部门", "is_active": True, "created_at": now, "updated_at": now},
        {"code": "hr", "name": "人力资源部", "description": "人力资源部门", "is_active": True, "created_at": now, "updated_at": now},
        {"code": "finance", "name": "财务部", "description": "财务部门", "is_active": True, "created_at": now, "updated_at": now},
    ]
    
    await db.departments.insert_many(initial_departments)
    
    initial_job_levels = [
        {"code": "intern", "name": "实习生", "description": "实习岗位", "is_active": True, "created_at": now, "updated_at": now},
        {"code": "junior", "name": "初级", "description": "初级岗位", "is_active": True, "created_at": now, "updated_at": now},
        {"code": "intermediate", "name": "中级", "description": "中级岗位", "is_active": True, "created_at": now, "updated_at": now},
        {"code": "senior", "name": "高级", "description": "高级岗位", "is_active": True, "created_at": now, "updated_at": now},
        {"code": "expert", "name": "专家", "description": "专家岗位", "is_active": True, "created_at": now, "updated_at": now},
        {"code": "vp", "name": "VP", "description": "副总裁岗位", "is_active": True, "created_at": now, "updated_at": now},
    ]
    
    await db.job_levels.insert_many(initial_job_levels)
    
    return {"message": "组织数据初始化成功"}