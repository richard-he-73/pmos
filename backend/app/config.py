from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "PMOS Backend"
    app_env: str = "development"
    debug: bool = True
    secret_key: str = "your-secret-key-here-change-in-production"
    api_prefix: str = "/api/v1"
    host: str = "0.0.0.0"
    port: int = 18001

    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "pmos"

    redis_url: str = "redis://localhost:6379/0"

    jwt_secret_key: str = "your-jwt-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7

    allowed_origins: str = "http://localhost:16001"

    celery_broker_url: str = "amqp://guest:guest@localhost:5672/"
    celery_result_backend: str = "redis://localhost:6379/1"

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
