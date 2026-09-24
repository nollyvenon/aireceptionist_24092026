"""Customer model"""

from sqlalchemy import Column, String, DateTime, Boolean, Integer, JSON, Enum, ForeignKey, Index, Float
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import enum
import uuid

from database import Base

class CustomerStatus(str, enum.Enum):
    LEAD = "lead"
    PROSPECT = "prospect"
    CUSTOMER = "customer"
    INACTIVE = "inactive"

class CustomerSource(str, enum.Enum):
    WEBSITE = "website"
    REFERRAL = "referral"
    PHONE = "phone"
    EMAIL = "email"
    SOCIAL = "social"
    OTHER = "other"

class Customer(Base):
    __tablename__ = "customers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)

    # Personal info
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    avatar_url = Column(String(500), nullable=True)

    # Address
    address_1 = Column(String(255), nullable=True)
    address_2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(50), nullable=True)
    postal_code = Column(String(20), nullable=True)
    country = Column(String(2), nullable=True)

    # Business info
    company_name = Column(String(255), nullable=True)
    job_title = Column(String(100), nullable=True)
    industry = Column(String(100), nullable=True)

    # Status & source
    status = Column(Enum(CustomerStatus), default=CustomerStatus.LEAD, nullable=False)
    source = Column(Enum(CustomerSource), nullable=True)

    # Metrics
    lifetime_value_cents = Column(Integer, default=0, nullable=False)
    total_appointments = Column(Integer, default=0, nullable=False)
    completed_appointments = Column(Integer, default=0, nullable=False)
    cancelled_appointments = Column(Integer, default=0, nullable=False)
    no_show_count = Column(Integer, default=0, nullable=False)
    average_rating = Column(Float, nullable=True)

    # Tags and custom fields
    tags = Column(JSON, default=list, nullable=False)  # List of tags
    custom_fields = Column(JSON, default=dict, nullable=False)  # Custom field values

    # Contact info
    preferred_contact_method = Column(String(50), default="email", nullable=False)
    do_not_contact = Column(Boolean, default=False, nullable=False)

    # Timestamps
    first_contact_at = Column(DateTime, nullable=True)
    last_contact_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="customers")
    appointments = relationship("Appointment", back_populates="customer", cascade="all, delete-orphan")
    activities = relationship("Activity", foreign_keys="[Activity.customer_id]", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="customer", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="customer", cascade="all, delete-orphan")
    ai_conversations = relationship("AIConversation", back_populates="customer", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_customers_org_email", "organization_id", "email"),
        Index("idx_customers_status", "status"),
        Index("idx_customers_created", "created_at"),
        Index("idx_customers_ltv", "lifetime_value_cents"),
    )

    def get_full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    def get_lead_score(self) -> float:
        """Calculate lead score based on engagement and history"""
        score = 0.0

        # Completed appointments (5 points each)
        score += self.completed_appointments * 5

        # Payment history (1 point per $10)
        score += self.lifetime_value_cents / 1000

        # Average rating (10 points per star)
        if self.average_rating:
            score += self.average_rating * 10

        # Penalize no-shows
        score -= self.no_show_count * 10

        # Status boost
        if self.status == CustomerStatus.CUSTOMER:
            score += 20
        elif self.status == CustomerStatus.PROSPECT:
            score += 10

        return min(max(score, 0), 100)

    def __repr__(self) -> str:
        return f"<Customer {self.get_full_name()}>"
