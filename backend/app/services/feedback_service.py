"""Feedback management service"""

from sqlalchemy.orm import Session
from uuid import UUID
from app.models.advanced import Feedback
from datetime import datetime, timedelta


class FeedbackService:
    @staticmethod
    def create_feedback(data: dict, organization_id: UUID, db: Session) -> Feedback:
        feedback = Feedback(
            organization_id=organization_id,
            customer_id=data.get("customer_id"),
            rating=data.get("rating"),
            comment=data.get("comment"),
            feedback_type=data.get("feedback_type"),
        )
        db.add(feedback)
        db.commit()
        return feedback

    @staticmethod
    def get_feedback(feedback_id: UUID, db: Session) -> Feedback:
        return db.query(Feedback).filter(Feedback.id == feedback_id).first()

    @staticmethod
    def list_organization_feedback(org_id: UUID, db: Session, skip: int = 0,
                                   limit: int = 50, min_rating: int = None) -> tuple:
        query = db.query(Feedback).filter(Feedback.organization_id == org_id)

        if min_rating is not None:
            query = query.filter(Feedback.rating >= min_rating)

        total = query.count()
        feedback_list = query.order_by(Feedback.created_at.desc()).offset(skip).limit(limit).all()
        return feedback_list, total

    @staticmethod
    def list_customer_feedback(org_id: UUID, customer_id: UUID, db: Session) -> list:
        return db.query(Feedback).filter(
            Feedback.organization_id == org_id,
            Feedback.customer_id == customer_id
        ).order_by(Feedback.created_at.desc()).all()

    @staticmethod
    def update_feedback(feedback_id: UUID, data: dict, db: Session) -> Feedback:
        feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
        if feedback:
            if "rating" in data:
                feedback.rating = data["rating"]
            if "comment" in data:
                feedback.comment = data["comment"]
            if "feedback_type" in data:
                feedback.feedback_type = data["feedback_type"]
            feedback.updated_at = datetime.utcnow()
            db.commit()
        return feedback

    @staticmethod
    def delete_feedback(feedback_id: UUID, db: Session) -> bool:
        feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
        if feedback:
            db.delete(feedback)
            db.commit()
            return True
        return False

    @staticmethod
    def get_feedback_summary(org_id: UUID, db: Session) -> dict:
        feedback_list = db.query(Feedback).filter(Feedback.organization_id == org_id).all()

        if not feedback_list:
            return {
                "total_feedback": 0,
                "average_rating": 0,
                "rating_distribution": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
            }

        total = len(feedback_list)
        avg_rating = sum(f.rating for f in feedback_list if f.rating) / total if total > 0 else 0

        rating_dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        for feedback in feedback_list:
            if feedback.rating and 1 <= feedback.rating <= 5:
                rating_dist[feedback.rating] += 1

        return {
            "total_feedback": total,
            "average_rating": round(avg_rating, 2),
            "rating_distribution": rating_dist,
        }

    @staticmethod
    def get_feedback_by_type(org_id: UUID, feedback_type: str, db: Session) -> list:
        return db.query(Feedback).filter(
            Feedback.organization_id == org_id,
            Feedback.feedback_type == feedback_type
        ).order_by(Feedback.created_at.desc()).all()

    @staticmethod
    def search_feedback(org_id: UUID, query_str: str, db: Session) -> list:
        return db.query(Feedback).filter(
            Feedback.organization_id == org_id,
            Feedback.comment.ilike(f"%{query_str}%")
        ).order_by(Feedback.created_at.desc()).all()

    @staticmethod
    def get_recent_feedback(org_id: UUID, days: int = 30, db: Session) -> list:
        start_date = datetime.utcnow() - timedelta(days=days)
        return db.query(Feedback).filter(
            Feedback.organization_id == org_id,
            Feedback.created_at >= start_date
        ).order_by(Feedback.created_at.desc()).all()

    @staticmethod
    def mark_helpful(feedback_id: UUID, db: Session) -> Feedback:
        feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
        if feedback:
            if feedback.helpful_count is None:
                feedback.helpful_count = 0
            feedback.helpful_count += 1
            db.commit()
        return feedback

    @staticmethod
    def get_high_ratings(org_id: UUID, min_rating: int = 4, db: Session) -> list:
        return db.query(Feedback).filter(
            Feedback.organization_id == org_id,
            Feedback.rating >= min_rating
        ).order_by(Feedback.created_at.desc()).all()

    @staticmethod
    def get_low_ratings(org_id: UUID, max_rating: int = 2, db: Session) -> list:
        return db.query(Feedback).filter(
            Feedback.organization_id == org_id,
            Feedback.rating <= max_rating
        ).order_by(Feedback.created_at.desc()).all()
