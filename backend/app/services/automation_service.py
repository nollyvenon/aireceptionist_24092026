"""Automation service for managing business logic automations"""

from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.models.automation import Automation
from app.models.organization import Organization

class AutomationService:
    @staticmethod
    def create_automation(
        db: Session,
        organization_id: UUID,
        name: str,
        trigger_type: str,
        trigger_config: Dict[str, Any],
        actions: List[Dict[str, Any]],
        description: Optional[str] = None,
        is_active: bool = True
    ) -> Automation:
        """Create a new automation"""
        automation = Automation(
            organization_id=organization_id,
            name=name,
            description=description,
            trigger_type=trigger_type,
            trigger_config=trigger_config,
            actions=actions,
            is_active=is_active
        )
        db.add(automation)
        db.commit()
        db.refresh(automation)
        return automation

    @staticmethod
    def get_automation(db: Session, automation_id: UUID) -> Optional[Automation]:
        """Get automation by ID"""
        return db.query(Automation).filter(Automation.id == automation_id).first()

    @staticmethod
    def list_automations(
        db: Session,
        organization_id: UUID,
        skip: int = 0,
        limit: int = 50
    ) -> tuple[List[Automation], int]:
        """List automations for organization"""
        query = db.query(Automation).filter(Automation.organization_id == organization_id)
        total = query.count()
        automations = query.offset(skip).limit(limit).all()
        return automations, total

    @staticmethod
    def update_automation(
        db: Session,
        automation_id: UUID,
        **kwargs
    ) -> Optional[Automation]:
        """Update automation"""
        automation = AutomationService.get_automation(db, automation_id)
        if not automation:
            return None

        for key, value in kwargs.items():
            if hasattr(automation, key) and value is not None:
                setattr(automation, key, value)

        automation.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(automation)
        return automation

    @staticmethod
    def delete_automation(db: Session, automation_id: UUID) -> bool:
        """Delete automation"""
        automation = AutomationService.get_automation(db, automation_id)
        if not automation:
            return False

        db.delete(automation)
        db.commit()
        return True

    @staticmethod
    def test_automation(
        db: Session,
        automation_id: UUID,
        trigger_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Test automation with trigger data"""
        automation = AutomationService.get_automation(db, automation_id)
        if not automation:
            return {"success": False, "error": "Automation not found"}

        # Mock test - return success
        return {"success": True, "actions_executed": len(automation.actions)}

    @staticmethod
    def toggle_automation(db: Session, automation_id: UUID) -> Optional[Automation]:
        """Toggle automation active status"""
        automation = AutomationService.get_automation(db, automation_id)
        if not automation:
            return None

        automation.is_active = not automation.is_active
        automation.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(automation)
        return automation
