import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.dependencies import get_current_user
from app.schemas.auth import UserInDB
from app.schemas.plan import (
    MilestoneCreate, MilestoneResponse, MilestoneUpdate,
    GroupPlanCreate, GroupPlanResponse, GroupPlanUpdate,
    DetailTaskCreate, DetailTaskResponse, DetailTaskUpdate
)

router = APIRouter(prefix="/plans", tags=["计划管理"])


def normalize_date(dt):
    if dt:
        return datetime.datetime(dt.year, dt.month, dt.day)
    return None


# ==================== 里程碑相关 API ====================

@router.get("/{project_id}/milestones", response_model=list[MilestoneResponse])
async def list_milestones(
    project_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    print(f"获取项目 {project_id} 的里程碑")
    cursor = db.milestones.find({"project_id": project_id}).sort("plan_start_date", 1)
    milestones = await cursor.to_list(length=None)
    print(f"找到 {len(milestones)} 个里程碑")
    
    result = []
    for m in milestones:
        print(f"处理里程碑: {m}")
        m["_id"] = str(m["_id"])
        # 确保日期字段存在
        if "plan_start_date" not in m:
            m["plan_start_date"] = datetime.datetime.now(datetime.UTC)
        if "plan_end_date" not in m:
            m["plan_end_date"] = datetime.datetime.now(datetime.UTC)
        if "owner" not in m:
            m["owner"] = ""
        if "current_status" not in m:
            m["current_status"] = "未开始"
        if "acceptance_criteria" not in m:
            m["acceptance_criteria"] = ""
        result.append(MilestoneResponse(**m))
    return result


@router.post("/milestones", response_model=MilestoneResponse, status_code=status.HTTP_201_CREATED)
async def create_milestone(
    milestone_data: MilestoneCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    print("创建里程碑，收到数据:", milestone_data)
    milestone_dict = milestone_data.model_dump()
    print("转换后的字典:", milestone_dict)
    # 修复时区问题：将日期设置为当天的开始时间
    milestone_dict["plan_start_date"] = normalize_date(milestone_dict.get("plan_start_date"))
    milestone_dict["plan_end_date"] = normalize_date(milestone_dict.get("plan_end_date"))
    milestone_dict["actual_start_date"] = normalize_date(milestone_dict.get("actual_start_date"))
    milestone_dict["actual_end_date"] = normalize_date(milestone_dict.get("actual_end_date"))
    milestone_dict["created_at"] = datetime.datetime.now(datetime.UTC)
    milestone_dict["updated_at"] = datetime.datetime.now(datetime.UTC)
    
    print("准备插入的文档:", milestone_dict)
    result = await db.milestones.insert_one(milestone_dict)
    milestone_dict["_id"] = str(result.inserted_id)
    
    return MilestoneResponse(**milestone_dict)


@router.put("/milestones/{milestone_id}", response_model=MilestoneResponse)
async def update_milestone(
    milestone_id: str,
    milestone_data: MilestoneUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    print(f"更新里程碑，ID: {milestone_id}")
    print(f"收到更新数据: {milestone_data}")
    
    if not ObjectId.is_valid(milestone_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的里程碑ID"
        )
    
    update_data = milestone_data.model_dump(exclude_unset=True)
    print(f"排除未设置字段后: {update_data}")
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="没有提供更新数据"
        )
    
    # 修复时区问题：将日期设置为当天的开始时间
    if "plan_start_date" in update_data and update_data["plan_start_date"]:
        update_data["plan_start_date"] = normalize_date(update_data["plan_start_date"])
    if "plan_end_date" in update_data and update_data["plan_end_date"]:
        update_data["plan_end_date"] = normalize_date(update_data["plan_end_date"])
    if "actual_start_date" in update_data:
        if update_data["actual_start_date"]:
            update_data["actual_start_date"] = normalize_date(update_data["actual_start_date"])
        else:
            # 如果设置为 None，从 $set 中移除，让 MongoDB 保留原数据
            del update_data["actual_start_date"]
    if "actual_end_date" in update_data:
        if update_data["actual_end_date"]:
            update_data["actual_end_date"] = normalize_date(update_data["actual_end_date"])
        else:
            # 如果设置为 None，从 $set 中移除，让 MongoDB 保留原数据
            del update_data["actual_end_date"]
    
    update_data["updated_at"] = datetime.datetime.now(datetime.UTC)
    
    print(f"准备执行更新: {update_data}")
    result = await db.milestones.update_one(
        {"_id": ObjectId(milestone_id)},
        {"$set": update_data},
    )
    
    print(f"更新结果: matched_count={result.matched_count}, modified_count={result.modified_count}")
    
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="里程碑不存在")
    
    updated = await db.milestones.find_one({"_id": ObjectId(milestone_id)})
    updated["_id"] = str(updated["_id"])
    return MilestoneResponse(**updated)


@router.delete("/milestones/{milestone_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_milestone(
    milestone_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    print(f"删除里程碑，ID: {milestone_id}")
    
    if not ObjectId.is_valid(milestone_id):
        print(f"无效的里程碑ID: {milestone_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的里程碑ID"
        )
    
    result = await db.milestones.delete_one({"_id": ObjectId(milestone_id)})
    print(f"删除结果: deleted_count={result.deleted_count}")
    
    if result.deleted_count == 0:
        print("删除失败 - 里程碑不存在")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="里程碑不存在")


# ==================== 小组计划相关 API ====================

@router.get("/{project_id}/group-plans", response_model=list[GroupPlanResponse])
async def list_group_plans(
    project_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    cursor = db.group_plans.find({"project_id": project_id}).sort("plan_start_date", 1)
    group_plans = await cursor.to_list(length=None)
    
    result = []
    for g in group_plans:
        g["_id"] = str(g["_id"])
        # 确保日期字段存在
        if "plan_start_date" not in g:
            g["plan_start_date"] = datetime.datetime.now(datetime.UTC)
        if "plan_end_date" not in g:
            g["plan_end_date"] = datetime.datetime.now(datetime.UTC)
        if "owner" not in g:
            g["owner"] = ""
        if "current_status" not in g:
            g["current_status"] = "未开始"
        if "acceptance_criteria" not in g:
            g["acceptance_criteria"] = ""
        if "milestone_id" not in g:
            g["milestone_id"] = ""
        result.append(GroupPlanResponse(**g))
    return result


@router.post("/group-plans", response_model=GroupPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_group_plan(
    group_plan_data: GroupPlanCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    print("创建小组计划，收到数据:", group_plan_data)
    group_plan_dict = group_plan_data.model_dump()
    print("转换后的字典:", group_plan_dict)
    # 修复时区问题：将日期设置为当天的开始时间
    group_plan_dict["plan_start_date"] = normalize_date(group_plan_dict.get("plan_start_date"))
    group_plan_dict["plan_end_date"] = normalize_date(group_plan_dict.get("plan_end_date"))
    group_plan_dict["actual_start_date"] = normalize_date(group_plan_dict.get("actual_start_date"))
    group_plan_dict["actual_end_date"] = normalize_date(group_plan_dict.get("actual_end_date"))
    group_plan_dict["created_at"] = datetime.datetime.now(datetime.UTC)
    group_plan_dict["updated_at"] = datetime.datetime.now(datetime.UTC)
    
    print("准备插入的文档:", group_plan_dict)
    result = await db.group_plans.insert_one(group_plan_dict)
    group_plan_dict["_id"] = str(result.inserted_id)
    
    return GroupPlanResponse(**group_plan_dict)


@router.put("/group-plans/{group_plan_id}", response_model=GroupPlanResponse)
async def update_group_plan(
    group_plan_id: str,
    group_plan_data: GroupPlanUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    print(f"更新小组计划，ID: {group_plan_id}")
    print(f"收到更新数据: {group_plan_data}")
    
    if not ObjectId.is_valid(group_plan_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的小组计划ID"
        )
    
    update_data = group_plan_data.model_dump(exclude_unset=True)
    print(f"排除未设置字段后: {update_data}")
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="没有提供更新数据"
        )
    
    # 修复时区问题：将日期设置为当天的开始时间
    if "plan_start_date" in update_data and update_data["plan_start_date"]:
        update_data["plan_start_date"] = normalize_date(update_data["plan_start_date"])
    if "plan_end_date" in update_data and update_data["plan_end_date"]:
        update_data["plan_end_date"] = normalize_date(update_data["plan_end_date"])
    if "actual_start_date" in update_data:
        if update_data["actual_start_date"]:
            update_data["actual_start_date"] = normalize_date(update_data["actual_start_date"])
        else:
            del update_data["actual_start_date"]
    if "actual_end_date" in update_data:
        if update_data["actual_end_date"]:
            update_data["actual_end_date"] = normalize_date(update_data["actual_end_date"])
        else:
            del update_data["actual_end_date"]
    
    update_data["updated_at"] = datetime.datetime.now(datetime.UTC)
    
    print(f"准备执行更新: {update_data}")
    result = await db.group_plans.update_one(
        {"_id": ObjectId(group_plan_id)},
        {"$set": update_data},
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="小组计划不存在")
    
    updated = await db.group_plans.find_one({"_id": ObjectId(group_plan_id)})
    updated["_id"] = str(updated["_id"])
    return GroupPlanResponse(**updated)


@router.delete("/group-plans/{group_plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_group_plan(
    group_plan_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(group_plan_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的小组计划ID"
        )
    
    result = await db.group_plans.delete_one({"_id": ObjectId(group_plan_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="小组计划不存在")


# ==================== 详细任务相关 API ====================

@router.get("/{project_id}/detail-tasks", response_model=list[DetailTaskResponse])
async def list_detail_tasks(
    project_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    cursor = db.detail_tasks.find({"project_id": project_id}).sort("plan_start_date", 1)
    detail_tasks = await cursor.to_list(length=None)
    
    result = []
    for t in detail_tasks:
        t["_id"] = str(t["_id"])
        # 确保日期字段存在
        if "plan_start_date" not in t:
            t["plan_start_date"] = datetime.datetime.now(datetime.UTC)
        if "plan_end_date" not in t:
            t["plan_end_date"] = datetime.datetime.now(datetime.UTC)
        if "owner" not in t:
            t["owner"] = ""
        if "current_status" not in t:
            t["current_status"] = "未开始"
        if "acceptance_criteria" not in t:
            t["acceptance_criteria"] = ""
        if "milestone_id" not in t:
            t["milestone_id"] = ""
        if "group_id" not in t:
            t["group_id"] = ""
        result.append(DetailTaskResponse(**t))
    return result


@router.post("/detail-tasks", response_model=DetailTaskResponse, status_code=status.HTTP_201_CREATED)
async def create_detail_task(
    detail_task_data: DetailTaskCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    print("创建详细任务，收到数据:", detail_task_data)
    detail_task_dict = detail_task_data.model_dump()
    print("转换后的字典:", detail_task_dict)
    # 修复时区问题：将日期设置为当天的开始时间
    detail_task_dict["plan_start_date"] = normalize_date(detail_task_dict.get("plan_start_date"))
    detail_task_dict["plan_end_date"] = normalize_date(detail_task_dict.get("plan_end_date"))
    detail_task_dict["actual_start_date"] = normalize_date(detail_task_dict.get("actual_start_date"))
    detail_task_dict["actual_end_date"] = normalize_date(detail_task_dict.get("actual_end_date"))
    detail_task_dict["created_at"] = datetime.datetime.now(datetime.UTC)
    detail_task_dict["updated_at"] = datetime.datetime.now(datetime.UTC)
    
    print("准备插入的文档:", detail_task_dict)
    result = await db.detail_tasks.insert_one(detail_task_dict)
    detail_task_dict["_id"] = str(result.inserted_id)
    
    return DetailTaskResponse(**detail_task_dict)


@router.put("/detail-tasks/{detail_task_id}", response_model=DetailTaskResponse)
async def update_detail_task(
    detail_task_id: str,
    detail_task_data: DetailTaskUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    print(f"更新详细任务，ID: {detail_task_id}")
    print(f"收到更新数据: {detail_task_data}")
    
    if not ObjectId.is_valid(detail_task_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的详细任务ID"
        )
    
    update_data = detail_task_data.model_dump(exclude_unset=True)
    print(f"排除未设置字段后: {update_data}")
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="没有提供更新数据"
        )
    
    # 修复时区问题：将日期设置为当天的开始时间
    if "plan_start_date" in update_data and update_data["plan_start_date"]:
        update_data["plan_start_date"] = normalize_date(update_data["plan_start_date"])
    if "plan_end_date" in update_data and update_data["plan_end_date"]:
        update_data["plan_end_date"] = normalize_date(update_data["plan_end_date"])
    if "actual_start_date" in update_data:
        if update_data["actual_start_date"]:
            update_data["actual_start_date"] = normalize_date(update_data["actual_start_date"])
        else:
            del update_data["actual_start_date"]
    if "actual_end_date" in update_data:
        if update_data["actual_end_date"]:
            update_data["actual_end_date"] = normalize_date(update_data["actual_end_date"])
        else:
            del update_data["actual_end_date"]
    
    update_data["updated_at"] = datetime.datetime.now(datetime.UTC)
    
    print(f"准备执行更新: {update_data}")
    result = await db.detail_tasks.update_one(
        {"_id": ObjectId(detail_task_id)},
        {"$set": update_data},
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="详细任务不存在")
    
    updated = await db.detail_tasks.find_one({"_id": ObjectId(detail_task_id)})
    updated["_id"] = str(updated["_id"])
    return DetailTaskResponse(**updated)


@router.delete("/detail-tasks/{detail_task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_detail_task(
    detail_task_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(detail_task_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的详细任务ID"
        )
    
    result = await db.detail_tasks.delete_one({"_id": ObjectId(detail_task_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="详细任务不存在")
