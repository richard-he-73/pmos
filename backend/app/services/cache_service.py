"""
PMOS Redis Cache Service
用于 API 响应缓存、会话管理等
"""

import json
from typing import Any, Optional

import redis.asyncio as aioredis

from app.config import settings


class CacheService:
    """Redis 缓存服务"""

    def __init__(self, redis_url: Optional[str] = None):
        self.redis_url = redis_url or settings.redis_url
        self._redis: Optional[aioredis.Redis] = None

    async def get_redis(self) -> aioredis.Redis:
        """获取 Redis 连接"""
        if self._redis is None:
            self._redis = aioredis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True,
            )
        return self._redis

    async def get(self, key: str) -> Optional[Any]:
        """获取缓存值"""
        try:
            redis = await self.get_redis()
            value = await redis.get(key)
            if value is not None:
                return json.loads(value)
            return None
        except Exception:
            return None

    async def set(self, key: str, value: Any, expire: int = 300) -> bool:
        """设置缓存值

        Args:
            key: 缓存键
            value: 缓存值
            expire: 过期时间（秒），默认 5 分钟
        """
        try:
            redis = await self.get_redis()
            serialized = json.dumps(value, ensure_ascii=False, default=str)
            await redis.setex(key, expire, serialized)
            return True
        except Exception:
            return False

    async def delete(self, key: str) -> bool:
        """删除缓存"""
        try:
            redis = await self.get_redis()
            await redis.delete(key)
            return True
        except Exception:
            return False

    async def exists(self, key: str) -> bool:
        """检查键是否存在"""
        try:
            redis = await self.get_redis()
            return await redis.exists(key) > 0
        except Exception:
            return False

    async def clear_pattern(self, pattern: str) -> bool:
        """清除匹配模式的缓存"""
        try:
            redis = await self.get_redis()
            keys = await redis.keys(pattern)
            if keys:
                await redis.delete(*keys)
            return True
        except Exception:
            return False

    async def close(self):
        """关闭 Redis 连接"""
        if self._redis:
            await self._redis.close()
            self._redis = None


# 全局单例
cache_service = CacheService()
