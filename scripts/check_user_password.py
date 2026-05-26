import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt

async def check_user_password():
    # 连接MongoDB
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["pmos_db"]
    
    # 获取admin用户
    admin_user = await db.users.find_one({"username": "admin"})
    
    if not admin_user:
        print("❌ 未找到admin用户")
        return
    
    print("=== 用户记录信息 ===")
    print(f"用户名: {admin_user.get('username')}")
    print(f"密码哈希: {admin_user.get('password_hash')}")
    print(f"密码哈希类型: {type(admin_user.get('password_hash'))}")
    print(f"密码哈希长度: {len(admin_user.get('password_hash', ''))}")
    
    # 测试密码验证
    test_password = "pmos01"
    stored_hash = admin_user.get('password_hash', '')
    
    print("\n=== 密码验证测试 ===")
    print(f"测试密码: {test_password}")
    
    try:
        is_valid = bcrypt.checkpw(test_password.encode('utf-8'), stored_hash.encode('utf-8'))
        print(f"密码验证结果: {'✅ 验证成功' if is_valid else '❌ 验证失败'}")
    except Exception as e:
        print(f"验证过程出错: {e}")
    
    # 测试正确的哈希方式
    print("\n=== 正确哈希方式测试 ===")
    correct_hash = bcrypt.hashpw(test_password.encode('utf-8'), bcrypt.gensalt())
    print(f"正确格式的哈希: {correct_hash.decode('utf-8')}")
    print(f"正确格式哈希长度: {len(correct_hash)}")
    
    await client.close()

if __name__ == "__main__":
    asyncio.run(check_user_password())