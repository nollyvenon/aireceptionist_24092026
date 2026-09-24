"""AI Conversation and related models"""

from sqlalchemy import Column, String, DateTime, Boolean, JSON, ForeignKey, Index, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import enum
import uuid

from database import Base


class ConversationStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class MessageType(str, enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class IntentType(str, enum.Enum):
    BOOKING = "booking"
    RESCHEDULE = "reschedule"
    CANCEL = "cancel"
    INQUIRY = "inquiry"
    OTHER = "other"


class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=True)

    # Conversation metadata
    channel = Column(String(50), nullable=False)  # 'chat', 'voice', 'whatsapp', etc.
    status = Column(Enum(ConversationStatus), default=ConversationStatus.ACTIVE, nullable=False)
    language = Column(String(10), default="en", nullable=False)

    # Intent detection
    detected_intent = Column(Enum(IntentType), nullable=True)
    intent_confidence = Column(JSON, default=dict, nullable=False)  # {intent: score, ...}

    # Sentiment analysis
    sentiment = Column(String(50), nullable=True)  # 'positive', 'negative', 'neutral'
    sentiment_score = Column(JSON, default=dict, nullable=False)  # {positive: score, ...}

    # Context and metadata
    extra_data = Column(JSON, default=dict, nullable=False)
    session_id = Column(String(255), nullable=True)
    external_conversation_id = Column(String(255), nullable=True)

    # Timestamps
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    ended_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="ai_conversations")
    customer = relationship("Customer", back_populates="ai_conversations")
    messages = relationship("ConversationMessage", back_populates="conversation", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_ai_conv_org_status", "organization_id", "status"),
        Index("idx_ai_conv_customer", "customer_id"),
        Index("idx_ai_conv_created", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<AIConversation {self.id}>"


class ConversationMessage(Base):
    __tablename__ = "conversation_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("ai_conversations.id"), nullable=False)

    # Message content
    message_type = Column(Enum(MessageType), nullable=False)
    content = Column(Text, nullable=False)
    role = Column(String(50), nullable=False)  # 'user', 'assistant', 'system'

    # Metadata
    extra_data = Column(JSON, default=dict, nullable=False)
    tokens_used = Column(JSON, default=dict, nullable=False)  # {input_tokens: x, output_tokens: y}

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    conversation = relationship("AIConversation", back_populates="messages")

    __table_args__ = (
        Index("idx_conv_messages_conversation", "conversation_id"),
        Index("idx_conv_messages_type", "message_type"),
        Index("idx_conv_messages_created", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<ConversationMessage {self.id}>"
