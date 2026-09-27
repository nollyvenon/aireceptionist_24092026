"""Audit logging service"""

from sqlalchemy.orm import Session
from uuid import UUID
from app.models.audit import AuditLog, AuditAction
from datetime import datetime, timedelta

class AuditService:
    @staticmethod
    def log_action(data: dict, organization_id: UUID, db: Session) -> AuditLog:
        audit_log = AuditLog(
            organization_id=organization_id,
            user_id=data.get("user_id"),
            action=AuditAction(data.get("action")),
            resource_type=data.get("resource_type"),
            resource_id=data.get("resource_id"),
            details=data.get("details"),
            ip_address=data.get("ip_address"),
            user_agent=data.get("user_agent"),
        )
        db.add(audit_log)
        db.commit()
        return audit_log

    @staticmethod
    def get_audit_log(log_id: UUID, db: Session) -> AuditLog:
        return db.query(AuditLog).filter(AuditLog.id == log_id).first()

    @staticmethod
    def list_organization_logs(org_id: UUID, db: Session, skip: int = 0, limit: int = 50,
                              action: str = None, resource_type: str = None) -> tuple:
        query = db.query(AuditLog).filter(AuditLog.organization_id == org_id)

        if action:
            query = query.filter(AuditLog.action == AuditAction(action))
        if resource_type:
            query = query.filter(AuditLog.resource_type == resource_type)

        total = query.count()
        logs = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
        return logs, total

    @staticmethod
    def list_user_actions(org_id: UUID, user_id: UUID, db: Session, skip: int = 0,
                         limit: int = 50) -> tuple:
        query = db.query(AuditLog).filter(
            AuditLog.organization_id == org_id,
            AuditLog.user_id == user_id
        )
        total = query.count()
        logs = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
        return logs, total

    @staticmethod
    def list_resource_changes(org_id: UUID, resource_type: str, resource_id: UUID,
                             db: Session) -> list:
        return db.query(AuditLog).filter(
            AuditLog.organization_id == org_id,
            AuditLog.resource_type == resource_type,
            AuditLog.resource_id == resource_id
        ).order_by(AuditLog.created_at.desc()).all()

    @staticmethod
    def get_audit_summary(org_id: UUID, days: int = 30, db: Session) -> dict:
        start_date = datetime.utcnow() - timedelta(days=days)
        logs = db.query(AuditLog).filter(
            AuditLog.organization_id == org_id,
            AuditLog.created_at >= start_date
        ).all()

        summary = {
            "total_actions": len(logs),
            "by_action": {},
            "by_resource": {},
            "by_user": {},
        }

        for action in AuditAction:
            action_logs = [l for l in logs if l.action == action]
            if action_logs:
                summary["by_action"][action.value] = len(action_logs)

        for log in logs:
            if log.resource_type not in summary["by_resource"]:
                summary["by_resource"][log.resource_type] = 0
            summary["by_resource"][log.resource_type] += 1

            user_id = str(log.user_id) if log.user_id else "unknown"
            if user_id not in summary["by_user"]:
                summary["by_user"][user_id] = 0
            summary["by_user"][user_id] += 1

        return summary

    @staticmethod
    def delete_old_logs(org_id: UUID, days: int = 90, db: Session) -> int:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        query = db.query(AuditLog).filter(
            AuditLog.organization_id == org_id,
            AuditLog.created_at < cutoff_date
        )
        count = query.count()
        query.delete()
        db.commit()
        return count

    @staticmethod
    def search_logs(org_id: UUID, query_str: str, db: Session, skip: int = 0,
                   limit: int = 50) -> tuple:
        # Search in details JSON
        from sqlalchemy import and_, or_
        query = db.query(AuditLog).filter(
            AuditLog.organization_id == org_id
        )

        total = query.count()
        logs = query.offset(skip).limit(limit).all()

        # Filter in-memory for simplicity
        filtered = [l for l in logs if query_str.lower() in str(l.details).lower()]
        return filtered, len(filtered)
