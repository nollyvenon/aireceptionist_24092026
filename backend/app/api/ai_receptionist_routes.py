"""AI Receptionist routes for voice, chat, and booking"""

from fastapi import APIRouter, Depends, HTTPException, WebSocket
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime
from app.database import get_db
from app.models.ai_conversation import AIConversation, ConversationMessage
from app.services.ai_service import AIService
from app.middleware.auth import get_current_user
import json

router = APIRouter(prefix="/api/v1/ai", tags=["ai-receptionist"])
ai_service = AIService()

# Chat endpoint
@router.post("/chat")
async def chat_with_ai(
    message: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Chat with AI receptionist"""
    try:
        response = await ai_service.process_message(
            organization_id=current_user.get("organization_id"),
            customer_id=current_user.get("customer_id"),
            message_text=message.get("text"),
            conversation_id=message.get("conversation_id"),
            context=message.get("context"),
            db=db
        )
        return {
            "response": response.get("text"),
            "intent": response.get("intent"),
            "confidence": response.get("confidence"),
            "actions": response.get("actions"),
            "conversation_id": response.get("conversation_id")
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Voice call endpoint
@router.post("/voice/call")
async def initiate_voice_call(
    call_data: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initiate voice call with AI"""
    try:
        call = await ai_service.initiate_voice_call(
            organization_id=current_user.get("organization_id"),
            phone_number=call_data.get("phone_number"),
            customer_name=call_data.get("customer_name"),
            db=db
        )
        return {
            "call_id": call.get("call_id"),
            "status": "ringing",
            "started_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Voice call webhook
@router.post("/voice/webhook")
async def voice_call_webhook(
    payload: dict,
    db: Session = Depends(get_db)
):
    """Handle voice call events (Twilio/Vonage webhook)"""
    try:
        await ai_service.handle_voice_webhook(payload, db=db)
        return {"status": "processed"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Get conversation history
@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get conversation history"""
    conversation = db.query(AIConversation).filter(
        AIConversation.id == conversation_id,
        AIConversation.organization_id == current_user.get("organization_id")
    ).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    messages = db.query(ConversationMessage).filter(
        ConversationMessage.conversation_id == conversation_id
    ).order_by(ConversationMessage.created_at).all()
    
    return {
        "conversation_id": conversation.id,
        "customer_id": conversation.customer_id,
        "started_at": conversation.started_at,
        "ended_at": conversation.ended_at,
        "messages": messages,
        "summary": conversation.summary,
        "sentiment": conversation.sentiment
    }

# Booking intent
@router.post("/booking")
async def process_booking_intent(
    booking_data: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Process booking intent from AI conversation"""
    try:
        booking = await ai_service.process_booking_intent(
            organization_id=current_user.get("organization_id"),
            customer_id=booking_data.get("customer_id"),
            customer_name=booking_data.get("customer_name"),
            customer_phone=booking_data.get("customer_phone"),
            customer_email=booking_data.get("customer_email"),
            appointment_type=booking_data.get("appointment_type"),
            preferred_date=booking_data.get("preferred_date"),
            preferred_time=booking_data.get("preferred_time"),
            db=db
        )
        return booking
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Reschedule via AI
@router.post("/reschedule")
async def process_reschedule(
    reschedule_data: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Process reschedule request from AI"""
    try:
        result = await ai_service.process_reschedule(
            organization_id=current_user.get("organization_id"),
            appointment_id=reschedule_data.get("appointment_id"),
            new_date=reschedule_data.get("new_date"),
            new_time=reschedule_data.get("new_time"),
            reason=reschedule_data.get("reason"),
            db=db
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Cancel via AI
@router.post("/cancel")
async def process_cancellation(
    cancel_data: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Process cancellation request from AI"""
    try:
        result = await ai_service.process_cancellation(
            organization_id=current_user.get("organization_id"),
            appointment_id=cancel_data.get("appointment_id"),
            reason=cancel_data.get("reason"),
            db=db
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Escalate to human
@router.post("/escalate")
async def escalate_to_human(
    escalate_data: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Escalate conversation to human agent"""
    try:
        result = await ai_service.escalate_to_human(
            organization_id=current_user.get("organization_id"),
            conversation_id=escalate_data.get("conversation_id"),
            reason=escalate_data.get("reason"),
            db=db
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Multi-language support
@router.post("/chat/{language}")
async def chat_multilingual(
    language: str,
    message: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Chat with AI in different language"""
    try:
        response = await ai_service.process_message(
            organization_id=current_user.get("organization_id"),
            customer_id=current_user.get("customer_id"),
            message_text=message.get("text"),
            language=language,
            db=db
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# AI health check
@router.get("/health")
async def ai_health_check():
    """Check AI service health"""
    return {
        "status": "healthy",
        "service": "AI Receptionist",
        "timestamp": datetime.utcnow().isoformat(),
        "providers": {
            "openai": "ready",
            "anthropic": "ready",
            "deepgram": "ready",
            "elevenlabs": "ready"
        }
    }

# Knowledge base
@router.post("/knowledge")
async def add_knowledge(
    knowledge_data: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add knowledge to AI knowledge base"""
    try:
        result = await ai_service.add_knowledge(
            organization_id=current_user.get("organization_id"),
            title=knowledge_data.get("title"),
            content=knowledge_data.get("content"),
            category=knowledge_data.get("category"),
            db=db
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Sentiment analysis
@router.post("/sentiment")
async def analyze_sentiment(
    text: dict,
    current_user: dict = Depends(get_current_user)
):
    """Analyze customer sentiment"""
    try:
        sentiment = await ai_service.analyze_sentiment(text.get("text"))
        return {
            "sentiment": sentiment.get("sentiment"),
            "score": sentiment.get("score"),
            "emotion": sentiment.get("emotion")
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Lead scoring
@router.post("/lead-score")
async def score_lead(
    lead_data: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Score lead based on conversation"""
    try:
        score = await ai_service.score_lead(
            organization_id=current_user.get("organization_id"),
            conversation_text=lead_data.get("conversation_text"),
            customer_data=lead_data.get("customer_data"),
            db=db
        )
        return {
            "lead_score": score.get("score"),
            "probability": score.get("probability"),
            "recommendations": score.get("recommendations")
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
