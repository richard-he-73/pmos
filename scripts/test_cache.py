import asyncio
import sys
sys.path.insert(0, '/Users/hefeng/AiApp/PMOS/backend')

from app.services.cache import cache, get_project_cache_key

async def test_cache():
    # 连接到Redis
    await cache.connect()
    
    print(f"✅ Redis连接状态: {'已连接' if cache.is_connected() else '未连接'}")
    
    if cache.is_connected():
        # 测试设置缓存
        test_key = "test:cache_key"
        test_value = {"name": "测试项目", "status": "active", "created_at": "2024-01-01"}
        
        set_result = await cache.set(test_key, test_value, ttl=60)
        print(f"✅ 设置缓存: {'成功' if set_result else '失败'}")
        
        # 测试获取缓存
        get_result = await cache.get(test_key)
        print(f"✅ 获取缓存: {'成功' if get_result else '失败'}")
        if get_result:
            print(f"   缓存内容: {get_result}")
        
        # 测试删除缓存
        delete_result = await cache.delete(test_key)
        print(f"✅ 删除缓存: {'成功' if delete_result else '失败'}")
        
        # 验证删除
        after_delete = await cache.get(test_key)
        print(f"✅ 验证删除: {'成功（缓存已清除）' if after_delete is None else '失败'}")
        
        # 测试缓存键工具函数
        project_key = get_project_cache_key("project123")
        print(f"✅ 项目缓存键: {project_key}")
        
        await cache.disconnect()
    else:
        print("❌ Redis连接失败，请检查Redis服务是否运行")

if __name__ == "__main__":
    asyncio.run(test_cache())