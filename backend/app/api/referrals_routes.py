"""Referral program API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db
from app.models.advanced import Referral
from app.models.user import User
from app.services.auth_service import AuthService
from app.middleware.auth import get_current_user
from app.services.user_service import UserService

router = APIRouter(prefix="/api/v1/referrals", tags=["referrals"])

@router.get("")
async def list_referrals(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: str = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Referral).filter(Referral.organization_id == current_user.organization_id)

    if status:
        query = query.filter(Referral.status == status)

    total = query.count()
    referrals = query.offset(skip).limit(limit).all()

    return {
        "data": [
            {
                "id": str(r.id),
                "referred_email": r.referred_email,
                "status": r.status,
                "reward_value": r.reward_value,
            }
            for r in referrals
        ],
        "total": total,
    }

@router.post("")
async def create_referral(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    referral = Referral(
        organization_id=current_user.organization_id,
        referrer_id=body.get("referrer_id"),
        referred_email=body.get("referred_email"),
        referred_name=body.get("referred_name"),
        status="pending",
        reward_value=body.get("reward_value", 0.0),
    )
    db.add(referral)
    db.commit()
    db.refresh(referral)

    return {"id": str(referral.id)}

@router.get("/{referral_id}")
async def get_referral(
    referral_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    referral = db.query(Referral).filter(
        Referral.id == referral_id,
        Referral.organization_id == current_user.organization_id
    ).first()

    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")

    return {
        "id": str(referral.id),
        "referred_email": referral.referred_email,
        "status": referral.status,
        "reward_value": referral.reward_value,
    }

@router.put("/{referral_id}")
async def update_referral(
    referral_id: UUID,
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    referral = db.query(Referral).filter(
        Referral.id == referral_id,
        Referral.organization_id == current_user.organization_id
    ).first()

    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")

    for key, value in body.items():
        if hasattr(referral, key):
            setattr(referral, key, value)

    db.commit()
    return {"id": str(referral.id)}

@router.get("/stats")
async def referral_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    referrals = db.query(Referral).filter(
        Referral.organization_id == current_user.organization_id
    ).all()

    total = len(referrals)
    pending = len([r for r in referrals if r.status == "pending"])
    completed = len([r for r in referrals if r.status == "completed"])
    total_rewards = sum(r.reward_value for r in referrals if r.status == "completed")

    return {
        "total": total,
        "pending": pending,
        "completed": completed,
        "total_rewards_paid": total_rewards,
    }
