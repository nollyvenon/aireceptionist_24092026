"""Referral management service"""

from sqlalchemy.orm import Session
from uuid import UUID
from app.models.advanced import Referral
from datetime import datetime, timedelta


class ReferralService:
    @staticmethod
    def create_referral(data: dict, organization_id: UUID, db: Session) -> Referral:
        referral = Referral(
            organization_id=organization_id,
            referrer_id=data.get("referrer_id"),
            referred_customer_id=data.get("referred_customer_id"),
            reward_amount=data.get("reward_amount", 0),
            reward_type=data.get("reward_type"),
            status=data.get("status", "pending"),
        )
        db.add(referral)
        db.commit()
        return referral

    @staticmethod
    def get_referral(referral_id: UUID, db: Session) -> Referral:
        return db.query(Referral).filter(Referral.id == referral_id).first()

    @staticmethod
    def list_organization_referrals(org_id: UUID, db: Session, skip: int = 0,
                                    limit: int = 50, status: str = None) -> tuple:
        query = db.query(Referral).filter(Referral.organization_id == org_id)

        if status:
            query = query.filter(Referral.status == status)

        total = query.count()
        referrals = query.order_by(Referral.created_at.desc()).offset(skip).limit(limit).all()
        return referrals, total

    @staticmethod
    def list_referrer_referrals(org_id: UUID, referrer_id: UUID, db: Session) -> list:
        return db.query(Referral).filter(
            Referral.organization_id == org_id,
            Referral.referrer_id == referrer_id
        ).order_by(Referral.created_at.desc()).all()

    @staticmethod
    def update_referral(referral_id: UUID, data: dict, db: Session) -> Referral:
        referral = db.query(Referral).filter(Referral.id == referral_id).first()
        if referral:
            if "status" in data:
                referral.status = data["status"]
                if data["status"] == "completed":
                    referral.completed_at = datetime.utcnow()
            if "reward_amount" in data:
                referral.reward_amount = data["reward_amount"]
            referral.updated_at = datetime.utcnow()
            db.commit()
        return referral

    @staticmethod
    def delete_referral(referral_id: UUID, db: Session) -> bool:
        referral = db.query(Referral).filter(Referral.id == referral_id).first()
        if referral:
            db.delete(referral)
            db.commit()
            return True
        return False

    @staticmethod
    def mark_completed(referral_id: UUID, db: Session) -> Referral:
        referral = db.query(Referral).filter(Referral.id == referral_id).first()
        if referral:
            referral.status = "completed"
            referral.completed_at = datetime.utcnow()
            db.commit()
        return referral

    @staticmethod
    def get_referral_summary(org_id: UUID, db: Session) -> dict:
        referrals = db.query(Referral).filter(Referral.organization_id == org_id).all()

        total = len(referrals)
        completed = len([r for r in referrals if r.status == "completed"])
        pending = len([r for r in referrals if r.status == "pending"])
        rejected = len([r for r in referrals if r.status == "rejected"])

        total_rewards = sum(r.reward_amount for r in referrals if r.reward_amount)

        completion_rate = (completed / total * 100) if total > 0 else 0

        return {
            "total_referrals": total,
            "completed": completed,
            "pending": pending,
            "rejected": rejected,
            "total_rewards_given": total_rewards,
            "completion_rate": round(completion_rate, 2),
        }

    @staticmethod
    def get_referrer_stats(org_id: UUID, referrer_id: UUID, db: Session) -> dict:
        referrals = db.query(Referral).filter(
            Referral.organization_id == org_id,
            Referral.referrer_id == referrer_id
        ).all()

        total = len(referrals)
        completed = len([r for r in referrals if r.status == "completed"])
        total_earnings = sum(r.reward_amount for r in referrals if r.reward_amount and r.status == "completed")

        return {
            "total_referrals": total,
            "completed_referrals": completed,
            "total_earnings": total_earnings,
            "average_reward": round(total_earnings / completed, 2) if completed > 0 else 0,
        }

    @staticmethod
    def get_pending_referrals(org_id: UUID, db: Session) -> list:
        return db.query(Referral).filter(
            Referral.organization_id == org_id,
            Referral.status == "pending"
        ).order_by(Referral.created_at.asc()).all()

    @staticmethod
    def get_recent_referrals(org_id: UUID, days: int = 30, db: Session) -> list:
        start_date = datetime.utcnow() - timedelta(days=days)
        return db.query(Referral).filter(
            Referral.organization_id == org_id,
            Referral.created_at >= start_date
        ).order_by(Referral.created_at.desc()).all()

    @staticmethod
    def bulk_mark_completed(referral_ids: list, db: Session) -> int:
        query = db.query(Referral).filter(Referral.id.in_(referral_ids))
        count = query.count()
        query.update({Referral.status: "completed", Referral.completed_at: datetime.utcnow()})
        db.commit()
        return count

    @staticmethod
    def search_referrals(org_id: UUID, customer_name: str, db: Session) -> list:
        return db.query(Referral).filter(
            Referral.organization_id == org_id
        ).all()
