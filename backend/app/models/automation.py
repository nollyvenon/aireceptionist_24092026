"""Automation/Workflow model"""

from sqlalchemy import Column, String, DateTime, Boolean, Enum, ForeignKey, Index, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import enum
import uuid

from database import Base

class AutomationTrigger(str, enum.Enum):
    APPOINTMENT_CREATED = "appointment_created"
    APPOINTMENT_COMPLETED = "appointment_completed"
    APPOINTMENT_CANCELLED = "appointment_cancelled"
    PAYMENT_RECEIVED = "payment_received"
    PAYMENT_FAILED = "payment_failed"
    CUSTOMER_CREATED = "customer_created"
    CUSTOMER_UPDATED = "customer_updated"
    SCHEDULED_TIME = "scheduled_time"
    WEBHOOK = "webhook"

class AutomationAction(str, enum.Enum):
    SEND_EMAIL = "send_email"
    SEND_SMS = "send_sms"
    SEND_WHATSAPP = "send_whatsapp"
    CREATE_APPOINTMENT = "create_appointment"
    UPDATE_CUSTOMER = "update_customer"
    CREATE_TASK = "create_task"
    CALL_WEBHOOK = "call_webhook"
    TRIGGER_AI = "trigger_ai"

class Automation(Base):
    __tablename__ = "automations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)

    # Basic info
    name = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)

    # Trigger
    trigger = Column(Enum(AutomationTrigger), nullable=False)
    trigger_conditions = Column(JSON, default=dict, nullable=False)  # {"status": "completed"}

    # Actions
    actions = Column(JSON, default=list, nullable=False)  # List of action configs

    # Status
    is_active = Column(Boolean, default=True, nullable=False)

    # Execution tracking
    execution_count = Column(String, default=0, nullable=False)
    success_count = Column(String, default=0, nullable=False)
    failure_count = Column(String, default=0, nullable=False)
    last_executed_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="automations")

    __table_args__ = (
        Index("idx_automations_org_trigger", "organization_id", "trigger"),
        Index("idx_automations_active", "is_active"),
    )

    def __repr__(self) -> str:
        return f"<Automation {self.name}>"
