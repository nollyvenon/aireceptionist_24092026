"""Audit logging API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from database import get_db
from app.models.audit import AuditLog, AuditAction
from app.models.user import User
from app.services.auth_service import AuthService
from app.middleware.auth import get_current_user
from app.services.user_service import UserService

router = APIRouter(prefix="/api/v1/audit-logs", tags=["audit"])

@router.get("")
async def list_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog).filter(AuditLog.organization_id == current_user.organization_id)

    if action:
        query = query.filter(AuditLog.action == AuditAction(action))
    if resource_type:
        query = query.filter(AuditLog.resource_type == resource_type)

    total = query.count()
    logs = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "data": [
            {
                "id": str(log.id),
                "action": log.action.value,
                "resource_type": log.resource_type,
                "resource_id": str(log.resource_id) if log.resource_id else None,
                "created_at": log.created_at.isoformat(),
            }
            for log in logs
        ],
        "total": total,
    }

@router.post("")
async def create_audit_log(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    audit_log = AuditLog(
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        action=AuditAction(body.get("action")),
        resource_type=body.get("resource_type"),
        resource_id=body.get("resource_id"),
        details=body.get("details"),
        ip_address=body.get("ip_address"),
    )
    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)

    return {"id": str(audit_log.id)}

@router.get("/{log_id}")
async def get_audit_log(
    log_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log = db.query(AuditLog).filter(
        AuditLog.id == log_id,
        AuditLog.organization_id == current_user.organization_id
    ).first()

    if not log:
        raise HTTPException(status_code=404, detail="Audit log not found")

    return {
        "id": str(log.id),
        "action": log.action.value,
        "resource_type": log.resource_type,
        "resource_id": str(log.resource_id) if log.resource_id else None,
        "details": log.details,
        "created_at": log.created_at.isoformat(),
    }

@router.post("/export")
async def export_audit_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).filter(
        AuditLog.organization_id == current_user.organization_id
    ).all()

    return {
        "message": "Audit logs export initiated",
        "count": len(logs),
        "download_url": f"/api/v1/audit-logs/exports/{current_user.organization_id}",
    }
