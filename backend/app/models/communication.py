"""Communication models - Calls, Voicemail, etc"""

from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Float, Integer, Text, Boolean, Index
from sqlalchemy.dialects.postgresql import UUID, JSON
from datetime import datetime, timedelta
import enum
import uuid

from database import Base

class CallStatus(str, enum.Enum):
    RINGING = "ringing"
    CONNECTED = "connected"
    COMPLETED = "completed"
    FAILED = "failed"
    MISSED = "missed"

class CallType(str, enum.Enum):
    INBOUND = "inbound"
    OUTBOUND = "outbound"

class Call(Base):
    __tablename__ = "calls"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    from_number = Column(String(20), nullable=False)
    to_number = Column(String(20), nullable=False)
    call_type = Column(Enum(CallType), nullable=False)
    status = Column(Enum(CallStatus), nullable=False)
    duration = Column(Integer, default=0, nullable=False)
    recording_url = Column(String(500), nullable=True)
    transcript = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    custom_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_calls_org", "organization_id"),
        Index("idx_calls_from", "from_number"),
        Index("idx_calls_to", "to_number"),
    )

class Voicemail(Base):
    __tablename__ = "voicemails"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    caller_number = Column(String(20), nullable=False)
    duration = Column(Integer, default=0, nullable=False)
    audio_url = Column(String(500), nullable=False)
    transcript = Column(Text, nullable=True)
    is_listened = Column(Boolean, default=False, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_voicemail_org", "organization_id"),
        Index("idx_voicemail_caller", "caller_number"),
    )
