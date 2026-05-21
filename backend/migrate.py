#!/usr/bin/env python3
"""
PMOS Database Migration Script

This script handles MongoDB schema migrations for the PMOS application.
Run with: uv run python migrate.py [upgrade|downgrade|status] [--target <version>]
"""

import asyncio
import datetime
import sys
from typing import Callable

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "pmos"

MIGRATIONS: list[dict] = []


def migration(version: int, description: str):
    """Decorator to register a migration function."""
    def decorator(func: Callable):
        MIGRATIONS.append({
            "version": version,
            "description": description,
            "func": func,
        })
        return func
    return decorator


async def get_migrations_collection(db: AsyncIOMotorDatabase):
    """Get or create the migrations tracking collection."""
    if "migrations" not in await db.list_collection_names():
        await db.create_collection("migrations")
    return db.migrations


async def get_current_version(db: AsyncIOMotorDatabase) -> int:
    """Get the current migration version."""
    migrations = await get_migrations_collection(db)
    latest = await migrations.find_one(sort=[("version", -1)])
    return latest["version"] if latest else 0


async def record_migration(db: AsyncIOMotorDatabase, version: int, description: str):
    """Record a successful migration."""
    migrations = await get_migrations_collection(db)
    await migrations.insert_one({
        "version": version,
        "description": description,
        "applied_at": datetime.datetime.now(datetime.UTC),
    })


# ============================================================================
# Migration Definitions
# ============================================================================

@migration(1, "Add status tracking fields to projects")
async def migrate_v1(db: AsyncIOMotorDatabase):
    """Add status tracking fields (started_at, completed_at, archived_at) to existing projects."""
    projects = db.projects
    await projects.update_many(
        {"status": "active", "started_at": {"$exists": False}},
        {"$set": {"started_at": datetime.datetime.now(datetime.UTC)}}
    )
    await projects.update_many(
        {"status": "completed", "completed_at": {"$exists": False}},
        {"$set": {
            "completed_at": datetime.datetime.now(datetime.UTC),
            "progress": 100.0
        }}
    )


@migration(2, "Add status transition tracking to projects")
async def migrate_v2(db: AsyncIOMotorDatabase):
    """Initialize status transition fields for all projects."""
    projects = db.projects
    await projects.update_many(
        {"status_transition_at": {"$exists": False}},
        {"$set": {
            "status_transition_reason": "",
            "status_transition_at": datetime.datetime.now(datetime.UTC),
            "status_transition_from": None,
        }}
    )


@migration(3, "Normalize project budget fields")
async def migrate_v3(db: AsyncIOMotorDatabase):
    """Ensure all projects have budget_total, budget_used, budget_currency fields."""
    projects = db.projects
    await projects.update_many(
        {"budget_total": {"$exists": False}},
        {"$set": {"budget_total": 0.0, "budget_used": 0.0, "budget_currency": "CNY"}}
    )


@migration(4, "Add default dependencies array to tasks")
async def migrate_v4(db: AsyncIOMotorDatabase):
    """Ensure all tasks have a dependencies array."""
    tasks = db.tasks
    await tasks.update_many(
        {"dependencies": {"$exists": False}},
        {"$set": {"dependencies": []}}
    )


@migration(5, "Create indexes for common queries")
async def migrate_v5(db: AsyncIOMotorDatabase):
    """Create indexes for optimized query performance."""
    await db.projects.create_index([("code", 1)], unique=True)
    await db.projects.create_index([("status", 1)])
    await db.projects.create_index([("owner_id", 1)])
    await db.tasks.create_index([("project_id", 1)])
    await db.tasks.create_index([("assignee_id", 1)])
    await db.tasks.create_index([("status", 1)])
    await db.tasks.create_index([("priority", 1)])
    await db.resources.create_index([("type", 1)])
    await db.resources.create_index([("availability", 1)])
    await db.users.create_index([("username", 1)], unique=True)
    await db.users.create_index([("email", 1)], unique=True)


# ============================================================================
# Migration Commands
# ============================================================================

async def cmd_upgrade(db: AsyncIOMotorDatabase, target: int | None = None):
    """Run all pending migrations or up to target version."""
    current = await get_current_version(db)
    pending = [m for m in MIGRATIONS if m["version"] > current]
    if target:
        pending = [m for m in pending if m["version"] <= target]

    if not pending:
        print(f"No pending migrations (current version: {current})")
        return

    print(f"Current version: {current}")
    print(f"Running {len(pending)} migration(s)...")

    for m in sorted(pending, key=lambda x: x["version"]):
        print(f"  Applying v{m['version']}: {m['description']}...")
        try:
            await m["func"](db)
            await record_migration(db, m["version"], m["description"])
            print(f"    ✓ v{m['version']} applied successfully")
        except Exception as e:
            print(f"    ✗ v{m['version']} failed: {e}")
            raise

    new_version = await get_current_version(db)
    print(f"Migration complete. Current version: {new_version}")


async def cmd_status(db: AsyncIOMotorDatabase):
    """Show migration status."""
    current = await get_current_version(db)
    print(f"Current migration version: {current}")
    print(f"Total available migrations: {len(MIGRATIONS)}")
    print(f"Pending migrations: {len(MIGRATIONS) - current}")
    print()
    print("Available migrations:")
    for m in sorted(MIGRATIONS, key=lambda x: x["version"]):
        status = "✓" if m["version"] <= current else " "
        print(f"  [{status}] v{m['version']}: {m['description']}")


async def main():
    """Main entry point."""
    command = sys.argv[1] if len(sys.argv) > 1 else "status"
    target = None

    if "--target" in sys.argv:
        target_idx = sys.argv.index("--target")
        if target_idx + 1 < len(sys.argv):
            target = int(sys.argv[target_idx + 1])

    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    try:
        if command == "upgrade":
            await cmd_upgrade(db, target)
        elif command == "status":
            await cmd_status(db)
        else:
            print(f"Unknown command: {command}")
            print("Usage: python migrate.py [upgrade|status] [--target <version>]")
            sys.exit(1)
    except Exception as e:
        print(f"Migration error: {e}")
        sys.exit(1)
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(main())
