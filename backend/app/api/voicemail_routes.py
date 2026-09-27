"""Voicemail API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from database import get_db
from app.models.communication import Voicemail
from app.models.user import User
from app.services.auth_service import AuthService
from app.services.user_service import UserService

router = APIRouter(prefix="/api/v1/communication/voicemails", tags=["voicemail"])

def get_current_user(token: str = Query(...), db: Session = Depends(get_db)) -> User:
    token_data = AuthService.verify_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = UserService.get_user(token_data.user_id, db)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.get("")
async def list_voicemails(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    is_listened: Optional[bool] = None,
    caller_number: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Voicemail).filter(Voicemail.organization_id == current_user.organization_id)

    if is_listened is not None:
        query = query.filter(Voicemail.is_listened == is_listened)
    if caller_number:
        query = query.filter(Voicemail.caller_number == caller_number)

    total = query.count()
    voicemails = query.order_by(Voicemail.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "items": [
            {
                "id": str(v.id),
                "caller_number": v.caller_number,
                "duration": v.duration,
                "audio_url": v.audio_url,
                "transcript": v.transcript,
                "is_listened": v.is_listened,
                "created_at": v.created_at.isoformat(),
            }
            for v in voicemails
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }

@router.post("")
async def create_voicemail(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    voicemail = Voicemail(
        organization_id=current_user.organization_id,
        caller_number=body.get("caller_number"),
        duration=body.get("duration", 0),
        audio_url=body.get("audio_url"),
        transcript=body.get("transcript"),
    )
    db.add(voicemail)
    db.commit()
    db.refresh(voicemail)

    return {"id": str(voicemail.id)}

@router.get("/{voicemail_id}")
async def get_voicemail(
    voicemail_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    voicemail = db.query(Voicemail).filter(
        Voicemail.id == voicemail_id,
        Voicemail.organization_id == current_user.organization_id
    ).first()

    if not voicemail:
        raise HTTPException(status_code=404, detail="Voicemail not found")

    return {
        "id": str(voicemail.id),
        "caller_number": voicemail.caller_number,
        "duration": voicemail.duration,
        "audio_url": voicemail.audio_url,
        "transcript": voicemail.transcript,
        "is_listened": voicemail.is_listened,
        "created_at": voicemail.created_at.isoformat(),
    }

@router.put("/{voicemail_id}")
async def update_voicemail(
    voicemail_id: UUID,
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    voicemail = db.query(Voicemail).filter(
        Voicemail.id == voicemail_id,
        Voicemail.organization_id == current_user.organization_id
    ).first()

    if not voicemail:
        raise HTTPException(status_code=404, detail="Voicemail not found")

    if "is_listened" in body:
        voicemail.is_listened = body.get("is_listened")
    if "transcript" in body:
        voicemail.transcript = body.get("transcript")
    if "notes" in body:
        voicemail.notes = body.get("notes")

    db.commit()
    db.refresh(voicemail)

    return {"id": str(voicemail.id)}

@router.delete("/{voicemail_id}")
async def delete_voicemail(
    voicemail_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    voicemail = db.query(Voicemail).filter(
        Voicemail.id == voicemail_id,
        Voicemail.organization_id == current_user.organization_id
    ).first()

    if not voicemail:
        raise HTTPException(status_code=404, detail="Voicemail not found")

    db.delete(voicemail)
    db.commit()

    return {"status": "deleted"}
