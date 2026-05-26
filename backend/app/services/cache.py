"""
Cache Service for Redis-based caching
"""
import json
import asyncio
from typing import Any, Optional
from datetime import timedelta
from redis import asyncio as aioredis
from app.config import settings


class CacheService:
    """Redis cache service with async operations"""
    
    def __init__(self):
        self.redis_client: Optional[aioredis.Redis] = None
        self._connected = False
        
    async def connect(self) -> None:
        """Connect to Redis server"""
        try:
            self.redis_client = await aioredis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True
            )
            # Test connection
            await self.redis_client.ping()
            self._connected = True
            print(f"✅ Connected to Redis at {settings.redis_url}")
        except Exception as e:
            print(f"⚠️  Redis connection failed: {e}")
            self._connected = False
            
    async def disconnect(self) -> None:
        """Disconnect from Redis server"""
        if self.redis_client and self._connected:
            await self.redis_client.close()
            self._connected = False
            
    def is_connected(self) -> bool:
        """Check if connected to Redis"""
        return self._connected
    
    async def get(self, key: str) -> Optional[Any]:
        """Get a value from cache"""
        if not self.redis_client or not self._connected:
            return None
            
        try:
            data = await self.redis_client.get(key)
            if data:
                return json.loads(data)
            return None
        except Exception as e:
            print(f"Cache get error: {e}")
            return None
            
    async def set(
        self, 
        key: str, 
        value: Any, 
        ttl: Optional[int] = None
    ) -> bool:
        """Set a value in cache with optional TTL (in seconds)"""
        if not self.redis_client or not self._connected:
            return False
            
        try:
            serialized = json.dumps(value, default=str)
            if ttl:
                await self.redis_client.setex(key, ttl, serialized)
            else:
                await self.redis_client.set(key, serialized)
            return True
        except Exception as e:
            print(f"Cache set error: {e}")
            return False
            
    async def delete(self, key: str) -> bool:
        """Delete a value from cache"""
        if not self.redis_client or not self._connected:
            return False
            
        try:
            await self.redis_client.delete(key)
            return True
        except Exception as e:
            print(f"Cache delete error: {e}")
            return False
            
    async def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching a pattern"""
        if not self.redis_client or not self._connected:
            return 0
            
        try:
            keys = []
            async for key in self.redis_client.scan_iter(match=pattern):
                keys.append(key)
                
            if keys:
                await self.redis_client.delete(*keys)
            return len(keys)
        except Exception as e:
            print(f"Cache delete pattern error: {e}")
            return 0
            
    async def clear(self) -> bool:
        """Clear all cache data"""
        if not self.redis_client or not self._connected:
            return False
            
        try:
            await self.redis_client.flushdb()
            return True
        except Exception as e:
            print(f"Cache clear error: {e}")
            return False
            
    async def get_or_set(
        self, 
        key: str, 
        callback, 
        ttl: Optional[int] = None
    ) -> Any:
        """Get cached value or compute and set it"""
        cached = await self.get(key)
        if cached is not None:
            return cached
            
        value = await callback() if asyncio.iscoroutinefunction(callback) else callback()
        await self.set(key, value, ttl)
        return value


# Global cache instance
cache = CacheService()


# Cache key utilities
def get_project_cache_key(project_id: str) -> str:
    """Get cache key for a project"""
    return f"project:{project_id}"


def get_projects_cache_key() -> str:
    """Get cache key for projects list"""
    return "projects:all"


def get_task_cache_key(task_id: str) -> str:
    """Get cache key for a task"""
    return f"task:{task_id}"


def get_tasks_cache_key(project_id: Optional[str] = None) -> str:
    """Get cache key for tasks list"""
    if project_id:
        return f"tasks:project:{project_id}"
    return "tasks:all"


def get_resource_cache_key(resource_id: str) -> str:
    """Get cache key for a resource"""
    return f"resource:{resource_id}"


def get_resources_cache_key(resource_type: Optional[str] = None) -> str:
    """Get cache key for resources list"""
    if resource_type:
        return f"resources:type:{resource_type}"
    return "resources:all"


def get_risk_cache_key(risk_id: str) -> str:
    """Get cache key for a risk"""
    return f"risk:{risk_id}"


def get_risks_cache_key(project_id: Optional[str] = None) -> str:
    """Get cache key for risks list"""
    if project_id:
        return f"risks:project:{project_id}"
    return "risks:all"


def get_requirement_cache_key(requirement_id: str) -> str:
    """Get cache key for a requirement"""
    return f"requirement:{requirement_id}"


def get_requirements_cache_key(project_id: Optional[str] = None) -> str:
    """Get cache key for requirements list"""
    if project_id:
        return f"requirements:project:{project_id}"
    return "requirements:all"


def get_stats_cache_key(stat_type: str) -> str:
    """Get cache key for stats"""
    return f"stats:{stat_type}"


def get_user_cache_key(user_id: str) -> str:
    """Get cache key for a user"""
    return f"user:{user_id}"


def get_users_cache_key() -> str:
    """Get cache key for users list"""
    return "users:all"


def get_notification_cache_key(notification_id: str) -> str:
    """Get cache key for a notification"""
    return f"notification:{notification_id}"


def get_notifications_cache_key(user_id: Optional[str] = None) -> str:
    """Get cache key for notifications list"""
    if user_id:
        return f"notifications:user:{user_id}"
    return "notifications:all"


def get_config_cache_key(config_key: str) -> str:
    """Get cache key for a config"""
    return f"config:{config_key}"


# Default TTL values (in seconds)
TTL_SHORT = 300  # 5 minutes
TTL_MEDIUM = 1800  # 30 minutes
TTL_LONG = 3600  # 1 hour
TTL_VERY_LONG = 86400  # 1 day
