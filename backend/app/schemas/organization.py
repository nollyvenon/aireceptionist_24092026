"""Organization schemas"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class OrganizationCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    website: Optional[str] = None
    timezone: str = "UTC"
    industry: Optional[str] = None

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    timezone: Optional[str] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None

class OrganizationResponse(BaseModel):
    id: UUID
    name: str
    email: str
    phone: Optional[str]
    website: Optional[str]
    logo_url: Optional[str]
    plan: str
    timezone: str
    created_at: datetime

    class Config:
        from_attributes = True
