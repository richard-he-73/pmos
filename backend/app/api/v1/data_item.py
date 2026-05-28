from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.data_item import (
    DataItemCreate,
    DataItemResponse,
    DataItemUpdate,
)
from app.schemas.auth import UserInDB


router = APIRouter(prefix="/data-items", tags=["数据项管理"])


@router.get("/{category}", response_model=list[DataItemResponse])
async def get_data_items(
    category: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    collection = db.data_items
    items = await collection.find({"category": category}).sort("sort_order", 1).to_list(1000)
    result = []
    for item in items:
        item["_id"] = str(item["_id"])
        result.append(DataItemResponse(**item))
    return result


@router.get("/{category}/{item_id}", response_model=DataItemResponse)
async def get_data_item(
    category: str,
    item_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    from bson import ObjectId
    item = await db.data_items.find_one({"_id": ObjectId(item_id), "category": category})
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="数据项不存在")
    item["_id"] = str(item["_id"])
    return DataItemResponse(**item)


@router.post("/{category}", response_model=DataItemResponse)
async def create_data_item(
    category: str,
    data: DataItemCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    from bson import ObjectId
    
    existing_code = await db.data_items.find_one({"category": category, "code": data.code})
    if existing_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="数据项编码已存在"
        )

    existing_name = await db.data_items.find_one({"category": category, "name": data.name})
    if existing_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="数据项名称已存在"
        )

    now = datetime.now()
    new_item = {
        "category": category,
        "code": data.code,
        "name": data.name,
        "description": data.description,
        "sort_order": data.sort_order,
        "is_active": data.is_active,
        "created_at": now,
        "updated_at": now,
    }

    result = await db.data_items.insert_one(new_item)
    new_item["_id"] = str(result.inserted_id)
    return DataItemResponse(**new_item)


