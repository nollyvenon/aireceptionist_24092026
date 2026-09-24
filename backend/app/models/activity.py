"""Activity model for tracking customer interactions"""

from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Index, Text, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import enum
import uuid

from database import Base

class ActivityType(str, enum.Enum):
    CALL = "call"
    EMAIL = "email"
    SMS = "sms"
    WHATSAPP = "whatsapp"
    MEETING = "meeting"
    NOTE = "note"
    APPOINTMENT = "appointment"
    PAYMENT = "payment"
    SYSTEM = "system"

class Activity(Base):
    __tablename__ = "activities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False)
    appointment_id = Column(UUID(as_uuid=True), ForeignKey("appointments.id"), nullable=True)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    # Activity details
    activity_type = Column(Enum(ActivityType), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # Call details
    duration_minutes = Column(Integer, nullable=True)
    call_outcome = Column(String(100), nullable=True)
    recording_url = Column(String(500), nullable=True)

    # Metadata
    metadata = Column(String(1000), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="activities")
    customer = relationship("Customer", foreign_keys=[customer_id])
    appointment = relationship("Appointment", foreign_keys=[appointment_id])
    created_by = relationship("User", foreign_keys=[created_by_id])

    __table_args__ = (
        Index("idx_activities_org_customer", "organization_id", "customer_id"),
        Index("idx_activities_type", "activity_type"),
        Index("idx_activities_created", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<Activity {self.activity_type} - {self.title}>"
