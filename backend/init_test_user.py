#!/usr/bin/env python3
import asyncio
import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.security import get_password_hash
from app.config import get_settings


async def init_test_user():
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_db_name]
    
    # 检查是否已有测试用户
    existing = await db.users.find_one({"username": "admin"})
    if existing:
        # 更新现有用户，确保有所有必需字段
        await db.users.update_one(
            {"_id": existing["_id"]},
            {"$set": {
                "display_name": "系统管理员",
                "department": "技术部",
                "status": "active"
            }}
        )
        print("测试用户已更新")
        print("用户名: admin")
        print("密码: admin123")
        return
    
    now = datetime.datetime.now(datetime.UTC)
    test_user = {
        "username": "admin",
        "email": "admin@pmos.local",
        "display_name": "系统管理员",
        "password_hash": get_password_hash("admin123"),
        "role": "admin",
        "department": "技术部",
        "status": "active",
        "permissions": [],
        "created_at": now,
        "updated_at": now,
        "last_login": now
    }
    
    result = await db.users.insert_one(test_user)
    print(f"测试用户创建成功，ID: {result.inserted_id}")
    print("用户名: admin")
    print("密码: admin123")
    
    await client.close()


if __name__ == "__main__":
    asyncio.run(init_test_user())
