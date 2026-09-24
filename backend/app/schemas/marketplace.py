"""Marketplace schemas"""

from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class IntegrationResponse(BaseModel):
    id: UUID
    name: str
    description: str
    icon_url: Optional[str] = None
    installed: bool

class APIKeyCreate(BaseModel):
    name: str
    scopes: List[str]

class APIKeyResponse(BaseModel):
    id: UUID
    name: str
    key: str
    created_at: datetime

class WebhookCreate(BaseModel):
    url: HttpUrl
    events: List[str]

class WebhookResponse(BaseModel):
    id: UUID
    url: str
    events: List[str]
    active: bool
    created_at: datetime
