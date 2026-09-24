"""Subscription model"""

from sqlalchemy import Column, String, DateTime, Boolean, JSON, ForeignKey, Index, Enum, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import enum
import uuid

from database import Base


class SubscriptionPlan(str, enum.Enum):
    FREE = "free"
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"


class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class BillingCycle(str, enum.Enum):
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUAL = "annual"


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)

    # Plan information
    plan = Column(Enum(SubscriptionPlan), default=SubscriptionPlan.FREE, nullable=False)
    status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE, nullable=False)
    billing_cycle = Column(Enum(BillingCycle), default=BillingCycle.MONTHLY, nullable=False)

    # Pricing
    amount_cents = Column(Integer, default=0, nullable=False)
    currency = Column(String(3), default="USD", nullable=False)

    # Trial information
    trial_started_at = Column(DateTime, nullable=True)
    trial_ended_at = Column(DateTime, nullable=True)
    trial_active = Column(Boolean, default=False, nullable=False)

    # Billing dates
    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    next_billing_date = Column(DateTime, nullable=True)

    # Cancellation
    cancelled_at = Column(DateTime, nullable=True)
    cancellation_reason = Column(String(500), nullable=True)

    # Features and limits
    features = Column(JSON, default=dict, nullable=False)  # Feature flags and limits
    usage_data = Column(JSON, default=dict, nullable=False)  # Current usage metrics

    # Payment information
    payment_method = Column(String(50), nullable=True)
    external_subscription_id = Column(String(255), nullable=True)  # Stripe/PayPal subscription ID

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

    def __repr__(self) -> str:
        return f"<Subscription {self.plan} for {self.organization_id}>"
