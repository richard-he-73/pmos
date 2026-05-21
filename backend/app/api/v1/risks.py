import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.dependencies import get_current_user
from app.schemas.auth import UserInDB
from app.schemas.risk import RiskCreate, RiskResponse, RiskUpdate

router = APIRouter(prefix="/risks", tags=["风险管理"])


@router.get("", response_model=list[RiskResponse])
async def list_risks(
    skip: int = 0,
    limit: int = 20,
    project_id: str | None = None,
    status_filter: str | None = None,
    category: str | None = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    query = {}
    if project_id:
        query["project_id"] = project_id
    if status_filter:
        query["status"] = status_filter
    if category:
        query["category"] = category

    cursor = db.risks.find(query).skip(skip).limit(limit).sort("created_at", -1)
    risks = await cursor.to_list(length=limit)

    result = []
    for r in risks:
        r["_id"] = str(r["_id"])
        result.append(RiskResponse(**r))
    return result


@router.get("/{risk_id}", response_model=RiskResponse)
async def get_risk(
    risk_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(risk_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的风险ID"
        )

    risk = await db.risks.find_one({"_id": ObjectId(risk_id)})
    if not risk:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="风险不存在")

    risk["_id"] = str(risk["_id"])
    return RiskResponse(**risk)


@router.post("", response_model=RiskResponse, status_code=status.HTTP_201_CREATED)
async def create_risk(
    risk_data: RiskCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    risk_dict = risk_data.model_dump()
    risk_dict["created_at"] = datetime.datetime.now(datetime.UTC)
    risk_dict["updated_at"] = datetime.datetime.now(datetime.UTC)

    severity_map = {"low": 1, "medium": 2, "high": 3}
    prob_score = severity_map.get(risk_dict.get("probability", "medium"), 2)
    impact_score = severity_map.get(risk_dict.get("impact", "medium"), 2)
    risk_dict["severity"] = min(prob_score * impact_score, 10)

    result = await db.risks.insert_one(risk_dict)
    risk_dict["_id"] = str(result.inserted_id)

    return RiskResponse(**risk_dict)


@router.put("/{risk_id}", response_model=RiskResponse)
async def update_risk(
    risk_id: str,
    risk_data: RiskUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(risk_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的风险ID"
        )

    update_data = risk_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="没有提供更新数据"
        )

    if "probability" in update_data or "impact" in update_data:
        risk = await db.risks.find_one({"_id": ObjectId(risk_id)})
        if risk:
            prob = update_data.get("probability", risk.get("probability", "medium"))
            impact = update_data.get("impact", risk.get("impact", "medium"))
            severity_map = {"low": 1, "medium": 2, "high": 3}
            prob_score = severity_map.get(prob, 2)
            impact_score = severity_map.get(impact, 2)
            update_data["severity"] = min(prob_score * impact_score, 10)

    if update_data.get("status") == "closed":
        update_data["closed_at"] = datetime.datetime.now(datetime.UTC)

    update_data["updated_at"] = datetime.datetime.now(datetime.UTC)

    result = await db.risks.update_one(
        {"_id": ObjectId(risk_id)},
        {"$set": update_data},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="风险不存在")

    updated = await db.risks.find_one({"_id": ObjectId(risk_id)})
    updated["_id"] = str(updated["_id"])
    return RiskResponse(**updated)


@router.delete("/{risk_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_risk(
    risk_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user),
):
    if not ObjectId.is_valid(risk_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的风险ID"
        )

    result = await db.risks.delete_one({"_id": ObjectId(risk_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="风险不存在")
