"""Message schemas"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class MessageCreate(BaseModel):
    recipient: str
    subject: Optional[str] = None
    body: str
    channel: str = "sms"
    metadata: Optional[dict] = None


class MessageResponse(BaseModel):
    id: UUID
    organization_id: UUID
    customer_id: Optional[UUID]
    channel: str
    recipient: str
    subject: Optional[str]
    body: str
    status: str
    delivery_timestamp: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class MessageListResponse(BaseModel):
    items: List[MessageResponse]
    total: int
    skip: int
    limit: int


class MessageTemplateCreate(BaseModel):
    name: str
    channel: str
    description: Optional[str] = None
    subject: Optional[str] = None
    body: str
    variables: Optional[List[str]] = []


class MessageTemplateResponse(BaseModel):
    id: UUID
    organization_id: UUID
    name: str
    channel: str
    description: Optional[str]
    subject: Optional[str]
    body: str
    variables: List[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TemplateCreate(BaseModel):
    name: str
    channel: str
    body: str
    variables: Optional[List[str]] = []


class CampaignCreate(BaseModel):
    name: str
    description: Optional[str] = None
    channel: str
    template_id: Optional[UUID] = None
    target_segment: Optional[str] = None
    target_count: int = 0
    scheduled_at: Optional[datetime] = None


class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class CampaignResponse(BaseModel):
    id: UUID
    organization_id: UUID
    name: str
    channel: str
    status: str
    target_count: int
    sent_count: int
    delivered_count: int
    failed_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class CampaignDetailResponse(BaseModel):
    id: UUID
    organization_id: UUID
    template_id: Optional[UUID]
    name: str
    description: Optional[str]
    channel: str
    target_segment: Optional[str]
    target_count: int
    status: str
    sent_count: int
    delivered_count: int
    failed_count: int
    bounced_count: int
    opened_count: Optional[int]
    clicked_count: Optional[int]
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True
