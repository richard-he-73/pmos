import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.dependencies import get_current_user
from app.schemas.auth import UserInDB
from app.schemas.notification import (
    NotificationCreate,
    NotificationResponse,
    NotificationUpdate,
)

router = APIRouter(prefix="/notifications", tags=["通知系统"])


@router.get("", response_model=list[NotificationResponse])
async def list_notifications(
    skip: int = 0,
    limit: int = 20,
    is_read: bool | None = None,
    type_filter: str | None = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    query = {"user_id": current_user.id}
    if is_read is not None:
        query["is_read"] = is_read
    if type_filter:
        query["type"] = type_filter
    cursor = db.notifications.find(query).skip(skip).limit(limit).sort("created_at", -1)
    notifications = await cursor.to_list(length=limit)
    result = []
    for n in notifications:
        n["_id"] = str(n["_id"])
        result.append(NotificationResponse(**n))
    return result


@router.get("/unread-count")
async def get_unread_count(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    count = await db.notifications.count_documents({"user_id": current_user.id, "is_read": False})
    return {"unread_count": count}


@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="无效的通知ID")
    notification = await db.notifications.find_one({"_id": ObjectId(notification_id), "user_id": current_user.id})
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="通知不存在")
    notification["_id"] = str(notification["_id"])
    return NotificationResponse(**notification)


@router.post("", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def create_notification(
    notification_data: NotificationCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    notif_dict = notification_data.model_dump()
    notif_dict["created_at"] = datetime.datetime.now(datetime.UTC)
    notif_dict["updated_at"] = datetime.datetime.now(datetime.UTC)
    result = await db.notifications.insert_one(notif_dict)
    notif_dict["_id"] = str(result.inserted_id)
    return NotificationResponse(**notif_dict)


@router.post("/batch", response_model=list[NotificationResponse], status_code=status.HTTP_201_CREATED)
async def create_batch_notifications(
    user_ids: list[str],
    title: str,
    content: str = "",
    type: str = "info",
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    notifications = []
    for uid in user_ids:
        notif = {
            "user_id": uid,
            "title": title,
            "content": content,
            "type": type,
            "is_read": False,
            "source_type": "",
            "source_id": "",
            "expire_at": None,
            "created_at": datetime.datetime.now(datetime.UTC),
            "updated_at": datetime.datetime.now(datetime.UTC),
        }
        result = await db.notifications.insert_one(notif)
        notif["_id"] = str(result.inserted_id)
        notifications.append(NotificationResponse(**notif))
    return notifications


@router.put("/{notification_id}", response_model=NotificationResponse)
async def update_notification(
    notification_id: str,
    notification_data: NotificationUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="无效的通知ID")
    update_data = notification_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="没有提供更新数据")
    update_data["updated_at"] = datetime.datetime.now(datetime.UTC)
    if update_data.get("is_read") and "read_at" not in update_data:
        update_data["read_at"] = datetime.datetime.now(datetime.UTC)
    result = await db.notifications.update_one(
        {"_id": ObjectId(notification_id), "user_id": current_user.id},
        {"$set": update_data},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="通知不存在")
    updated = await db.notifications.find_one({"_id": ObjectId(notification_id)})
    updated["_id"] = str(updated["_id"])
    return NotificationResponse(**updated)


@router.post("/mark-all-read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_read(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    now = datetime.datetime.now(datetime.UTC)
    await db.notifications.update_many(
        {"user_id": current_user.id, "is_read": False},
        {"$set": {"is_read": True, "read_at": now, "updated_at": now}},
    )


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="无效的通知ID")
    result = await db.notifications.delete_one({"_id": ObjectId(notification_id), "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="通知不存在")
