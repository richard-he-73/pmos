#!/usr/bin/env python3
import asyncio
import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.security import get_password_hash
from app.config import get_settings


async def reset_users():
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_db_name]
    
    print("Deleting all existing users...")
    await db.users.delete_many({})
    
    print("Creating fresh admin user...")
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
    print(f"Admin user created, ID: {result.inserted_id}")
    print("Username: admin")
    print("Password: admin123")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(reset_users())
