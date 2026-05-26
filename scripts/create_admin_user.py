import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
from datetime import datetime, timezone

async def create_admin_user():
    # 连接MongoDB - 使用正确的数据库名称 "pmos"
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["pmos"]  # 注意：这里改成 pmos，不是 pmos_db
    
    # 创建密码哈希
    password = "pmos01"
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    now = datetime.now(timezone.utc)
    
    admin_user = {
        "username": "admin",
        "password_hash": password_hash,
        "email": "admin@example.com",
        "display_name": "管理员",
        "phone": "",
        "department": "管理部",
        "position": "管理员",
        "role": "admin",
        "status": "active",
        "created_at": now,
        "updated_at": now,
    }
    
    # 先删除已存在的admin用户（如果有）
    await db.users.delete_one({"username": "admin"})
    
    # 创建新用户
    result = await db.users.insert_one(admin_user)
    admin_user["_id"] = result.inserted_id
    
    print("✅ admin用户已成功创建")
    print(f"用户名: {admin_user['username']}")
    print(f"密码: {password}")
    print(f"邮箱: {admin_user['email']}")
    print(f"角色: {admin_user['role']}")
    print(f"数据库: pmos")
    print(f"用户ID: {admin_user['_id']}")
    
    client.close()  # 去掉await

if __name__ == "__main__":
    asyncio.run(create_admin_user())