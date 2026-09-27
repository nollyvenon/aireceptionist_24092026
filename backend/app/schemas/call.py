"""Call schema models"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class CallBase(BaseModel):
    from_number: str = Field(..., max_length=20)
    to_number: str = Field(..., max_length=20)
    call_type: str = Field(..., description="Call type: inbound or outbound")
    status: str = Field(default="completed", description="Call status: ringing, connected, completed, failed, missed")
    duration: int = Field(default=0, ge=0)
    recording_url: Optional[str] = None
    transcript: Optional[str] = None
    notes: Optional[str] = None


class CallCreate(CallBase):
    pass


class CallResponse(CallBase):
    id: UUID
    organization_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class CallListResponse(BaseModel):
    items: list[CallResponse]
    total: int
    skip: int
    limit: int


class CallSummaryResponse(BaseModel):
    total: int
    completed: int
    failed: int
    missed: int
    average_duration: float
    inbound: int
    outbound: int
    success_rate: float
