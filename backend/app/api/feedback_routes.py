"""Feedback and survey API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db
from app.models.advanced import Feedback
from app.models.user import User
from app.services.auth_service import AuthService
from app.middleware.auth import get_current_user
from app.services.user_service import UserService

router = APIRouter(prefix="/api/v1/feedback", tags=["feedback"])

@router.get("")
async def list_feedback(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: str = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Feedback).filter(Feedback.organization_id == current_user.organization_id)

    if status:
        query = query.filter(Feedback.status == status)

    total = query.count()
    feedback = query.order_by(Feedback.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "data": [
            {
                "id": str(f.id),
                "rating": f.rating,
                "subject": f.subject,
                "status": f.status,
                "created_at": f.created_at.isoformat(),
            }
            for f in feedback
        ],
        "total": total,
    }

@router.post("")
async def create_feedback(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    feedback = Feedback(
        organization_id=current_user.organization_id,
        customer_id=body.get("customer_id"),
        rating=body.get("rating"),
        subject=body.get("subject"),
        message=body.get("message"),
        status="open",
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return {"id": str(feedback.id)}

@router.get("/{feedback_id}")
async def get_feedback(
    feedback_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    feedback = db.query(Feedback).filter(
        Feedback.id == feedback_id,
        Feedback.organization_id == current_user.organization_id
    ).first()

    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")

    return {
        "id": str(feedback.id),
        "rating": feedback.rating,
        "subject": feedback.subject,
        "message": feedback.message,
        "status": feedback.status,
    }

@router.put("/{feedback_id}")
async def update_feedback(
    feedback_id: UUID,
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    feedback = db.query(Feedback).filter(
        Feedback.id == feedback_id,
        Feedback.organization_id == current_user.organization_id
    ).first()

    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")

    for key, value in body.items():
        if hasattr(feedback, key):
            setattr(feedback, key, value)

    db.commit()
    return {"id": str(feedback.id)}

@router.get("/summary")
async def feedback_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    feedback = db.query(Feedback).filter(
        Feedback.organization_id == current_user.organization_id
    ).all()

    total = len(feedback)
    avg_rating = sum(f.rating for f in feedback) / total if total > 0 else 0
    open_count = len([f for f in feedback if f.status == "open"])

    return {
        "total": total,
        "average_rating": round(avg_rating, 2),
        "open": open_count,
    }
