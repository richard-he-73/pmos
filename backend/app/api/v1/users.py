from datetime import datetime
import datetime as dt

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_password_hash, verify_password
from app.dependencies import get_current_user
from app.schemas.auth import UserInDB
from app.schemas.user_settings import (
    AppearanceSettings,
    ChangePasswordRequest,
    NotificationSettings,
    SecuritySettings,
    UserProfileUpdate,
    UserSettings,
)


class CreateUserRequest(BaseModel):
    username: str
    password: str
    email: str
    display_name: str
    phone: str | None = None
    department: str | None = None
    position: str | None = None
    role: str = "member"


class UpdateUserRequest(BaseModel):
    email: str | None = None
    display_name: str | None = None
    phone: str | None = None
    department: str | None = None
    position: str | None = None
    role: str | None = None
    status: str | None = None


class ResetPasswordRequest(BaseModel):
    new_password: str


router = APIRouter(prefix="/users", tags=["用户管理"])


@router.get("/me/profile")
async def get_user_profile(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    user = await db.users.find_one({"_id": ObjectId(current_user.id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")

    return {
        "username": user.get("username", ""),
        "display_name": user.get("display_name", ""),
        "email": user.get("email", ""),
        "phone": user.get("phone", ""),
        "department": user.get("department", ""),
        "position": user.get("position", ""),
        "bio": user.get("bio", ""),
    }


@router.put("/me/profile")
async def update_user_profile(
    profile_data: UserProfileUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    update_data = profile_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="没有提供更新数据"
        )

    update_data["updated_at"] = datetime.now(dt.UTC)
    result = await db.users.update_one(
        {"_id": ObjectId(current_user.id)}, {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")

    updated = await db.users.find_one({"_id": ObjectId(current_user.id)})
    return {
        "username": updated.get("username", ""),
        "display_name": updated.get("display_name", ""),
        "email": updated.get("email", ""),
        "phone": updated.get("phone", ""),
        "department": updated.get("department", ""),
        "position": updated.get("position", ""),
        "bio": updated.get("bio", ""),
    }


@router.get("/me/settings/notifications", response_model=NotificationSettings)
async def get_notification_settings(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    user = await db.users.find_one({"_id": ObjectId(current_user.id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")

    notifications = user.get("notification_settings", {})
    return NotificationSettings(
        emailNotification=notifications.get("emailNotification", True),
        inAppNotification=notifications.get("inAppNotification", True),
        browserNotification=notifications.get("browserNotification", False),
        taskReminder=notifications.get("taskReminder", True),
        riskAlert=notifications.get("riskAlert", True),
    )


@router.put("/me/settings/notifications", response_model=NotificationSettings)
async def update_notification_settings(
    settings: NotificationSettings,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    update_data = {"notification_settings": settings.model_dump()}
    update_data["notification_settings"]["updated_at"] = datetime.now(dt.UTC)

    result = await db.users.update_one(
        {"_id": ObjectId(current_user.id)}, {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")

    return settings


@router.get("/me/settings/security", response_model=SecuritySettings)
async def get_security_settings(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    user = await db.users.find_one({"_id": ObjectId(current_user.id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")

    security = user.get("security_settings", {})
    return SecuritySettings(
        twoFactorAuth=security.get("twoFactorAuth", False),
        loginNotification=security.get("loginNotification", True),
    )


@router.put("/me/settings/security", response_model=SecuritySettings)
async def update_security_settings(
    settings: SecuritySettings,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    update_data = {"security_settings": settings.model_dump()}
    update_data["security_settings"]["updated_at"] = datetime.now(dt.UTC)

    result = await db.users.update_one(
        {"_id": ObjectId(current_user.id)}, {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")

    return settings


@router.get("/me/settings/appearance", response_model=AppearanceSettings)
async def get_appearance_settings(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    user = await db.users.find_one({"_id": ObjectId(current_user.id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")

    appearance = user.get("appearance_settings", {})
    return AppearanceSettings(
        theme=appearance.get("theme", "light"),
        accentColor=appearance.get("accentColor", "#1890ff"),
        fontSize=appearance.get("fontSize", "medium"),
        compactLayout=appearance.get("compactLayout", False),
    )


@router.put("/me/settings/appearance", response_model=AppearanceSettings)
async def update_appearance_settings(
    settings: AppearanceSettings,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    update_data = {"appearance_settings": settings.model_dump()}
    update_data["appearance_settings"]["updated_at"] = datetime.now(dt.UTC)

    result = await db.users.update_one(
        {"_id": ObjectId(current_user.id)}, {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")

    return settings


@router.get("/me/settings")
async def get_all_settings(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    profile = await get_user_profile(db, current_user)
    notifications = await get_notification_settings(db, current_user)
    security = await get_security_settings(db, current_user)
    appearance = await get_appearance_settings(db, current_user)

    return UserSettings(
        profile=UserProfileUpdate(**profile),
        notifications=notifications,
        security=security,
        appearance=appearance,
    )


@router.post("/me/change-password")
async def change_password(
    data: ChangePasswordRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    user = await db.users.find_one({"_id": ObjectId(current_user.id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")

    if not verify_password(data.currentPassword, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="当前密码错误"
        )

    new_hash = get_password_hash(data.newPassword)
    await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {"password_hash": new_hash, "updated_at": datetime.now(dt.UTC)}},
    )

    return {"message": "密码修改成功"}


@router.get("")
async def get_users(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    users = await db.users.find().to_list(100)
    result = []
    for user in users:
        result.append(
            {
                "id": str(user["_id"]),
                "username": user.get("username", ""),
                "email": user.get("email", ""),
                "display_name": user.get("display_name", ""),
                "phone": user.get("phone", ""),
                "department": user.get("department", ""),
                "position": user.get("position", ""),
                "role": user.get("role", "member"),
                "status": user.get("status", "active"),
                "last_login": user.get("last_login"),
                "created_at": user.get("created_at"),
            }
        )
    return result


@router.get("/{user_id}")
async def get_user(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")

    return {
        "id": str(user["_id"]),
        "username": user.get("username", ""),
        "email": user.get("email", ""),
        "display_name": user.get("display_name", ""),
        "phone": user.get("phone", ""),
        "department": user.get("department", ""),
        "position": user.get("position", ""),
        "role": user.get("role", "member"),
        "status": user.get("status", "active"),
        "last_login": user.get("last_login"),
        "created_at": user.get("created_at"),
    }


@router.post("")
async def create_user(
    data: CreateUserRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    existing_user = await db.users.find_one({"username": data.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="用户名已存在"
        )

    existing_email = await db.users.find_one({"email": data.email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="邮箱已被使用"
        )

    password_hash = get_password_hash(data.password)
    now = datetime.now(dt.UTC)

    new_user = {
        "username": data.username,
        "password_hash": password_hash,
        "email": data.email,
        "display_name": data.display_name,
        "phone": data.phone,
        "department": data.department,
        "position": data.position,
        "role": data.role,
        "status": "active",
        "created_at": now,
        "updated_at": now,
    }

    result = await db.users.insert_one(new_user)
    new_user["_id"] = result.inserted_id

    return {
        "id": str(new_user["_id"]),
        "username": new_user["username"],
        "email": new_user["email"],
        "display_name": new_user["display_name"],
        "phone": new_user["phone"],
        "department": new_user["department"],
        "position": new_user["position"],
        "role": new_user["role"],
        "status": new_user["status"],
        "created_at": new_user["created_at"],
    }


@router.put("/{user_id}")
async def update_user(
    user_id: str,
    data: UpdateUserRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="没有提供更新数据"
        )

    update_data["updated_at"] = datetime.now(dt.UTC)
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)}, {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")

    updated = await db.users.find_one({"_id": ObjectId(user_id)})
    return {
        "id": str(updated["_id"]),
        "username": updated.get("username", ""),
        "email": updated.get("email", ""),
        "display_name": updated.get("display_name", ""),
        "phone": updated.get("phone", ""),
        "department": updated.get("department", ""),
        "position": updated.get("position", ""),
        "role": updated.get("role", "member"),
        "status": updated.get("status", "active"),
        "last_login": updated.get("last_login"),
        "created_at": updated.get("created_at"),
    }


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if str(current_user.id) == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="不能删除自己的账户"
        )

    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")

    return {"message": "用户已删除"}


@router.post("/{user_id}/reset-password")
async def reset_password(
    user_id: str,
    data: ResetPasswordRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if len(data.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="密码至少6位"
        )

    new_hash = get_password_hash(data.new_password)
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password_hash": new_hash, "updated_at": datetime.now(dt.UTC)}},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")

    return {"message": "密码已重置"}
