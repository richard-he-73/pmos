import datetime as dt
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.schemas.auth import TokenResponse, UserCreate, UserLogin, UserResponse

router = APIRouter(prefix="/auth", tags=["认证"])


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
async def register(user_data: UserCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    existing = await db.users.find_one(
        {"$or": [{"username": user_data.username}, {"email": user_data.email}]}
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="用户名或邮箱已存在"
        )

    user_dict = user_data.model_dump()
    user_dict["password_hash"] = get_password_hash(user_dict.pop("password"))
    user_dict["permissions"] = []
    now = datetime.now(dt.UTC)
    user_dict["created_at"] = now
    user_dict["updated_at"] = now

    result = await db.users.insert_one(user_dict)
    user_dict["_id"] = str(result.inserted_id)
    user_dict.pop("password_hash")

    return UserResponse(**user_dict)


@router.post("/login", response_model=dict)
async def login(login_data: UserLogin, db: AsyncIOMotorDatabase = Depends(get_db)):
    user = await db.users.find_one({"username": login_data.username})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="用户名或密码错误"
        )
    
    # 检查用户状态
    user_status = user.get("status", "active")
    if user_status != "active":
        status_message = {
            "inactive": "账户未激活",
            "suspended": "账户已被停用"
        }.get(user_status, "账户状态异常")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail=status_message
        )

    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.now(dt.UTC)}},
    )

    token_data = {"sub": str(user["_id"]), "role": user["role"]}
    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data=token_data)
    
    # 构建用户响应
    user_response = UserResponse(
        id=str(user["_id"]),
        username=user["username"],
        email=user["email"],
        display_name=user["display_name"],
        avatar=user.get("avatar"),
        role=user["role"],
        department=user.get("department", ""),
        status=user.get("status", "active"),
        last_login=user.get("last_login")
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_response.model_dump()
    }


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(token: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    payload = decode_token(token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="无效的刷新令牌"
        )

    user = await db.users.find_one({"_id": payload.get("sub")})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")

    token_data = {"sub": str(user["_id"]), "role": user["role"]}
    return TokenResponse(
        access_token=create_access_token(data=token_data),
        refresh_token=create_refresh_token(data=token_data),
        token_type="bearer",
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(lambda: None)):
    return current_user
