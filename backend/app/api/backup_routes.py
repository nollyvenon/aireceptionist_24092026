"""Backup management API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime

from database import get_db
from app.models.features import BackupJob
from app.models.user import User
from app.services.auth_service import AuthService
from app.middleware.auth import get_current_user
from app.services.user_service import UserService

router = APIRouter(prefix="/api/v1/backups", tags=["backups"])

@router.get("")
async def list_backups(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(BackupJob).filter(BackupJob.organization_id == current_user.organization_id)
    total = query.count()
    backups = query.order_by(BackupJob.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "data": [
            {
                "id": str(b.id),
                "status": b.status,
                "file_size": b.file_size,
                "record_count": b.record_count,
                "created_at": b.created_at.isoformat(),
                "completed_at": b.completed_at.isoformat() if b.completed_at else None,
            }
            for b in backups
        ],
        "total": total,
    }

@router.post("")
async def create_backup(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    backup = BackupJob(
        organization_id=current_user.organization_id,
        status="pending",
        started_at=datetime.utcnow(),
    )
    db.add(backup)
    db.commit()
    db.refresh(backup)

    return {
        "id": str(backup.id),
        "status": "pending",
        "message": "Backup job created",
    }

@router.get("/{backup_id}")
async def get_backup(
    backup_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    backup = db.query(BackupJob).filter(
        BackupJob.id == backup_id,
        BackupJob.organization_id == current_user.organization_id
    ).first()

    if not backup:
        raise HTTPException(status_code=404, detail="Backup not found")

    return {
        "id": str(backup.id),
        "status": backup.status,
        "file_size": backup.file_size,
        "record_count": backup.record_count,
        "backup_url": backup.backup_url,
        "created_at": backup.created_at.isoformat(),
    }

@router.post("/{backup_id}/download")
async def download_backup(
    backup_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    backup = db.query(BackupJob).filter(
        BackupJob.id == backup_id,
        BackupJob.organization_id == current_user.organization_id
    ).first()

    if not backup:
        raise HTTPException(status_code=404, detail="Backup not found")

    if not backup.backup_url:
        raise HTTPException(status_code=400, detail="Backup not ready for download")

    return {"download_url": backup.backup_url}

@router.post("/{backup_id}/restore")
async def restore_backup(
    backup_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    backup = db.query(BackupJob).filter(
        BackupJob.id == backup_id,
        BackupJob.organization_id == current_user.organization_id
    ).first()

    if not backup:
        raise HTTPException(status_code=404, detail="Backup not found")

    return {
        "message": "Restore initiated",
        "backup_id": str(backup_id),
        "status": "processing",
    }

@router.delete("/{backup_id}")
async def delete_backup(
    backup_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    backup = db.query(BackupJob).filter(
        BackupJob.id == backup_id,
        BackupJob.organization_id == current_user.organization_id
    ).first()

    if not backup:
        raise HTTPException(status_code=404, detail="Backup not found")

    db.delete(backup)
    db.commit()

    return {"message": "Backup deleted"}
