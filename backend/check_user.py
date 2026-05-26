#!/usr/bin/env python3
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import get_settings


async def check_user():
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_db_name]
    
    print("Checking users in database:")
    print("-" * 50)
    
    users = await db.users.find().to_list(100)
    for user in users:
        print(f"Username: {user.get('username')}")
        print(f"Email: {user.get('email')}")
        print(f"Display Name: {user.get('display_name')}")
        print(f"Role: {user.get('role')}")
        print(f"Status: {user.get('status')}")
        print(f"Password Hash: {user.get('password_hash', 'NOT FOUND!')}")
        print("-" * 50)
    
    await client.close()


if __name__ == "__main__":
    asyncio.run(check_user())
