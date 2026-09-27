"""Feature flags, security, and admin models"""

from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Float, Integer, Text, Boolean, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET
from datetime import datetime
import enum
import uuid

from database import Base

class FeatureFlag(Base):
    __tablename__ = "feature_flags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), unique=True, nullable=False)
    key = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    enabled = Column(Boolean, default=False, nullable=False)
    rollout_percentage = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<FeatureFlag {self.key}>"

class IPWhitelist(Base):
    __tablename__ = "ip_whitelists"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    ip_address = Column(String(45), nullable=False)
    description = Column(String(255), nullable=True)
    last_used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_ip_whitelist_org", "organization_id"),
    )

class RateLimit(Base):
    __tablename__ = "rate_limits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    endpoint = Column(String(255), nullable=False)
    requests_per_minute = Column(Integer, default=60, nullable=False)
    requests_per_hour = Column(Integer, default=1000, nullable=False)
    requests_per_day = Column(Integer, default=10000, nullable=False)
    burst_limit = Column(Integer, default=100, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_rate_limit_org_endpoint", "organization_id", "endpoint"),
    )

class BackupJob(Base):
    __tablename__ = "backup_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    status = Column(String(50), nullable=False, default="pending")
    file_size = Column(Integer, nullable=True)
    record_count = Column(Integer, nullable=True)
    backup_url = Column(String(500), nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_backup_org", "organization_id"),
    )

class ComplianceTask(Base):
    __tablename__ = "compliance_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="pending")
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_compliance_org", "organization_id"),
    )
