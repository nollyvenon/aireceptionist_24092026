"""Deal management service"""

from sqlalchemy.orm import Session
from uuid import UUID
from app.models.crm import Deal, DealStatus
from datetime import datetime

class DealService:
    @staticmethod
    def create_deal(data: dict, organization_id: UUID, db: Session) -> Deal:
        deal = Deal(
            organization_id=organization_id,
            customer_id=data.get("customer_id"),
            name=data.get("name"),
            value=data.get("value", 0.0),
            status=DealStatus(data.get("status", "prospect")),
            assigned_to_id=data.get("assigned_to_id"),
            probability=data.get("probability", 0.0),
            notes=data.get("notes"),
        )
        db.add(deal)
        db.commit()
        return deal

    @staticmethod
    def get_deal(deal_id: UUID, db: Session) -> Deal:
        return db.query(Deal).filter(Deal.id == deal_id).first()

    @staticmethod
    def update_deal(deal_id: UUID, data: dict, db: Session) -> Deal:
        deal = db.query(Deal).filter(Deal.id == deal_id).first()
        if deal:
            for key, value in data.items():
                if key == "status":
                    setattr(deal, key, DealStatus(value))
                elif hasattr(deal, key):
                    setattr(deal, key, value)
            db.commit()
        return deal

    @staticmethod
    def delete_deal(deal_id: UUID, db: Session) -> bool:
        deal = db.query(Deal).filter(Deal.id == deal_id).first()
        if deal:
            db.delete(deal)
            db.commit()
            return True
        return False

    @staticmethod
    def list_organization_deals(org_id: UUID, db: Session, skip: int = 0, limit: int = 50,
                               status: str = None) -> tuple:
        query = db.query(Deal).filter(Deal.organization_id == org_id)
        if status:
            query = query.filter(Deal.status == DealStatus(status))
        total = query.count()
        deals = query.offset(skip).limit(limit).all()
        return deals, total

    @staticmethod
    def list_customer_deals(customer_id: UUID, db: Session) -> list:
        return db.query(Deal).filter(Deal.customer_id == customer_id).all()

    @staticmethod
    def mark_deal_won(deal_id: UUID, db: Session) -> Deal:
        deal = db.query(Deal).filter(Deal.id == deal_id).first()
        if deal:
            deal.status = DealStatus.CLOSED_WON
            deal.close_date = datetime.utcnow()
            deal.probability = 100.0
            db.commit()
        return deal

    @staticmethod
    def mark_deal_lost(deal_id: UUID, db: Session) -> Deal:
        deal = db.query(Deal).filter(Deal.id == deal_id).first()
        if deal:
            deal.status = DealStatus.CLOSED_LOST
            deal.close_date = datetime.utcnow()
            deal.probability = 0.0
            db.commit()
        return deal

    @staticmethod
    def get_pipeline_summary(org_id: UUID, db: Session) -> dict:
        deals = db.query(Deal).filter(Deal.organization_id == org_id).all()

        summary = {
            "total_value": sum(d.value for d in deals),
            "total_count": len(deals),
            "by_status": {},
            "by_probability": {},
        }

        for status in DealStatus:
            status_deals = [d for d in deals if d.status == status]
            summary["by_status"][status.value] = {
                "count": len(status_deals),
                "value": sum(d.value for d in status_deals),
            }

        # Probability buckets
        prob_ranges = [(0, 25), (25, 50), (50, 75), (75, 100)]
        for min_prob, max_prob in prob_ranges:
            bucket_deals = [d for d in deals if min_prob <= d.probability < max_prob]
            summary["by_probability"][f"{min_prob}-{max_prob}%"] = {
                "count": len(bucket_deals),
                "value": sum(d.value for d in bucket_deals),
            }

        return summary

    @staticmethod
    def search_deals(org_id: UUID, query_str: str, db: Session, skip: int = 0,
                    limit: int = 50) -> tuple:
        query = db.query(Deal).filter(
            Deal.organization_id == org_id,
            Deal.name.ilike(f"%{query_str}%")
        )
        total = query.count()
        deals = query.offset(skip).limit(limit).all()
        return deals, total

    @staticmethod
    def get_deals_by_probability_range(org_id: UUID, min_prob: float, max_prob: float,
                                      db: Session) -> list:
        return db.query(Deal).filter(
            Deal.organization_id == org_id,
            Deal.probability >= min_prob,
            Deal.probability <= max_prob
        ).all()
