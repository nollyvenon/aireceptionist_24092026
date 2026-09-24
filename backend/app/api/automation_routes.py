"""Automation/Workflow routes"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.database import get_db
from app.models.automation import Automation, AutomationTrigger, AutomationAction
from app.schemas.automation import AutomationCreate, AutomationUpdate
from app.services.automation_service import AutomationService
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/v1/automations", tags=["automations"])
automation_service = AutomationService()

# Create automation workflow
@router.post("/", response_model=dict)
async def create_automation(
    automation_data: AutomationCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create automation workflow"""
    try:
        automation = Automation(
            organization_id=current_user.get("organization_id"),
            name=automation_data.name,
            description=automation_data.description,
            trigger_type=automation_data.trigger_type,
            trigger_config=automation_data.trigger_config,
            conditions=automation_data.conditions,
            actions=automation_data.actions,
            is_active=True
        )
        db.add(automation)
        db.commit()
        db.refresh(automation)
        return automation
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# List automations
@router.get("/")
async def list_automations(
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all automations"""
    return db.query(Automation).filter(
        Automation.organization_id == current_user.get("organization_id")
    ).offset(skip).limit(limit).all()

# Get automation
@router.get("/{automation_id}")
async def get_automation(
    automation_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get automation details"""
    automation = db.query(Automation).filter(
        Automation.id == automation_id,
        Automation.organization_id == current_user.get("organization_id")
    ).first()
    if not automation:
        raise HTTPException(status_code=404, detail="Automation not found")
    return automation

# Update automation
@router.put("/{automation_id}")
async def update_automation(
    automation_id: UUID,
    automation_data: AutomationUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update automation"""
    automation = db.query(Automation).filter(
        Automation.id == automation_id,
        Automation.organization_id == current_user.get("organization_id")
    ).first()
    if not automation:
        raise HTTPException(status_code=404, detail="Automation not found")
    
    automation.name = automation_data.name or automation.name
    automation.description = automation_data.description or automation.description
    automation.actions = automation_data.actions or automation.actions
    db.commit()
    db.refresh(automation)
    return automation

# Delete automation
@router.delete("/{automation_id}")
async def delete_automation(
    automation_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete automation"""
    automation = db.query(Automation).filter(
        Automation.id == automation_id,
        Automation.organization_id == current_user.get("organization_id")
    ).first()
    if not automation:
        raise HTTPException(status_code=404, detail="Automation not found")
    
    db.delete(automation)
    db.commit()
    return {"status": "deleted"}

# Toggle automation
@router.post("/{automation_id}/toggle")
async def toggle_automation(
    automation_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enable/disable automation"""
    automation = db.query(Automation).filter(
        Automation.id == automation_id,
        Automation.organization_id == current_user.get("organization_id")
    ).first()
    if not automation:
        raise HTTPException(status_code=404, detail="Automation not found")
    
    automation.is_active = not automation.is_active
    db.commit()
    db.refresh(automation)
    return {"is_active": automation.is_active}

# Trigger automation manually
@router.post("/{automation_id}/trigger")
async def trigger_automation_manual(
    automation_id: UUID,
    trigger_data: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Manually trigger automation"""
    try:
        automation = db.query(Automation).filter(
            Automation.id == automation_id,
            Automation.organization_id == current_user.get("organization_id")
        ).first()
        if not automation:
            raise HTTPException(status_code=404, detail="Automation not found")
        
        result = await automation_service.execute_automation(
            automation=automation,
            trigger_data=trigger_data,
            db=db
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Automation templates
@router.get("/templates/list")
async def get_automation_templates():
    """Get automation templates"""
    return [
        {
            "name": "Send reminder before appointment",
            "trigger": "appointment_24h_before",
            "actions": ["send_sms", "send_email"]
        },
        {
            "name": "Follow-up after appointment",
            "trigger": "appointment_completed",
            "actions": ["send_email", "request_review"]
        },
        {
            "name": "Upsell after payment",
            "trigger": "payment_received",
            "actions": ["send_email", "update_crm"]
        },
        {
            "name": "Cancel reminder for no-show",
            "trigger": "no_show",
            "actions": ["send_sms", "cancel_recurring"]
        }
    ]

# Test automation
@router.post("/{automation_id}/test")
async def test_automation(
    automation_id: UUID,
    test_data: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Test automation with sample data"""
    try:
        automation = db.query(Automation).filter(
            Automation.id == automation_id,
            Automation.organization_id == current_user.get("organization_id")
        ).first()
        if not automation:
            raise HTTPException(status_code=404, detail="Automation not found")
        
        result = await automation_service.test_automation(
            automation=automation,
            test_data=test_data
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
