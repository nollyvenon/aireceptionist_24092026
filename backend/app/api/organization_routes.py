"""Organization API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db
from app.schemas.organization import OrganizationCreate, OrganizationUpdate, OrganizationResponse
from app.services.organization_service import OrganizationService
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/v1/organizations", tags=["organizations"])

def get_current_user_org(token: str = Query(...), db: Session = Depends(get_db)):
    """Get current user and their organization"""
    token_data = AuthService.verify_token(token)
    if not token_data:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    from app.services.user_service import UserService
    user = UserService.get_user(token_data.user_id, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user

@router.post("", response_model=OrganizationResponse)
async def create_organization(
    org_data: OrganizationCreate,
    db: Session = Depends(get_db)
):
    """Create new organization"""
    try:
        organization = OrganizationService.create_organization(org_data, db)
        return organization
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/{org_id}", response_model=OrganizationResponse)
async def get_organization(
    org_id: UUID,
    user = Depends(get_current_user_org),
    db: Session = Depends(get_db)
):
    """Get organization details"""
    if user.organization_id != org_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    organization = OrganizationService.get_organization(org_id, db)
    if not organization:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    return organization

@router.put("/{org_id}", response_model=OrganizationResponse)
async def update_organization(
    org_id: UUID,
    org_data: OrganizationUpdate,
    user = Depends(get_current_user_org),
    db: Session = Depends(get_db)
):
    """Update organization"""
    if user.organization_id != org_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    try:
        organization = OrganizationService.update_organization(org_id, org_data, db)
        return organization
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/{org_id}/settings")
async def get_organization_settings(
    org_id: UUID,
    user = Depends(get_current_user_org),
    db: Session = Depends(get_db)
):
    """Get organization settings"""
    if user.organization_id != org_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    settings = OrganizationService.get_organization_settings(org_id, db)
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
