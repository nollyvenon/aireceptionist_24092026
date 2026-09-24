"""Payment model"""

from sqlalchemy import Column, String, DateTime, Boolean, Integer, Enum, ForeignKey, Index, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import enum
import uuid

from database import Base

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    DISPUTED = "disputed"

class PaymentMethod(str, enum.Enum):
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    BANK_TRANSFER = "bank_transfer"
    PAYPAL = "paypal"
    STRIPE = "stripe"
    OTHER = "other"

class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    appointment_id = Column(UUID(as_uuid=True), ForeignKey("appointments.id"), nullable=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False)

    # Payment details
    amount_cents = Column(Integer, nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    payment_method = Column(Enum(PaymentMethod), nullable=False)

    # Status
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)

    # Stripe integration
    stripe_payment_intent_id = Column(String(255), nullable=True)
    stripe_charge_id = Column(String(255), nullable=True)
    stripe_customer_id = Column(String(255), nullable=True)

    # Payment info
    last_four = Column(String(4), nullable=True)  # Last 4 digits of card
    card_brand = Column(String(50), nullable=True)  # visa, mastercard, etc

    # Description
    description = Column(String(500), nullable=True)
    reference = Column(String(100), nullable=True)  # Invoice number, order ID, etc

    # Timing
    paid_at = Column(DateTime, nullable=True)
    failed_at = Column(DateTime, nullable=True)
    failure_reason = Column(Text, nullable=True)

    # Refund
    is_refunded = Column(Boolean, default=False, nullable=False)
    refund_amount_cents = Column(Integer, nullable=True)
    refund_reason = Column(String(500), nullable=True)
    refund_stripe_id = Column(String(255), nullable=True)
    refunded_at = Column(DateTime, nullable=True)

    # Metadata
    custom_metadata = Column(String(1000), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="payments")
    customer = relationship("Customer", back_populates="payments")
    appointment = relationship("Appointment", back_populates="payment", uselist=False, foreign_keys=[appointment_id])

    __table_args__ = (
        Index("idx_payments_org_status", "organization_id", "status"),
        Index("idx_payments_customer", "customer_id"),
        Index("idx_payments_stripe", "stripe_payment_intent_id"),
        Index("idx_payments_created", "created_at"),
    )

    def get_amount_dollars(self) -> float:
        return self.amount_cents / 100

    def __repr__(self) -> str:
        return f"<Payment {self.id} - {self.get_amount_dollars()} {self.currency}>"
