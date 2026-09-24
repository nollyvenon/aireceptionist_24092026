"""Message, Campaign, and MessageTemplate models"""

from sqlalchemy import Column, String, DateTime, Boolean, Integer, JSON, Enum, ForeignKey, Index, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import enum
import uuid

from database import Base


class MessageChannel(str, enum.Enum):
    SMS = "sms"
    EMAIL = "email"
    WHATSAPP = "whatsapp"
    PUSH = "push"


class MessageStatus(str, enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    BOUNCED = "bounced"


class CampaignStatus(str, enum.Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=True)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=True)

    # Message content
    channel = Column(Enum(MessageChannel), nullable=False)
    recipient = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=True)
    body = Column(Text, nullable=False)

    # Status tracking
    status = Column(Enum(MessageStatus), default=MessageStatus.PENDING, nullable=False)
    external_message_id = Column(String(255), nullable=True)
    delivery_timestamp = Column(DateTime, nullable=True)
    bounce_reason = Column(String(500), nullable=True)
    bounce_timestamp = Column(DateTime, nullable=True)

    # Extra data
    extra_data = Column(JSON, default=dict, nullable=False)
    tracking_url = Column(String(500), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="messages")
    customer = relationship("Customer", back_populates="messages")
    campaign = relationship("Campaign", back_populates="messages")

    __table_args__ = (
        Index("idx_messages_org_channel", "organization_id", "channel"),
        Index("idx_messages_status", "status"),
        Index("idx_messages_created", "created_at"),
        Index("idx_messages_customer", "customer_id"),
    )

    def __repr__(self) -> str:
        return f"<Message {self.channel} to {self.recipient}>"


class MessageTemplate(Base):
    __tablename__ = "message_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)

    # Template info
    name = Column(String(255), nullable=False)
    channel = Column(Enum(MessageChannel), nullable=False)
    description = Column(Text, nullable=True)

    # Template content
    subject = Column(String(255), nullable=True)
    body = Column(Text, nullable=False)
    variables = Column(JSON, default=list, nullable=False)  # List of variable placeholders

    # Status
    is_active = Column(Boolean, default=True, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="message_templates")
    campaigns = relationship("Campaign", back_populates="template")

    __table_args__ = (
        Index("idx_templates_org_channel", "organization_id", "channel"),
        Index("idx_templates_active", "is_active"),
    )

    def __repr__(self) -> str:
        return f"<MessageTemplate {self.name}>"


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    template_id = Column(UUID(as_uuid=True), ForeignKey("message_templates.id"), nullable=True)

    # Campaign info
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    channel = Column(Enum(MessageChannel), nullable=False)

    # Targeting
    target_segment = Column(String(255), nullable=True)
    target_count = Column(Integer, default=0, nullable=False)

    # Status and scheduling
    status = Column(Enum(CampaignStatus), default=CampaignStatus.DRAFT, nullable=False)
    scheduled_at = Column(DateTime, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # Results
    sent_count = Column(Integer, default=0, nullable=False)
    delivered_count = Column(Integer, default=0, nullable=False)
    failed_count = Column(Integer, default=0, nullable=False)
    bounced_count = Column(Integer, default=0, nullable=False)
    opened_count = Column(Integer, default=0, nullable=True)
    clicked_count = Column(Integer, default=0, nullable=True)

    # Extra data
    extra_data = Column(JSON, default=dict, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    organization = relationship("Organization", backref="campaigns")
    template = relationship("MessageTemplate", back_populates="campaigns")
    messages = relationship("Message", back_populates="campaign", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_campaigns_org_status", "organization_id", "status"),
        Index("idx_campaigns_created", "created_at"),
    )

    def get_delivery_rate(self) -> float:
        """Calculate delivery rate as percentage"""
        if self.sent_count == 0:
            return 0.0
        return (self.delivered_count / self.sent_count) * 100

    def get_success_rate(self) -> float:
        """Calculate success rate (delivered / sent) as percentage"""
        if self.sent_count == 0:
            return 0.0
        return ((self.sent_count - self.failed_count) / self.sent_count) * 100

    def __repr__(self) -> str:
        return f"<Campaign {self.name}>"
