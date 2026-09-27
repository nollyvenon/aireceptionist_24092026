"""Segment schema models"""

from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime
from uuid import UUID


class SegmentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    criteria: Optional[dict] = Field(None, description="JSON criteria for segment")
    is_active: bool = Field(default=True)


class SegmentCreate(SegmentBase):
    pass


class SegmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    criteria: Optional[dict] = None
    is_active: Optional[bool] = None


class SegmentResponse(SegmentBase):
    id: UUID
    organization_id: UUID
    member_ids: Optional[list[UUID]] = None
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class SegmentListResponse(BaseModel):
    items: list[SegmentResponse]
    total: int
    skip: int
    limit: int
