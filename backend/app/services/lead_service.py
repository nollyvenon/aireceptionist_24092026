"""Lead management service"""

from sqlalchemy.orm import Session
from uuid import UUID
from app.models.crm import Lead, LeadStatus
from datetime import datetime

class LeadService:
    @staticmethod
    def create_lead(data: dict, organization_id: UUID, db: Session) -> Lead:
        lead = Lead(
            organization_id=organization_id,
            first_name=data.get("first_name"),
            last_name=data.get("last_name"),
            email=data.get("email"),
            phone=data.get("phone"),
            company=data.get("company"),
            title=data.get("title"),
            status=LeadStatus(data.get("status", "new")),
            lead_score=data.get("lead_score", 0.0),
            assigned_to_id=data.get("assigned_to_id"),
            notes=data.get("notes"),
            source=data.get("source"),
        )
        db.add(lead)
        db.commit()
        return lead

    @staticmethod
    def get_lead(lead_id: UUID, db: Session) -> Lead:
        return db.query(Lead).filter(Lead.id == lead_id).first()

    @staticmethod
    def update_lead(lead_id: UUID, data: dict, db: Session) -> Lead:
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if lead:
            for key, value in data.items():
                if key == "status":
                    setattr(lead, key, LeadStatus(value))
                elif hasattr(lead, key):
                    setattr(lead, key, value)
            db.commit()
        return lead

    @staticmethod
    def delete_lead(lead_id: UUID, db: Session) -> bool:
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if lead:
            db.delete(lead)
            db.commit()
            return True
        return False

    @staticmethod
    def list_organization_leads(org_id: UUID, db: Session, skip: int = 0, limit: int = 50,
                               status: str = None) -> tuple:
        query = db.query(Lead).filter(Lead.organization_id == org_id)
        if status:
            query = query.filter(Lead.status == LeadStatus(status))
        total = query.count()
        leads = query.offset(skip).limit(limit).all()
        return leads, total

    @staticmethod
    def search_leads(org_id: UUID, query_str: str, db: Session, skip: int = 0,
                    limit: int = 50) -> tuple:
        query = db.query(Lead).filter(
            Lead.organization_id == org_id,
            (Lead.first_name.ilike(f"%{query_str}%")) |
            (Lead.last_name.ilike(f"%{query_str}%")) |
            (Lead.email.ilike(f"%{query_str}%")) |
            (Lead.company.ilike(f"%{query_str}%"))
        )
        total = query.count()
        leads = query.offset(skip).limit(limit).all()
        return leads, total

    @staticmethod
    def calculate_lead_score(lead: Lead, db: Session) -> float:
        score = 0.0

        # Email engagement
        if lead.email:
            score += 10

        # Phone number
        if lead.phone:
            score += 10

        # Company information
        if lead.company:
            score += 15

        # Title level
        if lead.title:
            senior_titles = ["director", "manager", "ceo", "president", "vp", "executive"]
            if any(title in lead.title.lower() for title in senior_titles):
                score += 25
            else:
                score += 10

        # Lead status progression
        status_scores = {
            LeadStatus.NEW: 0,
            LeadStatus.CONTACTED: 20,
            LeadStatus.QUALIFIED: 50,
            LeadStatus.NEGOTIATION: 75,
            LeadStatus.CLOSED_WON: 100,
            LeadStatus.CLOSED_LOST: -50,
        }
        score += status_scores.get(lead.status, 0)

        return max(0, min(100, score))

    @staticmethod
    def bulk_update_status(lead_ids: list, new_status: str, db: Session) -> int:
        query = db.query(Lead).filter(Lead.id.in_(lead_ids))
        count = query.count()
        query.update({Lead.status: LeadStatus(new_status)})
        db.commit()
        return count

    @staticmethod
    def get_leads_by_score_range(org_id: UUID, min_score: float, max_score: float,
                                db: Session) -> list:
        return db.query(Lead).filter(
            Lead.organization_id == org_id,
            Lead.lead_score >= min_score,
            Lead.lead_score <= max_score
        ).all()
