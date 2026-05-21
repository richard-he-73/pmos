from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import get_settings

settings = get_settings()

client = AsyncIOMotorClient(settings.mongodb_url)
db: AsyncIOMotorDatabase = client[settings.mongodb_db_name]


async def get_db() -> AsyncIOMotorDatabase:
    try:
        yield db
    finally:
        pass


async def connect_to_mongo() -> None:
    await client.admin.command("ping")
    print(f"Connected to MongoDB: {settings.mongodb_url}")


async def close_mongo() -> None:
    client.close()
    print("Closed MongoDB connection")
