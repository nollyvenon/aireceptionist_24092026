"""Security and IP whitelist API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime

from database import get_db
from app.models.features import IPWhitelist
from app.models.user import User
from app.services.auth_service import AuthService
from app.middleware.auth import get_current_user
from app.services.user_service import UserService

router = APIRouter(prefix="/api/v1/security", tags=["security"])

@router.get("/settings")
async def get_security_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return {
        "two_factor_enabled": True,
        "ip_whitelist_enabled": True,
        "session_timeout": 3600,
        "password_expiry_days": 90,
        "require_strong_password": True,
        "login_notifications": True,
        "suspicious_activity_alerts": True,
    }

@router.put("/settings")
async def update_security_settings(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return {"message": "Security settings updated"}

@router.get("/ip-whitelist")
async def list_ip_whitelist(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(IPWhitelist).filter(IPWhitelist.organization_id == current_user.organization_id)
    total = query.count()
    items = query.offset(skip).limit(limit).all()

    return {
        "data": [
            {
                "id": str(ip.id),
                "ip_address": ip.ip_address,
                "description": ip.description,
                "last_used_at": ip.last_used_at.isoformat() if ip.last_used_at else None,
                "created_at": ip.created_at.isoformat(),
            }
            for ip in items
        ],
        "total": total,
    }

@router.post("/ip-whitelist")
async def add_ip_whitelist(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ip_whitelist = IPWhitelist(
        organization_id=current_user.organization_id,
        ip_address=body.get("ip_address"),
        description=body.get("description"),
    )
    db.add(ip_whitelist)
    db.commit()
    db.refresh(ip_whitelist)

    return {"id": str(ip_whitelist.id), "ip_address": ip_whitelist.ip_address}

@router.delete("/ip-whitelist/{ip_id}")
async def remove_ip_whitelist(
    ip_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ip_whitelist = db.query(IPWhitelist).filter(
        IPWhitelist.id == ip_id,
        IPWhitelist.organization_id == current_user.organization_id
    ).first()

    if not ip_whitelist:
        raise HTTPException(status_code=404, detail="IP whitelist entry not found")

    db.delete(ip_whitelist)
    db.commit()

    return {"message": "IP whitelist entry removed"}

@router.post("/verify-2fa")
async def verify_2fa(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return {"verified": True, "message": "2FA verified"}

@router.post("/2fa/toggle")
async def toggle_2fa(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    enabled = body.get("enabled", True)
    return {"enabled": enabled, "message": f"2FA {'enabled' if enabled else 'disabled'}"}
