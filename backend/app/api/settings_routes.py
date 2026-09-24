"""Settings API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from uuid import UUID
from pydantic import BaseModel

from database import get_db
from app.services.auth_service import AuthService
from app.services.organization_service import OrganizationService

router = APIRouter(prefix="/api/v1/settings", tags=["settings"])

class SettingsUpdate(BaseModel):
    ai_model: str = None
    ai_temperature: float = None
    ai_max_tokens: int = None
    stripe_public_key: str = None
    stripe_secret_key: str = None
    twilio_account_sid: str = None
    twilio_auth_token: str = None
    twilio_phone_number: str = None
    sendgrid_api_key: str = None
    business_hours: dict = None

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

@router.get("")
async def get_settings(
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get organization settings"""
    settings = OrganizationService.get_organization_settings(user.organization_id, db)
    if not settings:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Settings not found")

    return {
        "ai_model": settings.ai_model,
        "ai_temperature": settings.ai_temperature,
        "ai_max_tokens": settings.ai_max_tokens,
        "stripe_enabled": bool(settings.stripe_public_key),
        "twilio_enabled": bool(settings.twilio_account_sid),
        "sendgrid_enabled": bool(settings.sendgrid_api_key),
        "business_hours": settings.business_hours,
        "timezone": settings.organization.timezone,
    }

@router.put("")
async def update_settings(
    settings_data: SettingsUpdate,
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update organization settings"""
    settings = OrganizationService.get_organization_settings(user.organization_id, db)
    if not settings:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Settings not found")

    update_data = settings_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(settings, key, value)

    db.add(settings)
    db.commit()
    db.refresh(settings)

    return {
        "message": "Settings updated successfully",
        "ai_model": settings.ai_model,
        "ai_temperature": settings.ai_temperature,
        "ai_max_tokens": settings.ai_max_tokens
    }
