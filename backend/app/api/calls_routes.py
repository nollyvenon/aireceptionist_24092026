"""Call logs and voice API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from database import get_db
from app.models.communication import Call, CallStatus
from app.models.user import User
from app.services.auth_service import AuthService
from app.services.user_service import UserService

router = APIRouter(prefix="/api/v1/calls", tags=["calls"])

def get_current_user(token: str = Query(...), db: Session = Depends(get_db)) -> User:
    token_data = AuthService.verify_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = UserService.get_user(token_data.user_id, db)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.get("/logs")
async def get_call_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Call).filter(Call.organization_id == current_user.organization_id)

    if status:
        query = query.filter(Call.status == CallStatus(status))

    total = query.count()
    calls = query.order_by(Call.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "data": [
            {
                "id": str(c.id),
                "from": c.from_number,
                "to": c.to_number,
                "type": c.call_type.value,
                "status": c.status.value,
                "duration": c.duration,
                "created_at": c.created_at.isoformat(),
            }
            for c in calls
        ],
        "total": total,
    }

@router.post("/logs")
async def create_call_log(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    call = Call(
        organization_id=current_user.organization_id,
        from_number=body.get("from_number"),
        to_number=body.get("to_number"),
        call_type=body.get("call_type"),
        status=CallStatus(body.get("status", "completed")),
        duration=body.get("duration", 0),
        recording_url=body.get("recording_url"),
        transcript=body.get("transcript"),
        notes=body.get("notes"),
    )
    db.add(call)
    db.commit()
    db.refresh(call)

    return {"id": str(call.id)}

@router.get("/summary")
async def get_call_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    calls = db.query(Call).filter(Call.organization_id == current_user.organization_id).all()

    total = len(calls)
    completed = len([c for c in calls if c.status == CallStatus.COMPLETED])
    failed = len([c for c in calls if c.status == CallStatus.FAILED])
    missed = len([c for c in calls if c.status == CallStatus.MISSED])
    avg_duration = sum(c.duration for c in calls) / len(calls) if calls else 0

    return {
        "total": total,
        "completed": completed,
        "failed": failed,
        "missed": missed,
        "avg_duration": avg_duration,
    }

@router.get("/{call_id}")
async def get_call(
    call_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    call = db.query(Call).filter(
        Call.id == call_id,
        Call.organization_id == current_user.organization_id
    ).first()

    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    return {
        "id": str(call.id),
        "from": call.from_number,
        "to": call.to_number,
        "duration": call.duration,
        "transcript": call.transcript,
        "recording_url": call.recording_url,
    }
