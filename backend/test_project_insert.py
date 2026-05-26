#!/usr/bin/env python3
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import get_settings
from app.core.security import get_password_hash
import datetime


async def test_project_creation():
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_db_name]

    # 创建测试项目数据
    test_project = {
        "code": "XDZX-2026-001",
        "name": "测试项目",
        "description": "测试描述",
        "owner_id": "test_owner",
        "stakeholders": [],
        "status": "planning",
        "priority": "medium",
        "start_date": datetime.datetime.now(datetime.timezone.utc),
        "end_date": None,
        "budget_total": 100000,
        "budget_used": 0,
        "budget_currency": "CNY",
        "progress": 0,
        "tags": [],
        "created_at": datetime.datetime.now(datetime.timezone.utc),
        "updated_at": datetime.datetime.now(datetime.timezone.utc),
    }

    print(f"Before insert - code: {test_project['code']}")
    print(f"Before insert - code length: {len(test_project['code'])}")

    # 插入数据库
    result = await db.projects.insert_one(test_project)
    print(f"Insert result: {result.inserted_id}")

    # 查询刚插入的数据
    inserted = await db.projects.find_one({"_id": result.inserted_id})
    print(f"\nAfter insert - code: {inserted.get('code')}")
    print(f"After insert - code length: {len(inserted.get('code', ''))}")

    # 清理测试数据
    await db.projects.delete_one({"_id": result.inserted_id})
    print("\nTest completed!")

    client.close()


if __name__ == "__main__":
    asyncio.run(test_project_creation())
