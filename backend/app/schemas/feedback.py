"""Feedback schema models"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class FeedbackBase(BaseModel):
    customer_id: Optional[UUID] = None
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None
    feedback_type: Optional[str] = Field(None, max_length=50)


class FeedbackCreate(FeedbackBase):
    pass


class FeedbackUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = None
    feedback_type: Optional[str] = Field(None, max_length=50)


class FeedbackResponse(FeedbackBase):
    id: UUID
    organization_id: UUID
    helpful_count: Optional[int] = 0
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class FeedbackListResponse(BaseModel):
    items: list[FeedbackResponse]
    total: int
    skip: int
    limit: int


class FeedbackSummaryResponse(BaseModel):
    total_feedback: int
    average_rating: float
    rating_distribution: dict[int, int]
