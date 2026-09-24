"""AI Receptionist API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from database import get_db
from app.services.ai_service import AIReceptionistService
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])

def get_current_org(token: str = Query(...), db: Session = Depends(get_db)):
    """Get current organization"""
    token_data = AuthService.verify_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid token")

    from app.services.user_service import UserService
    user = UserService.get_user(token_data.user_id, db)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user

@router.post("/message")
async def process_message(
    customer_id: UUID,
    message: str = Query(...),
    conversation_history: List[dict] = [],
    user = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """Process customer message with AI"""
    try:
        ai_service = AIReceptionistService(user.organization_id, db)
        response = ai_service.process_customer_message(
            message,
            customer_id,
            conversation_history
        )
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/availability")
async def get_available_appointments(
    customer_id: UUID,
    user = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """Get available appointments for customer"""
    try:
        ai_service = AIReceptionistService(user.organization_id, db)
        appointments = ai_service.get_available_appointments(customer_id)
        return {"available_slots": appointments}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/voice/initiate")
async def initiate_voice_call(
    customer_phone: str = Query(...),
    user = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """Initiate voice call with AI"""
    # This would integrate with Twilio to make outbound calls
    return {
        "message": "Voice call initiated",
        "phone": customer_phone,
        "status": "connecting"
    }

@router.post("/chat/start")
async def start_chat(
    customer_id: UUID,
    user = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """Start chat session"""
    return {
        "session_id": str(customer_id),
        "status": "active",
        "message": "Hello! How can I help you today?"
    }

@router.get("/health")
async def ai_health(
    user = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """Check AI service health"""
    try:
        ai_service = AIReceptionistService(user.organization_id, db)
        if ai_service.client:
            return {"status": "healthy", "ai_enabled": True}
        else:
            return {"status": "healthy", "ai_enabled": False, "note": "AI not configured"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
