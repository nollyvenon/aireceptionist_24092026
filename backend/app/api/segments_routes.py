"""Customer segments API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db
from app.models.advanced import CustomerSegment
from app.models.user import User
from app.services.auth_service import AuthService
from app.services.user_service import UserService

router = APIRouter(prefix="/api/v1/customer-segments", tags=["segments"])

def get_current_user(token: str = Query(...), db: Session = Depends(get_db)) -> User:
    token_data = AuthService.verify_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = UserService.get_user(token_data.user_id, db)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.get("")
async def list_segments(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(CustomerSegment).filter(
        CustomerSegment.organization_id == current_user.organization_id
    )
    total = query.count()
    segments = query.offset(skip).limit(limit).all()

    return {
        "data": [
            {
                "id": str(s.id),
                "name": s.name,
                "description": s.description,
                "member_count": s.member_count,
            }
            for s in segments
        ],
        "total": total,
    }

@router.post("")
async def create_segment(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    segment = CustomerSegment(
        organization_id=current_user.organization_id,
        name=body.get("name"),
        description=body.get("description"),
        criteria=body.get("criteria"),
        member_count=body.get("member_count", 0),
    )
    db.add(segment)
    db.commit()
    db.refresh(segment)

    return {"id": str(segment.id)}

@router.get("/{segment_id}")
async def get_segment(
    segment_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    segment = db.query(CustomerSegment).filter(
        CustomerSegment.id == segment_id,
        CustomerSegment.organization_id == current_user.organization_id
    ).first()

    if not segment:
        raise HTTPException(status_code=404, detail="Segment not found")

    return {
        "id": str(segment.id),
        "name": segment.name,
        "description": segment.description,
        "member_count": segment.member_count,
    }

@router.put("/{segment_id}")
async def update_segment(
    segment_id: UUID,
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    segment = db.query(CustomerSegment).filter(
        CustomerSegment.id == segment_id,
        CustomerSegment.organization_id == current_user.organization_id
    ).first()

    if not segment:
        raise HTTPException(status_code=404, detail="Segment not found")

    for key, value in body.items():
        if hasattr(segment, key):
            setattr(segment, key, value)

    db.commit()
    return {"id": str(segment.id)}

@router.delete("/{segment_id}")
async def delete_segment(
    segment_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    segment = db.query(CustomerSegment).filter(
        CustomerSegment.id == segment_id,
        CustomerSegment.organization_id == current_user.organization_id
    ).first()

    if not segment:
        raise HTTPException(status_code=404, detail="Segment not found")

    db.delete(segment)
    db.commit()

    return {"message": "Segment deleted"}
