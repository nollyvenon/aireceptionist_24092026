"""Activity API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from database import get_db
from app.services.auth_service import AuthService
from app.models.activity import Activity

router = APIRouter(prefix="/api/v1/activities", tags=["activities"])

def get_current_user(token: str = Query(...), db: Session = Depends(get_db)):
    """Get current user"""
    token_data = AuthService.verify_token(token)
    if not token_data:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    from app.services.user_service import UserService
    user = UserService.get_user(token_data.user_id, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user

@router.get("")
async def list_activities(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    customer_id: Optional[UUID] = Query(None),
    activity_type: Optional[str] = Query(None),
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List activities"""
    query = db.query(Activity).filter(Activity.organization_id == user.organization_id)

    if customer_id:
        query = query.filter(Activity.customer_id == customer_id)

    if activity_type:
        query = query.filter(Activity.activity_type == activity_type)

    total = query.count()
    activities = query.order_by(Activity.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "items": activities,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/{activity_id}")
async def get_activity(
    activity_id: UUID,
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get activity by ID"""
    activity = db.query(Activity).filter(
        Activity.id == activity_id,
        Activity.organization_id == user.organization_id
    ).first()

    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")

    return activity

@router.get("/customer/{customer_id}")
async def get_customer_activities(
    customer_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get activities for a customer"""
    query = db.query(Activity).filter(
        Activity.organization_id == user.organization_id,
        Activity.customer_id == customer_id
    )

    total = query.count()
    activities = query.order_by(Activity.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "customer_id": customer_id,
        "items": activities,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.delete("/{activity_id}")
async def delete_activity(
    activity_id: UUID,
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete activity"""
    activity = db.query(Activity).filter(
        Activity.id == activity_id,
        Activity.organization_id == user.organization_id
    ).first()

    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")

    db.delete(activity)
    db.commit()
    return {"message": "Activity deleted successfully"}
