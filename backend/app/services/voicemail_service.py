"""Voicemail management service"""

from sqlalchemy.orm import Session
from uuid import UUID
from app.models.communication import Voicemail
from datetime import datetime, timedelta

class VoicemailService:
    @staticmethod
    def create_voicemail(data: dict, organization_id: UUID, db: Session) -> Voicemail:
        voicemail = Voicemail(
            organization_id=organization_id,
            caller_number=data.get("caller_number"),
            duration=data.get("duration", 0),
            audio_url=data.get("audio_url"),
            transcript=data.get("transcript"),
        )
        db.add(voicemail)
        db.commit()
        return voicemail

    @staticmethod
    def get_voicemail(voicemail_id: UUID, db: Session) -> Voicemail:
        return db.query(Voicemail).filter(Voicemail.id == voicemail_id).first()

    @staticmethod
    def list_organization_voicemails(org_id: UUID, db: Session, skip: int = 0,
                                    limit: int = 50, unread_only: bool = False) -> tuple:
        query = db.query(Voicemail).filter(Voicemail.organization_id == org_id)

        if unread_only:
            query = query.filter(Voicemail.is_listened == False)

        total = query.count()
        voicemails = query.order_by(Voicemail.created_at.desc()).offset(skip).limit(limit).all()
        return voicemails, total

    @staticmethod
    def mark_listened(voicemail_id: UUID, db: Session) -> Voicemail:
        voicemail = db.query(Voicemail).filter(Voicemail.id == voicemail_id).first()
        if voicemail:
            voicemail.is_listened = True
            db.commit()
        return voicemail

    @staticmethod
    def mark_unlistened(voicemail_id: UUID, db: Session) -> Voicemail:
        voicemail = db.query(Voicemail).filter(Voicemail.id == voicemail_id).first()
        if voicemail:
            voicemail.is_listened = False
            db.commit()
        return voicemail

    @staticmethod
    def mark_all_listened(org_id: UUID, db: Session) -> int:
        query = db.query(Voicemail).filter(
            Voicemail.organization_id == org_id,
            Voicemail.is_listened == False
        )
        count = query.count()
        query.update({Voicemail.is_listened: True})
        db.commit()
        return count

    @staticmethod
    def get_voicemail_summary(org_id: UUID, db: Session) -> dict:
        voicemails = db.query(Voicemail).filter(Voicemail.organization_id == org_id).all()

        total = len(voicemails)
        unlistened = len([v for v in voicemails if not v.is_listened])
        total_duration = sum(v.duration for v in voicemails)
        avg_duration = total_duration / total if total > 0 else 0

        return {
            "total": total,
            "unlistened": unlistened,
            "listened": total - unlistened,
            "total_duration_seconds": total_duration,
            "average_duration_seconds": avg_duration,
        }

    @staticmethod
    def search_voicemails(org_id: UUID, phone_number: str, db: Session) -> list:
        return db.query(Voicemail).filter(
            Voicemail.organization_id == org_id,
            Voicemail.caller_number == phone_number
        ).order_by(Voicemail.created_at.desc()).all()

    @staticmethod
    def transcribe_voicemail(voicemail_id: UUID, transcript: str, db: Session) -> Voicemail:
        voicemail = db.query(Voicemail).filter(Voicemail.id == voicemail_id).first()
        if voicemail:
            voicemail.transcript = transcript
            db.commit()
        return voicemail

    @staticmethod
    def delete_old_voicemails(org_id: UUID, days: int = 30, db: Session) -> int:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        query = db.query(Voicemail).filter(
            Voicemail.organization_id == org_id,
            Voicemail.created_at < cutoff_date,
            Voicemail.is_listened == True
        )
        count = query.count()
        query.delete()
        db.commit()
        return count
