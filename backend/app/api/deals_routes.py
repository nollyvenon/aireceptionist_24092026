"""Deal management API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from database import get_db
from app.models.crm import Deal, DealStatus
from app.models.user import User
from app.services.auth_service import AuthService
from app.services.user_service import UserService

router = APIRouter(prefix="/api/v1/crm/deals", tags=["crm-deals"])

def get_current_user(token: str = Query(...), db: Session = Depends(get_db)) -> User:
    token_data = AuthService.verify_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = UserService.get_user(token_data.user_id, db)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.get("")
async def list_deals(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Deal).filter(Deal.organization_id == current_user.organization_id)

    if status:
        query = query.filter(Deal.status == DealStatus(status))

    total = query.count()
    deals = query.offset(skip).limit(limit).all()

    return {
        "data": [
            {
                "id": str(d.id),
                "name": d.name,
                "value": d.value,
                "status": d.status.value,
                "probability": d.probability,
            }
            for d in deals
        ],
        "total": total,
    }

@router.post("")
async def create_deal(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    deal = Deal(
        organization_id=current_user.organization_id,
        customer_id=body.get("customer_id"),
        name=body.get("name"),
        value=body.get("value", 0.0),
        status=DealStatus(body.get("status", "prospect")),
        assigned_to_id=body.get("assigned_to_id"),
        probability=body.get("probability", 0.0),
        notes=body.get("notes"),
    )
    db.add(deal)
    db.commit()
    db.refresh(deal)

    return {"id": str(deal.id), "name": deal.name}

@router.get("/{deal_id}")
async def get_deal(
    deal_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    deal = db.query(Deal).filter(
        Deal.id == deal_id,
        Deal.organization_id == current_user.organization_id
    ).first()

    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    return {
        "id": str(deal.id),
        "name": deal.name,
        "value": deal.value,
        "status": deal.status.value,
        "probability": deal.probability,
    }

@router.put("/{deal_id}")
async def update_deal(
    deal_id: UUID,
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    deal = db.query(Deal).filter(
        Deal.id == deal_id,
        Deal.organization_id == current_user.organization_id
    ).first()

    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    for key, value in body.items():
        if key == "status":
            setattr(deal, key, DealStatus(value))
        elif hasattr(deal, key):
            setattr(deal, key, value)

    db.commit()
    return {"id": str(deal.id)}

@router.delete("/{deal_id}")
async def delete_deal(
    deal_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    deal = db.query(Deal).filter(
        Deal.id == deal_id,
        Deal.organization_id == current_user.organization_id
    ).first()

    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    db.delete(deal)
    db.commit()
    return {"message": "Deal deleted"}

@router.post("/{deal_id}/mark-won")
async def mark_deal_won(
    deal_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    deal = db.query(Deal).filter(
        Deal.id == deal_id,
        Deal.organization_id == current_user.organization_id
    ).first()

    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    deal.status = DealStatus.CLOSED_WON
    db.commit()

    return {"message": "Deal marked as won"}
