"""CRM models - Leads, Contacts, Deals"""

from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Float, Integer, Text, Boolean, Index
from sqlalchemy.dialects.postgresql import UUID, JSON
from datetime import datetime
import enum
import uuid

from database import Base

class LeadStatus(str, enum.Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    NEGOTIATION = "negotiation"
    CLOSED_WON = "closed_won"
    CLOSED_LOST = "closed_lost"

class DealStatus(str, enum.Enum):
    PROSPECT = "prospect"
    QUALIFICATION = "qualification"
    PROPOSAL = "proposal"
    NEGOTIATION = "negotiation"
    CLOSED_WON = "closed_won"
    CLOSED_LOST = "closed_lost"

class Lead(Base):
    __tablename__ = "leads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    company = Column(String(255), nullable=True)
    title = Column(String(100), nullable=True)
    status = Column(Enum(LeadStatus), default=LeadStatus.NEW, nullable=False)
    lead_score = Column(Float, default=0.0, nullable=False)
    assigned_to_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    notes = Column(Text, nullable=True)
    source = Column(String(50), nullable=True)
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_leads_org_status", "organization_id", "status"),
        Index("idx_leads_assigned", "assigned_to_id"),
        Index("idx_leads_created", "created_at"),
    )

class Contact(Base):
    __tablename__ = "contacts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    title = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    is_primary = Column(Boolean, default=False, nullable=False)
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_contacts_org", "organization_id"),
        Index("idx_contacts_customer", "customer_id"),
        Index("idx_contacts_email", "email"),
    )

class Deal(Base):
    __tablename__ = "deals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False)
    name = Column(String(255), nullable=False)
    value = Column(Float, nullable=False)
    status = Column(Enum(DealStatus), default=DealStatus.PROSPECT, nullable=False)
    assigned_to_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    expected_close_date = Column(DateTime, nullable=True)
    close_date = Column(DateTime, nullable=True)
    probability = Column(Float, default=0.0, nullable=False)
    notes = Column(Text, nullable=True)
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_deals_org_status", "organization_id", "status"),
        Index("idx_deals_customer", "customer_id"),
        Index("idx_deals_assigned", "assigned_to_id"),
    )
