"""Integration, APIKey, and Webhook models"""

from sqlalchemy import Column, String, DateTime, Boolean, JSON, ForeignKey, Index, Text, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from database import Base


class Integration(Base):
    __tablename__ = "integrations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)

    # Integration info
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)

    # Configuration
    config = Column(JSON, default=dict, nullable=False)

    # Status
    is_active = Column(Boolean, default=True, nullable=False)

    # Timestamps
    installed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_synced_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="integrations")
    api_keys = relationship("APIKey", back_populates="integration", cascade="all, delete-orphan")
    webhooks = relationship("Webhook", back_populates="integration", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_integrations_org_name", "organization_id", "name"),
        Index("idx_integrations_active", "is_active"),
    )

    def __repr__(self) -> str:
        return f"<Integration {self.name}>"


class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    integration_id = Column(UUID(as_uuid=True), ForeignKey("integrations.id"), nullable=False)

    # Key info
    name = Column(String(255), nullable=False)
    key_prefix = Column(String(10), nullable=False)  # First 10 chars for display
    key_hash = Column(String(255), nullable=False)  # Hashed key for security

    # Permissions
    scopes = Column(JSON, default=list, nullable=False)  # List of permission scopes

    # Status
    is_active = Column(Boolean, default=True, nullable=False)

    # Timestamps
    last_used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    organization = relationship("Organization", backref="api_keys")
    integration = relationship("Integration", back_populates="api_keys")

    __table_args__ = (
        Index("idx_api_keys_org", "organization_id"),
        Index("idx_api_keys_integration", "integration_id"),
        Index("idx_api_keys_active", "is_active"),
    )

    def __repr__(self) -> str:
        return f"<APIKey {self.name}>"


class Webhook(Base):
    __tablename__ = "webhooks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    integration_id = Column(UUID(as_uuid=True), ForeignKey("integrations.id"), nullable=False)

    # Webhook info
    name = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)

    # Events
    events = Column(JSON, default=list, nullable=False)  # List of subscribed events

    # Configuration
    headers = Column(JSON, default=dict, nullable=False)  # Custom headers
    secret = Column(String(255), nullable=True)  # Webhook secret for validation

    # Status
    is_active = Column(Boolean, default=True, nullable=False)

    # Stats
    delivery_count = Column(Integer, default=0, nullable=False)
    failed_delivery_count = Column(Integer, default=0, nullable=False)
    last_delivery_at = Column(DateTime, nullable=True)
    last_failure_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    organization = relationship("Organization", backref="webhooks")
    integration = relationship("Integration", back_populates="webhooks")

    __table_args__ = (
        Index("idx_webhooks_org_integration", "organization_id", "integration_id"),
        Index("idx_webhooks_active", "is_active"),
    )

    def __repr__(self) -> str:
        return f"<Webhook {self.name}>"
