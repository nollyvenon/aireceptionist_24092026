"""Settings model for organization configuration"""

from sqlalchemy import Column, String, DateTime, JSON, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from database import Base

class Settings(Base):
    __tablename__ = "settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), unique=True, nullable=False)

    # AI Configuration
    ai_model = Column(String(100), default="gpt-4", nullable=False)  # gpt-4, claude-3, gemini-pro
    ai_temperature = Column(String(5), default="0.7", nullable=False)
    ai_max_tokens = Column(String(5), default="500", nullable=False)
    ai_system_prompt = Column(String(5000), nullable=True)

    # Stripe Configuration
    stripe_public_key = Column(String(500), nullable=True)
    stripe_secret_key = Column(String(500), nullable=True)  # Encrypted
    stripe_webhook_secret = Column(String(500), nullable=True)  # Encrypted

    # Twilio Configuration
    twilio_account_sid = Column(String(500), nullable=True)
    twilio_auth_token = Column(String(500), nullable=True)  # Encrypted
    twilio_phone_number = Column(String(20), nullable=True)
    twilio_webhook_url = Column(String(500), nullable=True)

    # Google Calendar
    google_client_id = Column(String(500), nullable=True)
    google_client_secret = Column(String(500), nullable=True)  # Encrypted
    google_calendar_sync_enabled = Column(String(5), default="false", nullable=False)

    # Outlook Calendar
    outlook_client_id = Column(String(500), nullable=True)
    outlook_client_secret = Column(String(500), nullable=True)  # Encrypted
    outlook_tenant_id = Column(String(500), nullable=True)

    # SendGrid Configuration
    sendgrid_api_key = Column(String(500), nullable=True)  # Encrypted
    sendgrid_from_email = Column(String(255), nullable=True)

    # AWS Configuration
    aws_access_key_id = Column(String(500), nullable=True)  # Encrypted
    aws_secret_access_key = Column(String(500), nullable=True)  # Encrypted
    aws_region = Column(String(50), default="us-east-1", nullable=False)
    aws_s3_bucket = Column(String(255), nullable=True)

    # Notification Settings
    notification_email_enabled = Column(String(5), default="true", nullable=False)
    notification_sms_enabled = Column(String(5), default="false", nullable=False)
    notification_whatsapp_enabled = Column(String(5), default="false", nullable=False)

    # Business Rules
    min_booking_hours_advance = Column(String(3), default="1", nullable=False)
    max_booking_days_advance = Column(String(3), default="30", nullable=False)
    cancellation_hours_before = Column(String(3), default="24", nullable=False)
    show_customer_timezone = Column(String(5), default="true", nullable=False)

    # Feature Flags
    features = Column(JSON, default=dict, nullable=False)  # Feature toggle flags

    # Custom Branding
    logo_url = Column(String(500), nullable=True)
    primary_color = Column(String(7), default="#2563eb", nullable=False)
    secondary_color = Column(String(7), default="#f97316", nullable=False)

    # API Configuration
    api_rate_limit = Column(String(10), default="1000", nullable=False)  # Per hour

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    organization = relationship("Organization")

    __table_args__ = (
        Index("idx_settings_org", "organization_id"),
    )

    def __repr__(self) -> str:
        return f"<Settings {self.organization_id}>"
