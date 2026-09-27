"""Deal schema models"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class DealBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    customer_id: Optional[UUID] = None
    value: Decimal = Field(..., ge=0, decimal_places=2)
    probability: Optional[int] = Field(None, ge=0, le=100)
    status: str = Field(default="prospect", description="Deal status")
    expected_close_date: Optional[datetime] = None
    description: Optional[str] = None


class DealCreate(DealBase):
    pass


class DealUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    customer_id: Optional[UUID] = None
    value: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    probability: Optional[int] = Field(None, ge=0, le=100)
    status: Optional[str] = None
    expected_close_date: Optional[datetime] = None
    description: Optional[str] = None


class DealResponse(DealBase):
    id: UUID
    organization_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]
    closed_date: Optional[datetime]

    class Config:
        from_attributes = True


class DealListResponse(BaseModel):
    items: list[DealResponse]
    total: int
    skip: int
    limit: int
