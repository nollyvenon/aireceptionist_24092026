"""Appointment model"""

from sqlalchemy import Column, String, DateTime, Boolean, Integer, Enum, ForeignKey, Index, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import enum
import uuid

from database import Base

class AppointmentStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"
    RESCHEDULED = "rescheduled"

class AppointmentType(str, enum.Enum):
    CONSULTATION = "consultation"
    SERVICE = "service"
    FOLLOWUP = "followup"
    APPOINTMENT = "appointment"

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False)

    # Staff assignment
    assigned_to_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    # Appointment details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    appointment_type = Column(Enum(AppointmentType), default=AppointmentType.APPOINTMENT, nullable=False)

    # Timing
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=False)

    # Location/Meeting info
    location = Column(String(255), nullable=True)
    meeting_url = Column(String(500), nullable=True)  # For Zoom, Teams, etc.
    meeting_provider = Column(String(50), nullable=True)  # zoom, teams, google_meet, etc.

    # Status
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.SCHEDULED, nullable=False)

    # Confirmation
    is_confirmed = Column(Boolean, default=False, nullable=False)
    confirmed_at = Column(DateTime, nullable=True)

    # Reminders
    reminder_sent_email = Column(Boolean, default=False, nullable=False)
    reminder_sent_sms = Column(Boolean, default=False, nullable=False)
    reminder_sent_at = Column(DateTime, nullable=True)

    # Cancellation
    cancelled_at = Column(DateTime, nullable=True)
    cancelled_by_id = Column(UUID(as_uuid=True), nullable=True)
    cancellation_reason = Column(String(500), nullable=True)

    # Rescheduling
    original_appointment_id = Column(UUID(as_uuid=True), ForeignKey("appointments.id"), nullable=True)
    reschedule_count = Column(Integer, default=0, nullable=False)

    # Notes & feedback
    notes = Column(Text, nullable=True)
    customer_notes = Column(Text, nullable=True)
    internal_notes = Column(Text, nullable=True)

    # Rating
    customer_rating = Column(Float, nullable=True)  # 1-5 stars
    rating_comment = Column(Text, nullable=True)

    # Payment
    price_cents = Column(Integer, nullable=True)
    payment_id = Column(UUID(as_uuid=True), ForeignKey("payments.id"), nullable=True)

    # External calendar sync
    google_event_id = Column(String(255), nullable=True)
    outlook_event_id = Column(String(255), nullable=True)
    apple_event_id = Column(String(255), nullable=True)

    # Metadata
    custom_metadata = Column(String(1000), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="appointments")
    customer = relationship("Customer", back_populates="appointments")
    assigned_to = relationship("User", foreign_keys=[assigned_to_id], back_populates="appointments")
    created_by = relationship("User", foreign_keys=[created_by_id], overlaps="appointments")
    payment = relationship("Payment", back_populates="appointment", uselist=False, foreign_keys="[Payment.appointment_id]")
    activities = relationship("Activity", foreign_keys="[Activity.appointment_id]", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_appointments_org_start", "organization_id", "start_time"),
        Index("idx_appointments_customer", "customer_id"),
        Index("idx_appointments_status", "status"),
        Index("idx_appointments_assigned", "assigned_to_id"),
        Index("idx_appointments_created", "created_at"),
    )

    def is_upcoming(self) -> bool:
        return self.status in [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] and self.start_time > datetime.utcnow()

    def is_past(self) -> bool:
        return self.end_time < datetime.utcnow()

    def get_duration_hours(self) -> float:
        return self.duration_minutes / 60

    def __repr__(self) -> str:
        return f"<Appointment {self.id} - {self.title}>"
