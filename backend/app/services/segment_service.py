"""Customer segment management service"""

from sqlalchemy.orm import Session
from uuid import UUID
from app.models.advanced import CustomerSegment
from datetime import datetime
import json


class SegmentService:
    @staticmethod
    def create_segment(data: dict, organization_id: UUID, db: Session) -> CustomerSegment:
        segment = CustomerSegment(
            organization_id=organization_id,
            name=data.get("name"),
            description=data.get("description"),
            criteria=json.dumps(data.get("criteria", {})),
            is_active=data.get("is_active", True),
        )
        db.add(segment)
        db.commit()
        return segment

    @staticmethod
    def get_segment(segment_id: UUID, db: Session) -> CustomerSegment:
        return db.query(CustomerSegment).filter(CustomerSegment.id == segment_id).first()

    @staticmethod
    def list_organization_segments(org_id: UUID, db: Session, skip: int = 0,
                                   limit: int = 50, active_only: bool = False) -> tuple:
        query = db.query(CustomerSegment).filter(CustomerSegment.organization_id == org_id)

        if active_only:
            query = query.filter(CustomerSegment.is_active == True)

        total = query.count()
        segments = query.order_by(CustomerSegment.created_at.desc()).offset(skip).limit(limit).all()
        return segments, total

    @staticmethod
    def update_segment(segment_id: UUID, data: dict, db: Session) -> CustomerSegment:
        segment = db.query(CustomerSegment).filter(CustomerSegment.id == segment_id).first()
        if segment:
            if "name" in data:
                segment.name = data["name"]
            if "description" in data:
                segment.description = data["description"]
            if "criteria" in data:
                segment.criteria = json.dumps(data["criteria"])
            if "is_active" in data:
                segment.is_active = data["is_active"]
            segment.updated_at = datetime.utcnow()
            db.commit()
        return segment

    @staticmethod
    def delete_segment(segment_id: UUID, db: Session) -> bool:
        segment = db.query(CustomerSegment).filter(CustomerSegment.id == segment_id).first()
        if segment:
            db.delete(segment)
            db.commit()
            return True
        return False

    @staticmethod
    def add_member(segment_id: UUID, customer_id: UUID, db: Session) -> bool:
        segment = db.query(CustomerSegment).filter(CustomerSegment.id == segment_id).first()
        if segment:
            if segment.member_ids is None:
                segment.member_ids = []
            if customer_id not in segment.member_ids:
                segment.member_ids.append(customer_id)
                db.commit()
                return True
        return False

    @staticmethod
    def remove_member(segment_id: UUID, customer_id: UUID, db: Session) -> bool:
        segment = db.query(CustomerSegment).filter(CustomerSegment.id == segment_id).first()
        if segment and segment.member_ids and customer_id in segment.member_ids:
            segment.member_ids.remove(customer_id)
            db.commit()
            return True
        return False

    @staticmethod
    def get_segment_members(segment_id: UUID, db: Session) -> list:
        segment = db.query(CustomerSegment).filter(CustomerSegment.id == segment_id).first()
        if segment:
            return segment.member_ids or []
        return []

    @staticmethod
    def get_member_count(segment_id: UUID, db: Session) -> int:
        segment = db.query(CustomerSegment).filter(CustomerSegment.id == segment_id).first()
        if segment and segment.member_ids:
            return len(segment.member_ids)
        return 0

    @staticmethod
    def search_segments(org_id: UUID, name_query: str, db: Session) -> list:
        return db.query(CustomerSegment).filter(
            CustomerSegment.organization_id == org_id,
            CustomerSegment.name.ilike(f"%{name_query}%")
        ).all()

    @staticmethod
    def get_segment_summary(org_id: UUID, db: Session) -> dict:
        segments = db.query(CustomerSegment).filter(
            CustomerSegment.organization_id == org_id
        ).all()

        total = len(segments)
        active = len([s for s in segments if s.is_active])
        total_members = sum(len(s.member_ids) if s.member_ids else 0 for s in segments)

        avg_members = total_members / total if total > 0 else 0

        return {
            "total_segments": total,
            "active_segments": active,
            "total_members_across_segments": total_members,
            "average_members_per_segment": round(avg_members, 2),
        }

    @staticmethod
    def bulk_add_members(segment_id: UUID, customer_ids: list, db: Session) -> int:
        segment = db.query(CustomerSegment).filter(CustomerSegment.id == segment_id).first()
        if not segment:
            return 0

        if segment.member_ids is None:
            segment.member_ids = []

        added_count = 0
        for customer_id in customer_ids:
            if customer_id not in segment.member_ids:
                segment.member_ids.append(customer_id)
                added_count += 1

        if added_count > 0:
            db.commit()

        return added_count
