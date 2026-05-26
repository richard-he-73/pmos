import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def list_users():
    # 连接MongoDB
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["pmos_db"]
    
    # 获取所有用户
    users = await db.users.find().to_list(100)
    
    if not users:
        print("❌ 数据库中没有用户")
        return
    
    print("数据库中的用户列表:")
    print("-" * 50)
    for user in users:
        print(f"用户名: {user.get('username', '未知')}")
        print(f"邮箱: {user.get('email', '未知')}")
        print(f"显示名称: {user.get('display_name', '未知')}")
        print(f"角色: {user.get('role', '未知')}")
        print(f"状态: {user.get('status', '未知')}")
        print(f"用户ID: {user.get('_id', '未知')}")
        print("-" * 50)
    
    await client.close()

if __name__ == "__main__":
    asyncio.run(list_users())