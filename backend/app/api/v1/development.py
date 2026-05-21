import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.dependencies import get_current_user
from app.schemas.auth import UserInDB
from app.schemas.development import (
    CodeReviewCreate,
    CodeReviewResponse,
    CodeReviewUpdate,
    IterationCreate,
    IterationResponse,
    IterationUpdate,
)

router = APIRouter(prefix="/development", tags=["开发管理"])


@router.get("/iterations", response_model=list[IterationResponse])
async def list_iterations(
    skip: int = 0,
    limit: int = 20,
    project_id: str | None = None,
    status_filter: str | None = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    query = {}
    if project_id:
        query["project_id"] = project_id
    if status_filter:
        query["status"] = status_filter

    cursor = db.iterations.find(query).skip(skip).limit(limit).sort("created_at", -1)
    iterations = await cursor.to_list(length=limit)

    result = []
    for i in iterations:
        i["_id"] = str(i["_id"])
        result.append(IterationResponse(**i))
    return result


@router.get("/iterations/{iteration_id}", response_model=IterationResponse)
async def get_iteration(
    iteration_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(iteration_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的迭代ID"
        )

    iteration = await db.iterations.find_one({"_id": ObjectId(iteration_id)})
    if not iteration:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="迭代不存在")

    iteration["_id"] = str(iteration["_id"])
    return IterationResponse(**iteration)


@router.post(
    "/iterations", response_model=IterationResponse, status_code=status.HTTP_201_CREATED
)
async def create_iteration(
    iteration_data: IterationCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    iteration_dict = iteration_data.model_dump()
    iteration_dict["created_at"] = datetime.datetime.now(datetime.UTC)
    iteration_dict["updated_at"] = datetime.datetime.now(datetime.UTC)

    result = await db.iterations.insert_one(iteration_dict)
    iteration_dict["_id"] = str(result.inserted_id)

    return IterationResponse(**iteration_dict)


@router.put("/iterations/{iteration_id}", response_model=IterationResponse)
async def update_iteration(
    iteration_id: str,
    iteration_data: IterationUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(iteration_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的迭代ID"
        )

    update_data = iteration_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="没有提供更新数据"
        )

    update_data["updated_at"] = datetime.datetime.now(datetime.UTC)

    result = await db.iterations.update_one(
        {"_id": ObjectId(iteration_id)},
        {"$set": update_data},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="迭代不存在")

    updated = await db.iterations.find_one({"_id": ObjectId(iteration_id)})
    updated["_id"] = str(updated["_id"])
    return IterationResponse(**updated)


@router.delete("/iterations/{iteration_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_iteration(
    iteration_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(iteration_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的迭代ID"
        )

    result = await db.iterations.delete_one({"_id": ObjectId(iteration_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="迭代不存在")


@router.get("/code-reviews", response_model=list[CodeReviewResponse])
async def list_code_reviews(
    skip: int = 0,
    limit: int = 20,
    project_id: str | None = None,
    status_filter: str | None = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    query = {}
    if project_id:
        query["project_id"] = project_id
    if status_filter:
        query["status"] = status_filter

    cursor = db.code_reviews.find(query).skip(skip).limit(limit).sort("created_at", -1)
    reviews = await cursor.to_list(length=limit)

    result = []
    for r in reviews:
        r["_id"] = str(r["_id"])
        result.append(CodeReviewResponse(**r))
    return result


@router.post(
    "/code-reviews",
    response_model=CodeReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_code_review(
    review_data: CodeReviewCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    review_dict = review_data.model_dump()
    review_dict["created_at"] = datetime.datetime.now(datetime.UTC)
    review_dict["updated_at"] = datetime.datetime.now(datetime.UTC)

    result = await db.code_reviews.insert_one(review_dict)
    review_dict["_id"] = str(result.inserted_id)

    return CodeReviewResponse(**review_dict)


@router.put("/code-reviews/{review_id}", response_model=CodeReviewResponse)
async def update_code_review(
    review_id: str,
    review_data: CodeReviewUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(review_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的评审ID"
        )

    update_data = review_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="没有提供更新数据"
        )

    update_data["updated_at"] = datetime.datetime.now(datetime.UTC)

    result = await db.code_reviews.update_one(
        {"_id": ObjectId(review_id)},
        {"$set": update_data},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="评审不存在")

    updated = await db.code_reviews.find_one({"_id": ObjectId(review_id)})
    updated["_id"] = str(updated["_id"])
    return CodeReviewResponse(**updated)
