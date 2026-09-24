"""Appointment schemas"""

from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from uuid import UUID

class AppointmentCreate(BaseModel):
    customer_id: UUID
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    duration_minutes: int = Field(..., gt=0)
    appointment_type: str = "appointment"
    location: Optional[str] = None
    meeting_url: Optional[str] = None
    meeting_provider: Optional[str] = None
    notes: Optional[str] = None
    price_cents: Optional[int] = None

    @validator("end_time")
    def end_after_start(cls, v, values):
        if "start_time" in values and v <= values["start_time"]:
            raise ValueError("End time must be after start time")
        return v

class AppointmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[str] = None
    location: Optional[str] = None
    meeting_url: Optional[str] = None
    notes: Optional[str] = None
    customer_rating: Optional[float] = Field(None, ge=1, le=5)

class AppointmentResponse(BaseModel):
    id: UUID
    customer_id: UUID
    title: str
    description: Optional[str]
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    status: str
    location: Optional[str]
    meeting_url: Optional[str]
    customer_rating: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True

class AppointmentListResponse(BaseModel):
    items: list[AppointmentResponse]
    total: int
    skip: int
    limit: int

class AvailabilitySlot(BaseModel):
    start_time: datetime
    end_time: datetime
    is_available: bool
