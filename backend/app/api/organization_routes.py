"""Organization API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db
from app.schemas.organization import OrganizationCreate, OrganizationUpdate, OrganizationResponse
from app.services.organization_service import OrganizationService
from app.services.auth_service import AuthService
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/v1/organizations", tags=["organizations"])

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
    user = Depends(get_current_user),
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
    user = Depends(get_current_user),
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
    user = Depends(get_current_user),
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

@router.put("/{org_id}/settings")
async def update_organization_settings(
    org_id: UUID,
    settings_data: dict,
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update organization settings"""
    if user.organization_id != org_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    try:
        settings = OrganizationService.update_organization_settings(org_id, settings_data, db)
        return {"message": "Settings updated"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/{org_id}/members")
async def get_organization_members(
    org_id: UUID,
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get organization members"""
    if user.organization_id != org_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    members = OrganizationService.get_organization_members(org_id, db)
    return {"members": members}

@router.post("/{org_id}/invite")
async def invite_member(
    org_id: UUID,
    invite_data: dict,
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Invite a new member"""
    if user.organization_id != org_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    try:
        result = OrganizationService.invite_member(org_id, invite_data.get("email"), invite_data.get("role"), db)
        return {"message": "Invitation sent"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/{org_id}/members/{member_id}")
async def remove_member(
    org_id: UUID,
    member_id: UUID,
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a member from organization"""
    if user.organization_id != org_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    try:
        OrganizationService.remove_member(org_id, member_id, db)
        return {"message": "Member removed"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
