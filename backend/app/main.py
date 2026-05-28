from contextlib import asynccontextmanager
from typing import Callable

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import (
    auth,
    communications,
    data_dictionaries,
    data_item,
    development,
    export,
    modules,
    notifications,
    organization,
    permissions,
    projects,
    requirements,
    resources,
    risks,
    stats,
    tasks,
    testing,
    users,
    plans,
)
from app.config import get_settings
from app.core.websocket import manager

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.core.database import close_mongo, connect_to_mongo, db
    from app.services.cache import cache
    from app.api.v1.data_item import initialize_data_items_on_startup
    
    await connect_to_mongo()
    await cache.connect()
    
    # Initialize data items on startup
    try:
        await initialize_data_items_on_startup(db)
    except Exception as e:
        print(f"Warning: Failed to initialize data items on startup: {e}")
    
    yield
    await close_mongo()
    await cache.disconnect()


def create_app(custom_lifespan: Callable | None = None) -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        description="PMOS - Project Management Operating System API",
        version="0.1.0",
        lifespan=custom_lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins.split(","),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router, prefix=settings.api_prefix)
    app.include_router(projects.router, prefix=settings.api_prefix)
    app.include_router(tasks.router, prefix=settings.api_prefix)
    app.include_router(resources.router, prefix=settings.api_prefix)
    app.include_router(stats.router, prefix=settings.api_prefix)
    app.include_router(risks.router, prefix=settings.api_prefix)
    app.include_router(requirements.router, prefix=settings.api_prefix)
    app.include_router(development.router, prefix=settings.api_prefix)
    app.include_router(testing.router, prefix=settings.api_prefix)
    app.include_router(export.router, prefix=settings.api_prefix)
    app.include_router(permissions.router, prefix=settings.api_prefix)
    app.include_router(notifications.router, prefix=settings.api_prefix)
    app.include_router(communications.router, prefix=settings.api_prefix)
    app.include_router(modules.router, prefix=settings.api_prefix)
    app.include_router(users.router, prefix=settings.api_prefix)
    app.include_router(plans.router, prefix=settings.api_prefix)
    app.include_router(data_dictionaries.router, prefix=settings.api_prefix)
    app.include_router(organization.router, prefix=settings.api_prefix)
    app.include_router(data_item.router, prefix=settings.api_prefix)

    @app.get("/health")
    async def health_check():
        return {"status": "ok", "timestamp": "healthy"}

    @app.get("/")
    async def root():
        return {
            "name": settings.app_name,
            "version": "0.1.0",
            "docs": "/docs",
        }

    from fastapi import WebSocket, Query
    from app.dependencies import get_current_user
    from app.core.security import decode_access_token

    @app.websocket("/ws")
    async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
        """WebSocket 端点用于实时通知推送"""
        payload = decode_access_token(token)
        if not payload:
            await websocket.close(code=4001, reason="Invalid token")
            return

        user_id = payload.get("sub") or payload.get("user_id", "anonymous")
        await manager.connect(websocket, user_id)
        try:
            while True:
                await websocket.receive_text()
        except Exception:
            await manager.disconnect(websocket, user_id)

    return app


def _create_prod_app() -> FastAPI:
    return create_app(lifespan)


app = _create_prod_app()
