"""Messaging schemas"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class SendSMSRequest(BaseModel):
    phone: str
    message: str
    organization_id: UUID

class SendEmailRequest(BaseModel):
    to: EmailStr
    subject: str
    body: str
    organization_id: UUID

class SendWhatsAppRequest(BaseModel):
    phone: str
    message: str
    organization_id: UUID

class CampaignCreate(BaseModel):
    name: str
    message: str
    channel: str
    scheduled_for: Optional[datetime] = None

class CampaignResponse(BaseModel):
    id: UUID
    name: str
    message: str
    channel: str
    created_at: datetime

    class Config:
        from_attributes = True
