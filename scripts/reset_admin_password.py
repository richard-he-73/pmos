import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

async def reset_admin_password():
    # 连接MongoDB
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["pmos_db"]
    
    # 查找admin用户
    admin_user = await db.users.find_one({"username": "admin"})
    
    if not admin_user:
        print("❌ 未找到admin用户")
        return
    
    print(f"找到admin用户: {admin_user['username']}")
    print(f"用户ID: {admin_user['_id']}")
    
    # 创建密码哈希
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    new_password = "pmos01"
    password_hash = pwd_context.hash(new_password)
    
    # 更新密码
    result = await db.users.update_one(
        {"_id": admin_user["_id"]},
        {"$set": {"password_hash": password_hash}}
    )
    
    if result.modified_count > 0:
        print("✅ admin用户密码已成功修改为: pmos01")
    else:
        print("❌ 密码更新失败")
    
    await client.close()

if __name__ == "__main__":
    asyncio.run(reset_admin_password())