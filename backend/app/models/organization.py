"""Organization model"""

from sqlalchemy import Column, String, DateTime, Boolean, Integer, JSON, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from database import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(String(1000), nullable=True)
    logo_url = Column(String(500), nullable=True)
    website = Column(String(500), nullable=True)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)

    # Address
    address_1 = Column(String(255), nullable=True)
    address_2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(50), nullable=True)
    postal_code = Column(String(20), nullable=True)
    country = Column(String(2), nullable=True)  # ISO country code

    # Business info
    timezone = Column(String(50), default="UTC", nullable=False)
    business_hours = Column(JSON, nullable=True)  # {"monday": {"open": "09:00", "close": "17:00"}}
    industry = Column(String(100), nullable=True)
    employee_count = Column(Integer, nullable=True)

    # Subscription
    plan = Column(String(50), default="starter", nullable=False)  # starter, professional, business, enterprise
    is_trial = Column(Boolean, default=True, nullable=False)
    trial_ends_at = Column(DateTime, nullable=True)
    billing_email = Column(String(255), nullable=True)

    # Settings
    ai_enabled = Column(Boolean, default=True, nullable=False)
    voice_enabled = Column(Boolean, default=False, nullable=False)
    whatsapp_enabled = Column(Boolean, default=False, nullable=False)
    automation_enabled = Column(Boolean, default=True, nullable=False)

    # Metadata
    settings = Column(JSON, nullable=True)
    api_keys = Column(JSON, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    customers = relationship("Customer", back_populates="organization", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="organization", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="organization", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="organization", cascade="all, delete-orphan")
    automations = relationship("Automation", back_populates="organization", cascade="all, delete-orphan")
    subscription = relationship("Subscription", back_populates="organization", uselist=False, cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="organization", cascade="all, delete-orphan")
    message_templates = relationship("MessageTemplate", back_populates="organization", cascade="all, delete-orphan")
    campaigns = relationship("Campaign", back_populates="organization", cascade="all, delete-orphan")
    ai_conversations = relationship("AIConversation", back_populates="organization", cascade="all, delete-orphan")
    integrations = relationship("Integration", back_populates="organization", cascade="all, delete-orphan")
    api_keys = relationship("APIKey", back_populates="organization", cascade="all, delete-orphan")
    webhooks = relationship("Webhook", back_populates="organization", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_orgs_plan", "plan"),
        Index("idx_orgs_created", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<Organization {self.name}>"
