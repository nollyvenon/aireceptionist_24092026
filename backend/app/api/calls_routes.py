"""Call logs and voice API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from database import get_db
from app.models.communication import Call, CallStatus, CallType
from app.models.user import User
from app.services.auth_service import AuthService
from app.middleware.auth import get_current_user
from app.services.user_service import UserService

router = APIRouter(prefix="/api/v1/communication/calls", tags=["calls"])

@router.get("")
async def list_calls(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    call_type: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Call).filter(Call.organization_id == current_user.organization_id)

    if call_type:
        try:
            query = query.filter(Call.call_type == CallType(call_type))
        except ValueError:
            pass
    if status:
        try:
            query = query.filter(Call.status == CallStatus(status))
        except ValueError:
            pass

    total = query.count()
    calls = query.order_by(Call.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "items": [
            {
                "id": str(c.id),
                "from_number": c.from_number,
                "to_number": c.to_number,
                "call_type": c.call_type.value,
                "status": c.status.value,
                "duration": c.duration,
                "recording_url": c.recording_url,
                "transcript": c.transcript,
                "notes": c.notes,
                "created_at": c.created_at.isoformat(),
            }
            for c in calls
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }

@router.post("")
async def create_call(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    call = Call(
        organization_id=current_user.organization_id,
        from_number=body.get("from_number"),
        to_number=body.get("to_number"),
        call_type=CallType(body.get("call_type", "inbound")),
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
        "from_number": call.from_number,
        "to_number": call.to_number,
        "call_type": call.call_type.value,
        "status": call.status.value,
        "duration": call.duration,
        "transcript": call.transcript,
        "recording_url": call.recording_url,
        "notes": call.notes,
        "created_at": call.created_at.isoformat(),
    }

@router.put("/{call_id}")
async def update_call(
    call_id: UUID,
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    call = db.query(Call).filter(
        Call.id == call_id,
        Call.organization_id == current_user.organization_id
    ).first()

    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    if "transcript" in body:
        call.transcript = body.get("transcript")
    if "notes" in body:
        call.notes = body.get("notes")
    if "status" in body:
        call.status = CallStatus(body.get("status"))

    db.commit()
    db.refresh(call)

    return {"id": str(call.id)}

@router.delete("/{call_id}")
async def delete_call(
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

    db.delete(call)
    db.commit()

    return {"status": "deleted"}
