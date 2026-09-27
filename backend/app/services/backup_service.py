"""Backup management service"""

from sqlalchemy.orm import Session
from uuid import UUID
from app.models.features import BackupJob
from datetime import datetime

class BackupService:
    @staticmethod
    def create_backup(organization_id: UUID, db: Session) -> BackupJob:
        backup = BackupJob(
            organization_id=organization_id,
            status="pending",
            started_at=datetime.utcnow(),
        )
        db.add(backup)
        db.commit()
        return backup

    @staticmethod
    def get_backup(backup_id: UUID, db: Session) -> BackupJob:
        return db.query(BackupJob).filter(BackupJob.id == backup_id).first()

    @staticmethod
    def list_organization_backups(org_id: UUID, db: Session, skip: int = 0,
                                 limit: int = 50) -> tuple:
        query = db.query(BackupJob).filter(BackupJob.organization_id == org_id)
        total = query.count()
        backups = query.order_by(BackupJob.created_at.desc()).offset(skip).limit(limit).all()
        return backups, total

    @staticmethod
    def update_backup_status(backup_id: UUID, status: str, db: Session) -> BackupJob:
        backup = db.query(BackupJob).filter(BackupJob.id == backup_id).first()
        if backup:
            backup.status = status
            if status == "completed":
                backup.completed_at = datetime.utcnow()
            db.commit()
        return backup

    @staticmethod
    def set_backup_file(backup_id: UUID, file_url: str, file_size: int, record_count: int,
                       db: Session) -> BackupJob:
        backup = db.query(BackupJob).filter(BackupJob.id == backup_id).first()
        if backup:
            backup.backup_url = file_url
            backup.file_size = file_size
            backup.record_count = record_count
            backup.status = "completed"
            backup.completed_at = datetime.utcnow()
            db.commit()
        return backup

    @staticmethod
    def delete_backup(backup_id: UUID, db: Session) -> bool:
        backup = db.query(BackupJob).filter(BackupJob.id == backup_id).first()
        if backup:
            db.delete(backup)
            db.commit()
            return True
        return False

    @staticmethod
    def get_backup_summary(org_id: UUID, db: Session) -> dict:
        backups = db.query(BackupJob).filter(BackupJob.organization_id == org_id).all()

        completed = [b for b in backups if b.status == "completed"]
        total_size = sum(b.file_size for b in completed if b.file_size)
        total_records = sum(b.record_count for b in completed if b.record_count)

        return {
            "total": len(backups),
            "completed": len(completed),
            "pending": len([b for b in backups if b.status == "pending"]),
            "failed": len([b for b in backups if b.status == "failed"]),
            "total_size_bytes": total_size,
            "total_size_mb": round(total_size / 1024 / 1024, 2),
            "total_records": total_records,
        }

    @staticmethod
    def cleanup_old_backups(org_id: UUID, keep_count: int = 10, db: Session) -> int:
        backups = db.query(BackupJob).filter(
            BackupJob.organization_id == org_id,
            BackupJob.status == "completed"
        ).order_by(BackupJob.created_at.desc()).all()

        if len(backups) > keep_count:
            to_delete = backups[keep_count:]
            count = len(to_delete)
            for backup in to_delete:
                db.delete(backup)
            db.commit()
            return count
        return 0
