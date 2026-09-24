"""Automation API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from uuid import UUID
from pydantic import BaseModel
from typing import List, Optional

from database import get_db
from app.services.auth_service import AuthService
from app.models.automation import Automation

router = APIRouter(prefix="/api/v1/automations", tags=["automations"])

class AutomationCreate(BaseModel):
    name: str
    description: Optional[str] = None
    trigger: str
    trigger_conditions: dict
    actions: List[dict]
    is_active: bool = True

class AutomationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    trigger_conditions: Optional[dict] = None
    actions: Optional[List[dict]] = None
    is_active: Optional[bool] = None

class AutomationResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    trigger: str
    is_active: bool
    execution_count: int
    success_count: int
    failure_count: int
    created_at: str

    class Config:
        from_attributes = True

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

@router.post("", response_model=AutomationResponse)
async def create_automation(
    auto_data: AutomationCreate,
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new automation"""
    automation = Automation(
        organization_id=user.organization_id,
        name=auto_data.name,
        description=auto_data.description,
        trigger=auto_data.trigger,
        trigger_conditions=auto_data.trigger_conditions,
        actions=auto_data.actions,
        is_active=auto_data.is_active
    )
    db.add(automation)
    db.commit()
    db.refresh(automation)
    return automation

@router.get("", response_model=dict)
async def list_automations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List automations"""
    query = db.query(Automation).filter(Automation.organization_id == user.organization_id)
    total = query.count()
    automations = query.offset(skip).limit(limit).all()

    return {
        "items": automations,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/{automation_id}", response_model=AutomationResponse)
async def get_automation(
    automation_id: UUID,
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get automation by ID"""
    automation = db.query(Automation).filter(
        Automation.id == automation_id,
        Automation.organization_id == user.organization_id
    ).first()

    if not automation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Automation not found")

    return automation

@router.put("/{automation_id}", response_model=AutomationResponse)
async def update_automation(
    automation_id: UUID,
    auto_data: AutomationUpdate,
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update automation"""
    automation = db.query(Automation).filter(
        Automation.id == automation_id,
        Automation.organization_id == user.organization_id
    ).first()

    if not automation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Automation not found")

    update_data = auto_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(automation, key, value)

    db.add(automation)
    db.commit()
    db.refresh(automation)
    return automation

@router.delete("/{automation_id}")
async def delete_automation(
    automation_id: UUID,
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete automation"""
    automation = db.query(Automation).filter(
        Automation.id == automation_id,
        Automation.organization_id == user.organization_id
    ).first()

    if not automation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Automation not found")

    db.delete(automation)
    db.commit()
    return {"message": "Automation deleted successfully"}

@router.post("/{automation_id}/toggle")
async def toggle_automation(
    automation_id: UUID,
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle automation active status"""
    automation = db.query(Automation).filter(
        Automation.id == automation_id,
        Automation.organization_id == user.organization_id
    ).first()

    if not automation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Automation not found")

    automation.is_active = not automation.is_active
    db.add(automation)
    db.commit()
    db.refresh(automation)

    return {"message": f"Automation {'activated' if automation.is_active else 'deactivated'}", "automation": automation}
