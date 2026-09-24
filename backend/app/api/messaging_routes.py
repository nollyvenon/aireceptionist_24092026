"""Messaging routes for SMS, WhatsApp, Email, and other channels"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from database import get_db
from app.models.message import Message, MessageTemplate, Campaign
from app.schemas.message import MessageCreate, CampaignCreate, TemplateCreate
from app.services.sms_service import SMSService
from app.services.email_service import EmailService
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/v1/messaging", tags=["messaging"])
sms_service = SMSService()
email_service = EmailService()

# Send SMS
@router.post("/sms/send")
async def send_sms(
    message_data: MessageCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send SMS message"""
    try:
        result = await sms_service.send_sms(
            phone=message_data.recipient,
            message=message_data.body,
            organization_id=current_user.get("organization_id")
        )
        return {"status": "sent", "message_id": result.get("sid")}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Send WhatsApp
@router.post("/whatsapp/send")
async def send_whatsapp(
    message_data: MessageCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send WhatsApp message"""
    try:
        result = await sms_service.send_whatsapp(
            phone=message_data.recipient,
            message=message_data.body,
            organization_id=current_user.get("organization_id")
        )
        return {"status": "sent", "message_id": result.get("sid")}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Send Email
@router.post("/email/send")
async def send_email(
    message_data: MessageCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send email message"""
    try:
        result = await email_service.send_email(
            to=message_data.recipient,
            subject=message_data.subject,
            body=message_data.body,
            organization_id=current_user.get("organization_id")
        )
        return {"status": "sent", "message_id": result.get("id")}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Create campaign
@router.post("/campaigns", response_model=dict)
async def create_campaign(
    campaign_data: CampaignCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create messaging campaign"""
    campaign = Campaign(
        organization_id=current_user.get("organization_id"),
        name=campaign_data.name,
        description=campaign_data.description,
        campaign_type=campaign_data.campaign_type,
        channel=campaign_data.channel,
        target_segment=campaign_data.target_segment,
        message_template=campaign_data.message_template,
        scheduled_for=campaign_data.scheduled_for,
        status="draft"
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign

# List campaigns
@router.get("/campaigns")
async def list_campaigns(
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all campaigns"""
    return db.query(Campaign).filter(
        Campaign.organization_id == current_user.get("organization_id")
    ).offset(skip).limit(limit).all()

# Create message template
@router.post("/templates", response_model=dict)
async def create_template(
    template_data: TemplateCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create message template"""
    template = MessageTemplate(
        organization_id=current_user.get("organization_id"),
        name=template_data.name,
        channel=template_data.channel,
        subject=template_data.subject,
        body=template_data.body,
        variables=template_data.variables
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    return template

# List templates
@router.get("/templates")
async def list_templates(
    channel: str = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List message templates"""
    query = db.query(MessageTemplate).filter(
        MessageTemplate.organization_id == current_user.get("organization_id")
    )
    if channel:
        query = query.filter(MessageTemplate.channel == channel)
    return query.all()

# Get message history
@router.get("/history/{customer_id}")
async def get_message_history(
    customer_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get customer message history"""
    return db.query(Message).filter(
        Message.customer_id == customer_id,
        Message.organization_id == current_user.get("organization_id")
    ).order_by(Message.created_at.desc()).limit(100).all()

# Drip campaign
@router.post("/drips", response_model=dict)
async def create_drip_campaign(
    drip_data: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create drip email/SMS sequence"""
    try:
        drip = await sms_service.create_drip_sequence(
            organization_id=current_user.get("organization_id"),
            name=drip_data.get("name"),
            steps=drip_data.get("steps"),
            trigger=drip_data.get("trigger"),
            db=db
        )
        return drip
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Broadcast campaign
@router.post("/broadcast", response_model=dict)
async def send_broadcast(
    broadcast_data: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send broadcast message to segment"""
    try:
        result = await sms_service.send_broadcast(
            organization_id=current_user.get("organization_id"),
            segment=broadcast_data.get("segment"),
            channel=broadcast_data.get("channel"),
            message=broadcast_data.get("message"),
            db=db
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Conversation inbox
@router.get("/inbox")
async def get_inbox(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get conversation inbox"""
    return db.query(Message).filter(
        Message.organization_id == current_user.get("organization_id"),
        Message.direction == "inbound"
    ).order_by(Message.created_at.desc()).limit(50).all()
