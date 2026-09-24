"""Automation service"""

from sqlalchemy.orm import Session
from uuid import UUID
from app.models.automation import Automation

class AutomationService:
    @staticmethod
    def create_automation(org_id: UUID, data: dict, db: Session):
        automation = Automation(
            organization_id=org_id,
            **data
        )
        db.add(automation)
        db.commit()
        db.refresh(automation)
        return automation
    
    @staticmethod
    def list_automations(org_id: UUID, db: Session):
        return db.query(Automation).filter(Automation.organization_id == org_id).all()