@router.put("/{category}/{item_id}", response_model=DataItemResponse)
async def update_data_item(
    category: str,
    item_id: str,
    data: DataItemUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    from bson import ObjectId
    
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="没有提供更新数据"
        )

    if "code" in update_data:
        existing = await db.data_items.find_one(
            {"category": category, "code": update_data["code"], "_id": {"$ne": ObjectId(item_id)}}
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="数据项编码已存在"
            )

    if "name" in update_data:
        existing = await db.data_items.find_one(
            {"category": category, "name": update_data["name"], "_id": {"$ne": ObjectId(item_id)}}
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="数据项名称已存在"
            )

    update_data["updated_at"] = datetime.now()
    result = await db.data_items.update_one(
        {"_id": ObjectId(item_id), "category": category}, {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="数据项不存在")

    updated = await db.data_items.find_one({"_id": ObjectId(item_id)})
    updated["_id"] = str(updated["_id"])
    return DataItemResponse(**updated)


@router.delete("/{category}/{item_id}")
async def delete_data_item(
    category: str,
    item_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    from bson import ObjectId
    result = await db.data_items.delete_one({"_id": ObjectId(item_id), "category": category})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="数据项不存在")

    return {"message": "数据项已删除"}


@router.post("/initialize")
async def initialize_data_items(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    now = datetime.now()
    
    all_categories = [
        "priority", "project_status", "project_role", "user_role", "org_level",
        "requirement_status", "development_status", "testing_status", "risk_status",
        "risk_likelihood", "risk_impact", "communication_type", "requirement_type",
        "resource_type", "resource_availability", "work_type", "work_status",
        "drill_type", "drill_status", "drill_target", "deployment_status",
        "config_type", "user_status"
    ]
    
    initial_data = [
        # 优先级（最常用，放最前面）
        {"category": "priority", "code": "critical", "name": "紧急", "description": "紧急且重要", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "priority", "code": "high", "name": "高", "description": "高优先级", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "priority", "code": "medium", "name": "中", "description": "中等优先级", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "priority", "code": "low", "name": "低", "description": "低优先级", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        
        # 项目状态
        {"category": "project_status", "code": "planning", "name": "规划中", "description": "项目正在规划阶段", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "project_status", "code": "approved", "name": "已立项", "description": "项目已批准立项", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "project_status", "code": "in_progress", "name": "进行中", "description": "项目正在执行中", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "project_status", "code": "suspended", "name": "已暂停", "description": "项目已暂停", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "project_status", "code": "completed", "name": "已完成", "description": "项目已完成", "sort_order": 50, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "project_status", "code": "cancelled", "name": "已取消", "description": "项目已取消", "sort_order": 60, "is_active": True, "created_at": now, "updated_at": now},
        
        # 项目角色
        {"category": "project_role", "code": "pmd", "name": "项目总监", "description": "负责项目统筹管理", "sort_order": 1000, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "project_role", "code": "pm", "name": "项目经理", "description": "负责项目整体管理", "sort_order": 1010, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "project_role", "code": "business", "name": "业务人员", "description": "负责项目业务咨询工作", "sort_order": 1020, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "project_role", "code": "dev", "name": "技术人员", "description": "负责项目技术咨询工作", "sort_order": 1030, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "project_role", "code": "tester", "name": "测试人员", "description": "负责项目测试咨询工作", "sort_order": 1040, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "project_role", "code": "stakeholder", "name": "干系人", "description": "项目干系人", "sort_order": 2000, "is_active": True, "created_at": now, "updated_at": now},
        
        # 用户角色
        {"category": "user_role", "code": "system", "name": "系统管理员", "description": "系统管理", "sort_order": 1000, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "user_role", "code": "operator", "name": "操作员", "description": "操作系统功能", "sort_order": 1010, "is_active": True, "created_at": now, "updated_at": now},
        
        # 组织层级
        {"category": "org_level", "code": "level1", "name": "决策层", "description": "项目决策层", "sort_order": 1000, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "org_level", "code": "level2", "name": "管理层", "description": "项目管理层", "sort_order": 1010, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "org_level", "code": "level3", "name": "执行层", "description": "项目执行层", "sort_order": 1020, "is_active": True, "created_at": now, "updated_at": now},
        
        # 需求状态
        {"category": "requirement_status", "code": "draft", "name": "草稿", "description": "需求草稿", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "requirement_status", "code": "submitted", "name": "已提交", "description": "需求已提交待评审", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "requirement_status", "code": "reviewing", "name": "评审中", "description": "需求正在评审", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "requirement_status", "code": "approved", "name": "已批准", "description": "需求已批准", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "requirement_status", "code": "rejected", "name": "已拒绝", "description": "需求已被拒绝", "sort_order": 50, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "requirement_status", "code": "developed", "name": "已开发", "description": "需求已开发完成", "sort_order": 60, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "requirement_status", "code": "tested", "name": "已测试", "description": "需求已测试通过", "sort_order": 70, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "requirement_status", "code": "released", "name": "已发布", "description": "需求已发布上线", "sort_order": 80, "is_active": True, "created_at": now, "updated_at": now},
        
        # 开发状态
        {"category": "development_status", "code": "todo", "name": "待开发", "description": "待开始开发", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "development_status", "code": "in_progress", "name": "开发中", "description": "正在开发中", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "development_status", "code": "code_review", "name": "代码评审", "description": "代码评审中", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "development_status", "code": "completed", "name": "开发完成", "description": "开发已完成", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "development_status", "code": "blocked", "name": "阻塞", "description": "开发被阻塞", "sort_order": 50, "is_active": True, "created_at": now, "updated_at": now},
        
        # 测试状态
        {"category": "testing_status", "code": "pending", "name": "待测试", "description": "待开始测试", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "testing_status", "code": "testing", "name": "测试中", "description": "正在测试中", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "testing_status", "code": "passed", "name": "测试通过", "description": "测试通过", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "testing_status", "code": "failed", "name": "测试失败", "description": "测试失败", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "testing_status", "code": "blocked", "name": "阻塞", "description": "测试被阻塞", "sort_order": 50, "is_active": True, "created_at": now, "updated_at": now},
        
        # 风险状态
        {"category": "risk_status", "code": "identified", "name": "已识别", "description": "风险已识别", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "risk_status", "code": "analyzing", "name": "分析中", "description": "风险正在分析评估", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "risk_status", "code": "mitigating", "name": "处理中", "description": "风险应对措施正在执行", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "risk_status", "code": "resolved", "name": "已解决", "description": "风险已解决", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "risk_status", "code": "closed", "name": "已关闭", "description": "风险已关闭", "sort_order": 50, "is_active": True, "created_at": now, "updated_at": now},
        
        # 风险可能性
        {"category": "risk_likelihood", "code": "very_low", "name": "极低", "description": "发生概率极低", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "risk_likelihood", "code": "low", "name": "低", "description": "发生概率低", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "risk_likelihood", "code": "medium", "name": "中", "description": "发生概率中等", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "risk_likelihood", "code": "high", "name": "高", "description": "发生概率高", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "risk_likelihood", "code": "very_high", "name": "极高", "description": "发生概率极高", "sort_order": 50, "is_active": True, "created_at": now, "updated_at": now},
        
        # 风险影响
        {"category": "risk_impact", "code": "very_low", "name": "极低", "description": "影响范围极小", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "risk_impact", "code": "low", "name": "低", "description": "影响范围较小", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "risk_impact", "code": "medium", "name": "中", "description": "影响范围中等", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "risk_impact", "code": "high", "name": "高", "description": "影响范围较大", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "risk_impact", "code": "very_high", "name": "极高", "description": "影响范围极大", "sort_order": 50, "is_active": True, "created_at": now, "updated_at": now},
        
        # 沟通类型
        {"category": "communication_type", "code": "meeting", "name": "会议", "description": "面对面或线上会议", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "communication_type", "code": "email", "name": "邮件", "description": "电子邮件沟通", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "communication_type", "code": "chat", "name": "即时通讯", "description": "即时通讯工具沟通", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "communication_type", "code": "document", "name": "文档", "description": "书面文档沟通", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        
        # 需求类型
        {"category": "requirement_type", "code": "business", "name": "业务需求", "description": "业务方面的需求", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "requirement_type", "code": "functional", "name": "功能需求", "description": "系统功能需求", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "requirement_type", "code": "non_functional", "name": "非功能需求", "description": "性能、安全等非功能需求", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "requirement_type", "code": "technical", "name": "技术需求", "description": "技术实现相关需求", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        
        # 资源类型
        {"category": "resource_type", "code": "server", "name": "服务器", "description": "物理或虚拟服务器资源", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "resource_type", "code": "storage", "name": "存储设备", "description": "存储设备和存储空间资源", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "resource_type", "code": "network", "name": "网络设备", "description": "网络设备和带宽资源", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "resource_type", "code": "software", "name": "软件许可", "description": "软件许可证资源", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "resource_type", "code": "human", "name": "人力资源", "description": "人员和工作时间资源", "sort_order": 50, "is_active": True, "created_at": now, "updated_at": now},
        
        # 资源可用性
        {"category": "resource_availability", "code": "available", "name": "可用", "description": "资源当前可用", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "resource_availability", "code": "occupied", "name": "已占用", "description": "资源已被其他项目占用", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "resource_availability", "code": "maintenance", "name": "维护中", "description": "资源正在维护中", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "resource_availability", "code": "retired", "name": "已退役", "description": "资源已停用退役", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        
        # 工作类型
        {"category": "work_type", "code": "development", "name": "开发", "description": "开发工作", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "work_type", "code": "testing", "name": "测试", "description": "测试工作", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "work_type", "code": "deployment", "name": "部署", "description": "部署工作", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "work_type", "code": "maintenance", "name": "维护", "description": "维护工作", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "work_type", "code": "support", "name": "支持", "description": "技术支持", "sort_order": 50, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "work_type", "code": "documentation", "name": "文档", "description": "文档编写", "sort_order": 60, "is_active": True, "created_at": now, "updated_at": now},
        
        # 工作状态
        {"category": "work_status", "code": "todo", "name": "待处理", "description": "待处理", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "work_status", "code": "in_progress", "name": "进行中", "description": "正在进行", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "work_status", "code": "review", "name": "审核中", "description": "审核中", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "work_status", "code": "completed", "name": "已完成", "description": "已完成", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "work_status", "code": "cancelled", "name": "已取消", "description": "已取消", "sort_order": 50, "is_active": True, "created_at": now, "updated_at": now},
        
        # 演练类型
        {"category": "drill_type", "code": "tabletop", "name": "桌面演练", "description": "桌面推演演练", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "drill_type", "code": "functional", "name": "功能演练", "description": "功能性演练", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "drill_type", "code": "comprehensive", "name": "综合演练", "description": "综合性演练", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "drill_type", "code": "emergency", "name": "应急演练", "description": "应急响应演练", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        
        # 演练状态
        {"category": "drill_status", "code": "planning", "name": "计划中", "description": "演练正在计划", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "drill_status", "code": "preparing", "name": "准备中", "description": "演练准备中", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "drill_status", "code": "in_progress", "name": "进行中", "description": "演练进行中", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "drill_status", "code": "completed", "name": "已完成", "description": "演练已完成", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "drill_status", "code": "cancelled", "name": "已取消", "description": "演练已取消", "sort_order": 50, "is_active": True, "created_at": now, "updated_at": now},
        
        # 演练目标
        {"category": "drill_target", "code": "server", "name": "服务器", "description": "服务器相关演练", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "drill_target", "code": "database", "name": "数据库", "description": "数据库相关演练", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "drill_target", "code": "network", "name": "网络", "description": "网络相关演练", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "drill_target", "code": "security", "name": "安全", "description": "安全相关演练", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "drill_target", "code": "application", "name": "应用", "description": "应用程序相关演练", "sort_order": 50, "is_active": True, "created_at": now, "updated_at": now},
        
        # 投产状态
        {"category": "deployment_status", "code": "pending", "name": "待投产", "description": "等待投产", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "deployment_status", "code": "testing", "name": "测试环境", "description": "测试环境投产", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "deployment_status", "code": "staging", "name": "预发布环境", "description": "预发布环境投产", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "deployment_status", "code": "production", "name": "生产环境", "description": "生产环境投产", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "deployment_status", "code": "rollback", "name": "回滚", "description": "版本回滚", "sort_order": 50, "is_active": True, "created_at": now, "updated_at": now},
        
        # 配置类型
        {"category": "config_type", "code": "system", "name": "系统配置", "description": "系统级配置", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "config_type", "code": "application", "name": "应用配置", "description": "应用程序配置", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "config_type", "code": "database", "name": "数据库配置", "description": "数据库相关配置", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "config_type", "code": "network", "name": "网络配置", "description": "网络相关配置", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        
        # 用户状态
        {"category": "user_status", "code": "active", "name": "活跃", "description": "用户处于活跃状态", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "user_status", "code": "inactive", "name": "未激活", "description": "用户未激活", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "user_status", "code": "suspended", "name": "已停用", "description": "用户已停用", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
    ]
    
    existing_codes = set()
    for category in all_categories:
        items = await db.data_items.find({"category": category}).to_list(1000)
        for item in items:
            existing_codes.add((category, item.get("code")))
    
    items_to_insert = []
    for item in initial_data:
        if (item["category"], item["code"]) not in existing_codes:
            items_to_insert.append(item)
    
    if items_to_insert:
        await db.data_items.insert_many(items_to_insert)
    
    return {"message": f"数据项初始化成功，已插入 {len(items_to_insert)} 个数据项"}


async def initialize_data_items_on_startup(db):
    """在应用启动时初始化数据项"""
    from datetime import datetime
    
    all_categories = [
        "priority", "project_status", "project_role", "user_role", "org_level",
        "requirement_status", "development_status", "testing_status", "risk_status",
        "risk_likelihood", "risk_impact", "communication_type", "requirement_type",
        "resource_type", "resource_availability", "work_type", "work_status",
        "drill_type", "drill_status", "drill_target", "deployment_status",
        "config_type", "user_status"
    ]
    
    now = datetime.now()
    
    initial_data = [
        # 优先级（最常用，放最前面）
        {"category": "priority", "code": "critical", "name": "紧急", "description": "紧急且重要", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "priority", "code": "high", "name": "高", "description": "高优先级", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "priority", "code": "medium", "name": "中", "description": "中等优先级", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "priority", "code": "low", "name": "低", "description": "低优先级", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        
        # 项目状态
        {"category": "project_status", "code": "planning", "name": "规划中", "description": "项目正在规划阶段", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "project_status", "code": "approved", "name": "已立项", "description": "项目已批准立项", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "project_status", "code": "in_progress", "name": "进行中", "description": "项目正在执行中", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "project_status", "code": "suspended", "name": "已暂停", "description": "项目已暂停", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "project_status", "code": "completed", "name": "已完成", "description": "项目已完成", "sort_order": 50, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "project_status", "code": "cancelled", "name": "已取消", "description": "项目已取消", "sort_order": 60, "is_active": True, "created_at": now, "updated_at": now},
        
        # 项目角色
        {"category": "project_role", "code": "pmd", "name": "项目总监", "description": "负责项目统筹管理", "sort_order": 1000, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "project_role", "code": "pm", "name": "项目经理", "description": "负责项目整体管理", "sort_order": 1010, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "project_role", "code": "business", "name": "业务人员", "description": "负责项目业务咨询工作", "sort_order": 1020, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "project_role", "code": "dev", "name": "技术人员", "description": "负责项目技术咨询工作", "sort_order": 1030, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "project_role", "code": "tester", "name": "测试人员", "description": "负责项目测试咨询工作", "sort_order": 1040, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "project_role", "code": "stakeholder", "name": "干系人", "description": "项目干系人", "sort_order": 2000, "is_active": True, "created_at": now, "updated_at": now},
        
        # 用户角色
        {"category": "user_role", "code": "system", "name": "系统管理员", "description": "系统管理", "sort_order": 1000, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "user_role", "code": "operator", "name": "操作员", "description": "操作系统功能", "sort_order": 1010, "is_active": True, "created_at": now, "updated_at": now},
        
        # 组织层级
        {"category": "org_level", "code": "level1", "name": "决策层", "description": "项目决策层", "sort_order": 1000, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "org_level", "code": "level2", "name": "管理层", "description": "项目管理层", "sort_order": 1010, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "org_level", "code": "level3", "name": "执行层", "description": "项目执行层", "sort_order": 1020, "is_active": True, "created_at": now, "updated_at": now},
        
        # 需求状态
        {"category": "requirement_status", "code": "draft", "name": "草稿", "description": "需求草稿", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "requirement_status", "code": "submitted", "name": "已提交", "description": "需求已提交待评审", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "requirement_status", "code": "reviewing", "name": "评审中", "description": "需求正在评审", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "requirement_status", "code": "approved", "name": "已批准", "description": "需求已批准", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "requirement_status", "code": "rejected", "name": "已拒绝", "description": "需求已被拒绝", "sort_order": 50, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "requirement_status", "code": "developed", "name": "已开发", "description": "需求已开发完成", "sort_order": 60, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "requirement_status", "code": "tested", "name": "已测试", "description": "需求已测试通过", "sort_order": 70, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "requirement_status", "code": "released", "name": "已发布", "description": "需求已发布上线", "sort_order": 80, "is_active": True, "created_at": now, "updated_at": now},
        
        # 开发状态
        {"category": "development_status", "code": "todo", "name": "待开发", "description": "待开始开发", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "development_status", "code": "in_progress", "name": "开发中", "description": "正在开发中", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "development_status", "code": "code_review", "name": "代码评审", "description": "代码评审中", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "development_status", "code": "completed", "name": "开发完成", "description": "开发已完成", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "development_status", "code": "blocked", "name": "阻塞", "description": "开发被阻塞", "sort_order": 50, "is_active": True, "created_at": now, "updated_at": now},
        
        # 测试状态
        {"category": "testing_status", "code": "pending", "name": "待测试", "description": "待开始测试", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "testing_status", "code": "testing", "name": "测试中", "description": "正在测试中", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "testing_status", "code": "passed", "name": "测试通过", "description": "测试通过", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "testing_status", "code": "failed", "name": "测试失败", "description": "测试失败", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "testing_status", "code": "blocked", "name": "阻塞", "description": "测试被阻塞", "sort_order": 50, "is_active": True, "created_at": now, "updated_at": now},
        
        # 风险状态
        {"category": "risk_status", "code": "identified", "name": "已识别", "description": "风险已识别", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "risk_status", "code": "analyzing", "name": "分析中", "description": "风险正在分析评估", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "risk_status", "code": "mitigating", "name": "处理中", "description": "风险应对措施正在执行", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "risk_status", "code": "resolved", "name": "已解决", "description": "风险已解决", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "risk_status", "code": "closed", "name": "已关闭", "description": "风险已关闭", "sort_order": 50, "is_active": True, "created_at": now, "updated_at": now},
        
        # 风险可能性
        {"category": "risk_likelihood", "code": "very_low", "name": "极低", "description": "发生概率极低", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "risk_likelihood", "code": "low", "name": "低", "description": "发生概率低", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "risk_likelihood", "code": "medium", "name": "中", "description": "发生概率中等", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "risk_likelihood", "code": "high", "name": "高", "description": "发生概率高", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "risk_likelihood", "code": "very_high", "name": "极高", "description": "发生概率极高", "sort_order": 50, "is_active": True, "created_at": now, "updated_at": now},
        
        # 风险影响
        {"category": "risk_impact", "code": "very_low", "name": "极低", "description": "影响范围极小", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "risk_impact", "code": "low", "name": "低", "description": "影响范围较小", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "risk_impact", "code": "medium", "name": "中", "description": "影响范围中等", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "risk_impact", "code": "high", "name": "高", "description": "影响范围较大", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "risk_impact", "code": "very_high", "name": "极高", "description": "影响范围极大", "sort_order": 50, "is_active": True, "created_at": now, "updated_at": now},
        
        # 沟通类型
        {"category": "communication_type", "code": "meeting", "name": "会议", "description": "面对面或线上会议", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "communication_type", "code": "email", "name": "邮件", "description": "电子邮件沟通", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "communication_type", "code": "chat", "name": "即时通讯", "description": "即时通讯工具沟通", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "communication_type", "code": "document", "name": "文档", "description": "书面文档沟通", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        
        # 需求类型
        {"category": "requirement_type", "code": "business", "name": "业务需求", "description": "业务方面的需求", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "requirement_type", "code": "functional", "name": "功能需求", "description": "系统功能需求", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "requirement_type", "code": "non_functional", "name": "非功能需求", "description": "性能、安全等非功能需求", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "requirement_type", "code": "technical", "name": "技术需求", "description": "技术实现相关需求", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        
        # 资源类型
        {"category": "resource_type", "code": "server", "name": "服务器", "description": "物理或虚拟服务器资源", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "resource_type", "code": "storage", "name": "存储设备", "description": "存储设备和存储空间资源", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "resource_type", "code": "network", "name": "网络设备", "description": "网络设备和带宽资源", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "resource_type", "code": "software", "name": "软件许可", "description": "软件许可证资源", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "resource_type", "code": "human", "name": "人力资源", "description": "人员和工作时间资源", "sort_order": 50, "is_active": True, "created_at": now, "updated_at": now},
        
        # 资源可用性
        {"category": "resource_availability", "code": "available", "name": "可用", "description": "资源当前可用", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "resource_availability", "code": "occupied", "name": "已占用", "description": "资源已被其他项目占用", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "resource_availability", "code": "maintenance", "name": "维护中", "description": "资源正在维护中", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "resource_availability", "code": "retired", "name": "已退役", "description": "资源已停用退役", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        
        # 工作类型
        {"category": "work_type", "code": "development", "name": "开发", "description": "开发工作", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "work_type", "code": "testing", "name": "测试", "description": "测试工作", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "work_type", "code": "deployment", "name": "部署", "description": "部署工作", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "work_type", "code": "maintenance", "name": "维护", "description": "维护工作", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "work_type", "code": "support", "name": "支持", "description": "技术支持", "sort_order": 50, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "work_type", "code": "documentation", "name": "文档", "description": "文档编写", "sort_order": 60, "is_active": True, "created_at": now, "updated_at": now},
        
        # 工作状态
        {"category": "work_status", "code": "todo", "name": "待处理", "description": "待处理", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "work_status", "code": "in_progress", "name": "进行中", "description": "正在进行", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "work_status", "code": "review", "name": "审核中", "description": "审核中", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "work_status", "code": "completed", "name": "已完成", "description": "已完成", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "work_status", "code": "cancelled", "name": "已取消", "description": "已取消", "sort_order": 50, "is_active": True, "created_at": now, "updated_at": now},
        
        # 演练类型
        {"category": "drill_type", "code": "tabletop", "name": "桌面演练", "description": "桌面推演演练", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "drill_type", "code": "functional", "name": "功能演练", "description": "功能性演练", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "drill_type", "code": "comprehensive", "name": "综合演练", "description": "综合性演练", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "drill_type", "code": "emergency", "name": "应急演练", "description": "应急响应演练", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        
        # 演练状态
        {"category": "drill_status", "code": "planning", "name": "计划中", "description": "演练正在计划", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "drill_status", "code": "preparing", "name": "准备中", "description": "演练准备中", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "drill_status", "code": "in_progress", "name": "进行中", "description": "演练进行中", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "drill_status", "code": "completed", "name": "已完成", "description": "演练已完成", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "drill_status", "code": "cancelled", "name": "已取消", "description": "演练已取消", "sort_order": 50, "is_active": True, "created_at": now, "updated_at": now},
        
        # 演练目标
        {"category": "drill_target", "code": "server", "name": "服务器", "description": "服务器相关演练", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "drill_target", "code": "database", "name": "数据库", "description": "数据库相关演练", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "drill_target", "code": "network", "name": "网络", "description": "网络相关演练", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "drill_target", "code": "security", "name": "安全", "description": "安全相关演练", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "drill_target", "code": "application", "name": "应用", "description": "应用程序相关演练", "sort_order": 50, "is_active": True, "created_at": now, "updated_at": now},
        
        # 投产状态
        {"category": "deployment_status", "code": "pending", "name": "待投产", "description": "等待投产", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "deployment_status", "code": "testing", "name": "测试环境", "description": "测试环境投产", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "deployment_status", "code": "staging", "name": "预发布环境", "description": "预发布环境投产", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "deployment_status", "code": "production", "name": "生产环境", "description": "生产环境投产", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "deployment_status", "code": "rollback", "name": "回滚", "description": "版本回滚", "sort_order": 50, "is_active": True, "created_at": now, "updated_at": now},
        
        # 配置类型
        {"category": "config_type", "code": "system", "name": "系统配置", "description": "系统级配置", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "config_type", "code": "application", "name": "应用配置", "description": "应用程序配置", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "config_type", "code": "database", "name": "数据库配置", "description": "数据库相关配置", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "config_type", "code": "network", "name": "网络配置", "description": "网络相关配置", "sort_order": 40, "is_active": True, "created_at": now, "updated_at": now},
        
        # 用户状态
        {"category": "user_status", "code": "active", "name": "活跃", "description": "用户处于活跃状态", "sort_order": 10, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "user_status", "code": "inactive", "name": "未激活", "description": "用户未激活", "sort_order": 20, "is_active": True, "created_at": now, "updated_at": now},
        {"category": "user_status", "code": "suspended", "name": "已停用", "description": "用户已停用", "sort_order": 30, "is_active": True, "created_at": now, "updated_at": now},
    ]
    
    existing_codes = set()
    for category in all_categories:
        items = await db.data_items.find({"category": category}).to_list(1000)
        for item in items:
            existing_codes.add((category, item.get("code")))
    
    items_to_insert = []
    for item in initial_data:
        if (item["category"], item["code"]) not in existing_codes:
            items_to_insert.append(item)
    
    if items_to_insert:
        await db.data_items.insert_many(items_to_insert)
        print(f"Initialized {len(items_to_insert)} data items on startup")

