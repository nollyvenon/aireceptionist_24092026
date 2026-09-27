"""Advanced models - Custom fields, Documents, Segments, Referrals, Feedback"""

from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Float, Integer, Text, Boolean, Index, Table
from sqlalchemy.dialects.postgresql import UUID, JSON, JSONB
from datetime import datetime
import enum
import uuid

from database import Base

class CustomField(Base):
    __tablename__ = "custom_fields"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    entity_type = Column(String(50), nullable=False)
    field_name = Column(String(255), nullable=False)
    field_type = Column(String(50), nullable=False)
    is_required = Column(Boolean, default=False, nullable=False)
    default_value = Column(String(255), nullable=True)
    options = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_custom_field_org_entity", "organization_id", "entity_type"),
    )

class FieldValue(Base):
    __tablename__ = "field_values"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    custom_field_id = Column(UUID(as_uuid=True), ForeignKey("custom_fields.id"), nullable=False)
    entity_id = Column(UUID(as_uuid=True), nullable=False)
    value = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_field_value_entity", "entity_id"),
    )

class CustomerSegment(Base):
    __tablename__ = "customer_segments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    criteria = Column(JSONB, nullable=True)
    member_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_segment_org", "organization_id"),
    )

class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    uploaded_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    file_name = Column(String(500), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_document_org", "organization_id"),
    )

class Referral(Base):
    __tablename__ = "referrals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    referrer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False)
    referred_email = Column(String(255), nullable=False)
    referred_name = Column(String(255), nullable=True)
    status = Column(String(50), default="pending", nullable=False)
    reward_value = Column(Float, default=0.0, nullable=False)
    reward_given_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_referral_org", "organization_id"),
        Index("idx_referral_referrer", "referrer_id"),
    )

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=True)
    rating = Column(Integer, nullable=False)
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=True)
    attachments = Column(JSON, nullable=True)
    status = Column(String(50), default="open", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_feedback_org", "organization_id"),
        Index("idx_feedback_customer", "customer_id"),
    )
