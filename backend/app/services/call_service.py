"""Call management service"""

from sqlalchemy.orm import Session
from uuid import UUID
from app.models.communication import Call, CallStatus, CallType
from datetime import datetime, timedelta

class CallService:
    @staticmethod
    def create_call(data: dict, organization_id: UUID, db: Session) -> Call:
        call = Call(
            organization_id=organization_id,
            from_number=data.get("from_number"),
            to_number=data.get("to_number"),
            call_type=data.get("call_type"),
            status=CallStatus(data.get("status", "completed")),
            duration=data.get("duration", 0),
            recording_url=data.get("recording_url"),
            transcript=data.get("transcript"),
            notes=data.get("notes"),
        )
        db.add(call)
        db.commit()
        return call

    @staticmethod
    def get_call(call_id: UUID, db: Session) -> Call:
        return db.query(Call).filter(Call.id == call_id).first()

    @staticmethod
    def list_organization_calls(org_id: UUID, db: Session, skip: int = 0, limit: int = 50,
                               status: str = None) -> tuple:
        query = db.query(Call).filter(Call.organization_id == org_id)
        if status:
            query = query.filter(Call.status == CallStatus(status))
        total = query.count()
        calls = query.order_by(Call.created_at.desc()).offset(skip).limit(limit).all()
        return calls, total

    @staticmethod
    def get_call_summary(org_id: UUID, db: Session) -> dict:
        calls = db.query(Call).filter(Call.organization_id == org_id).all()

        total = len(calls)
        completed = len([c for c in calls if c.status == CallStatus.COMPLETED])
        failed = len([c for c in calls if c.status == CallStatus.FAILED])
        missed = len([c for c in calls if c.status == CallStatus.MISSED])
        avg_duration = sum(c.duration for c in calls) / len(calls) if calls else 0

        inbound = len([c for c in calls if c.call_type == CallType.INBOUND])
        outbound = len([c for c in calls if c.call_type == CallType.OUTBOUND])

        return {
            "total": total,
            "completed": completed,
            "failed": failed,
            "missed": missed,
            "average_duration": avg_duration,
            "inbound": inbound,
            "outbound": outbound,
            "success_rate": (completed / total * 100) if total > 0 else 0,
        }

    @staticmethod
    def get_calls_by_date_range(org_id: UUID, start_date: datetime, end_date: datetime,
                               db: Session) -> list:
        return db.query(Call).filter(
            Call.organization_id == org_id,
            Call.created_at >= start_date,
            Call.created_at <= end_date
        ).all()

    @staticmethod
    def search_calls(org_id: UUID, phone_number: str, db: Session) -> list:
        return db.query(Call).filter(
            Call.organization_id == org_id,
            (Call.from_number == phone_number) | (Call.to_number == phone_number)
        ).order_by(Call.created_at.desc()).all()

    @staticmethod
    def get_call_analytics(org_id: UUID, days: int = 30, db: Session) -> dict:
        start_date = datetime.utcnow() - timedelta(days=days)
        calls = db.query(Call).filter(
            Call.organization_id == org_id,
            Call.created_at >= start_date
        ).all()

        daily_stats = {}
        for call in calls:
            date_key = call.created_at.date().isoformat()
            if date_key not in daily_stats:
                daily_stats[date_key] = {
                    "total": 0,
                    "completed": 0,
                    "duration": 0,
                }

            daily_stats[date_key]["total"] += 1
            if call.status == CallStatus.COMPLETED:
                daily_stats[date_key]["completed"] += 1
            daily_stats[date_key]["duration"] += call.duration

        return {
            "period_days": days,
            "daily_stats": daily_stats,
            "total_calls": len(calls),
        }

    @staticmethod
    def transcribe_call(call_id: UUID, transcript: str, db: Session) -> Call:
        call = db.query(Call).filter(Call.id == call_id).first()
        if call:
            call.transcript = transcript
            db.commit()
        return call
