"""Customer schemas"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class CustomerCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    source: Optional[str] = None

class CustomerUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[list[str]] = None

class CustomerResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: str
    phone: Optional[str]
    company_name: Optional[str]
    status: str
    lifetime_value_cents: int
    total_appointments: int
    average_rating: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True

class CustomerListResponse(BaseModel):
    items: list[CustomerResponse]
    total: int
    skip: int
    limit: int
