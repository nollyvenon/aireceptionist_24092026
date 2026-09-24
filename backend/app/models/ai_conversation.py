"""AI Conversation and ConversationMessage models"""

from sqlalchemy import Column, String, DateTime, Integer, JSON, Enum, ForeignKey, Index, Text, Float, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import enum
import uuid

from database import Base


class ConversationStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    ABANDONED = "abandoned"
    PAUSED = "paused"


class MessageType(str, enum.Enum):
    USER = "user"
    AI = "ai"
    SYSTEM = "system"


class IntentType(str, enum.Enum):
    BOOKING = "booking"
    RESCHEDULE = "reschedule"
    CANCELLATION = "cancellation"
    INQUIRY = "inquiry"
    FEEDBACK = "feedback"
    OTHER = "other"


class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=True)

    # Conversation metadata
    channel = Column(String(50), default="chat", nullable=False)  # chat, voice, whatsapp, etc.
    status = Column(Enum(ConversationStatus), default=ConversationStatus.ACTIVE, nullable=False)

    # AI context
    ai_model = Column(String(100), nullable=True)  # e.g., "gpt-4", "claude-3", "gemini"
    language = Column(String(10), default="en", nullable=False)

    # Metrics
    message_count = Column(Integer, default=0, nullable=False)
    duration_seconds = Column(Integer, nullable=True)
    sentiment_score = Column(Float, nullable=True)

    # Intent tracking
    primary_intent = Column(Enum(IntentType), nullable=True)
    intent_confidence = Column(Float, nullable=True)

    # Resolution
    was_resolved = Column(Boolean, default=False, nullable=False)
    resolution_type = Column(String(100), nullable=True)
    escalated_to_human = Column(Boolean, default=False, nullable=False)

    # Timestamps
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    ended_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    organization = relationship("Organization", backref="ai_conversations")
    customer = relationship("Customer", backref="ai_conversations")
    messages = relationship("ConversationMessage", back_populates="conversation", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_conversations_org_status", "organization_id", "status"),
        Index("idx_conversations_customer", "customer_id"),
        Index("idx_conversations_created", "created_at"),
    )

    def get_duration(self) -> int:
        """Calculate conversation duration in seconds"""
        if self.ended_at:
            return int((self.ended_at - self.started_at).total_seconds())
        return int((datetime.utcnow() - self.started_at).total_seconds())

    def __repr__(self) -> str:
        return f"<AIConversation {self.id} - {self.status}>"


class ConversationMessage(Base):
    __tablename__ = "conversation_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("ai_conversations.id"), nullable=False)

    # Message content
    message_type = Column(Enum(MessageType), nullable=False)
    text = Column(Text, nullable=False)

    # AI processing
    intent = Column(Enum(IntentType), nullable=True)
    intent_confidence = Column(Float, nullable=True)
    entities = Column(JSON, default=list, nullable=False)  # Extracted entities
    sentiment = Column(String(50), nullable=True)  # positive, negative, neutral
    sentiment_score = Column(Float, nullable=True)

    # Response metadata
    response_time_ms = Column(Integer, nullable=True)
    token_count = Column(Integer, nullable=True)

    # Context
    extra_data = Column(JSON, default=dict, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    conversation = relationship("AIConversation", back_populates="messages")

    __table_args__ = (
        Index("idx_conv_messages_conversation", "conversation_id"),
        Index("idx_conv_messages_type", "message_type"),
        Index("idx_conv_messages_created", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<ConversationMessage {self.message_type}>"
