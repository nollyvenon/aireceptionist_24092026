"""Message and campaign schemas"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

class MessageCreate(BaseModel):
    customer_id: Optional[UUID] = None
    campaign_id: Optional[UUID] = None
    channel: str
    recipient: str
    subject: Optional[str] = None
    body: str
    extra_data: Dict[str, Any] = {}

class MessageResponse(BaseModel):
    id: UUID
    organization_id: UUID
    customer_id: Optional[UUID]
    campaign_id: Optional[UUID]
    channel: str
    recipient: str
    subject: Optional[str]
    body: str
    status: str
    delivery_timestamp: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MessageListResponse(BaseModel):
    items: List[MessageResponse]
    total: int
    skip: int
    limit: int

class TemplateCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    channel: str
    description: Optional[str] = None
    subject: Optional[str] = None
    body: str = Field(..., min_length=1)
    variables: List[str] = []

class TemplateResponse(BaseModel):
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
    updated_at: datetime

    class Config:
        from_attributes = True

class CampaignCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    channel: str
    template_id: Optional[UUID] = None
    target_segment: Optional[str] = None
    target_count: int = 0
    scheduled_at: Optional[datetime] = None

class CampaignResponse(BaseModel):
    id: UUID
    organization_id: UUID
    template_id: Optional[UUID]
    name: str
    description: Optional[str]
    channel: str
    target_segment: Optional[str]
    target_count: int
    status: str
    scheduled_at: Optional[datetime]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    sent_count: int
    delivered_count: int
    failed_count: int
    bounced_count: int
    opened_count: Optional[int]
    clicked_count: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CampaignListResponse(BaseModel):
    items: List[CampaignResponse]
    total: int
    skip: int
    limit: int
