#!/usr/bin/env python3
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import get_settings


async def check_projects():
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_db_name]

    print("Checking projects in database:")
    print("-" * 50)

    projects = await db.projects.find().to_list(100)
    for project in projects:
        print(f"Code: {project.get('code')}")
        print(f"Name: {project.get('name')}")
        print(f"Status: {project.get('status')}")
        print("-" * 50)

    if not projects:
        print("No projects found!")

    client.close()


if __name__ == "__main__":
    asyncio.run(check_projects())
