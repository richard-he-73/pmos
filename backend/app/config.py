from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_config = {"env_file": ".env", "case_sensitive": False}

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

    smtp_host: str = "localhost"
    smtp_port: int = 1025
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "no-reply@pmos.local"
    email_enabled: bool = False

    jwt_secret_key: str = "your-jwt-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7

    allowed_origins: str = "http://localhost:16001"

    celery_broker_url: str = "amqp://guest:guest@localhost:5672/"
    celery_result_backend: str = "redis://localhost:6379/1"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
