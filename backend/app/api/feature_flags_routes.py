"""Feature flags API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db
from app.models.features import FeatureFlag
from app.models.user import User
from app.services.auth_service import AuthService
from app.services.user_service import UserService

router = APIRouter(prefix="/api/v1/feature-flags", tags=["feature-flags"])

def get_current_user(token: str = Query(...), db: Session = Depends(get_db)) -> User:
    token_data = AuthService.verify_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = UserService.get_user(token_data.user_id, db)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.get("")
async def list_feature_flags(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    flags = db.query(FeatureFlag).offset(skip).limit(limit).all()
    total = db.query(FeatureFlag).count()

    return {
        "data": [
            {
                "id": str(f.id),
                "name": f.name,
                "key": f.key,
                "enabled": f.enabled,
                "rollout_percentage": f.rollout_percentage,
            }
            for f in flags
        ],
        "total": total,
    }

@router.post("")
async def create_feature_flag(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    flag = FeatureFlag(
        name=body.get("name"),
        key=body.get("key"),
        description=body.get("description"),
        enabled=body.get("enabled", False),
        rollout_percentage=body.get("rollout_percentage", 0.0),
    )
    db.add(flag)
    db.commit()
    db.refresh(flag)

    return {"id": str(flag.id), "key": flag.key}

@router.get("/{flag_id}")
async def get_feature_flag(
    flag_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    flag = db.query(FeatureFlag).filter(FeatureFlag.id == flag_id).first()

    if not flag:
        raise HTTPException(status_code=404, detail="Feature flag not found")

    return {
        "id": str(flag.id),
        "name": flag.name,
        "key": flag.key,
        "description": flag.description,
        "enabled": flag.enabled,
        "rollout_percentage": flag.rollout_percentage,
    }

@router.patch("/{flag_id}")
async def update_feature_flag(
    flag_id: UUID,
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    flag = db.query(FeatureFlag).filter(FeatureFlag.id == flag_id).first()

    if not flag:
        raise HTTPException(status_code=404, detail="Feature flag not found")

    for key, value in body.items():
        if hasattr(flag, key):
            setattr(flag, key, value)

    db.commit()
    return {"id": str(flag.id)}

@router.delete("/{flag_id}")
async def delete_feature_flag(
    flag_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    flag = db.query(FeatureFlag).filter(FeatureFlag.id == flag_id).first()

    if not flag:
        raise HTTPException(status_code=404, detail="Feature flag not found")

    db.delete(flag)
    db.commit()

    return {"message": "Feature flag deleted"}
