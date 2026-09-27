"""Subscription model"""

from sqlalchemy import Column, String, DateTime, Boolean, Integer, Enum, ForeignKey, Index, Text, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import enum
import uuid

from database import Base


class SubscriptionPlan(str, enum.Enum):
    STARTER = "starter"
    GROWTH = "growth"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"


class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    TRIAL = "trial"
    SUSPENDED = "suspended"
    CANCELLED = "cancelled"


class BillingCycle(str, enum.Enum):
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUAL = "annual"


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)

    # Plan information
    plan = Column(Enum(SubscriptionPlan), nullable=False)
    billing_cycle = Column(Enum(BillingCycle), default=BillingCycle.MONTHLY, nullable=False)

    # Pricing
    price_cents = Column(Integer, nullable=False)
    currency = Column(String(3), default="USD", nullable=False)

    # Status
    status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE, nullable=False)

    # Limits (from plan)
    max_users = Column(Integer, nullable=False)
    max_customers = Column(Integer, nullable=False)
    max_appointments_per_month = Column(Integer, nullable=True)
    max_api_calls_per_month = Column(Integer, nullable=True)
    storage_gb = Column(Float, default=10.0, nullable=False)

    # Features
    features = Column(JSON, default=list, nullable=False)  # List of enabled features

    # Billing information
    stripe_subscription_id = Column(String(255), nullable=True)
    auto_renew = Column(Boolean, default=True, nullable=False)
    payment_method = Column(String(50), nullable=True)

    # Trial information
    trial_ends_at = Column(DateTime, nullable=True)
    is_trial = Column(Boolean, default=False, nullable=False)

    # Dates
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    current_period_start = Column(DateTime, default=datetime.utcnow, nullable=False)
    current_period_end = Column(DateTime, nullable=False)
    cancelled_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="subscription")

    __table_args__ = (
        Index("idx_subscriptions_org", "organization_id"),
        Index("idx_subscriptions_status", "status"),
        Index("idx_subscriptions_plan", "plan"),
    )

    def is_active(self) -> bool:
        """Check if subscription is active"""
        return self.status == SubscriptionStatus.ACTIVE and datetime.utcnow() < self.current_period_end

    def is_trial_active(self) -> bool:
        """Check if trial is still active"""
        if not self.is_trial or not self.trial_ends_at:
            return False
        return datetime.utcnow() < self.trial_ends_at

    def days_until_renewal(self) -> int:
        """Days until subscription renewal"""
        if not self.current_period_end:
            return 0
        return (self.current_period_end - datetime.utcnow()).days

    def __repr__(self) -> str:
        return f"<Subscription {self.plan} - {self.status}>"
