"""Voicemail schema models"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class VoicemailBase(BaseModel):
    caller_number: str = Field(..., max_length=20)
    duration: int = Field(default=0, ge=0)
    audio_url: Optional[str] = None
    transcript: Optional[str] = None


class VoicemailCreate(VoicemailBase):
    pass


class VoicemailResponse(VoicemailBase):
    id: UUID
    organization_id: UUID
    is_listened: bool = Field(default=False)
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class VoicemailListResponse(BaseModel):
    items: list[VoicemailResponse]
    total: int
    skip: int
    limit: int


class VoicemailSummaryResponse(BaseModel):
    total: int
    unlistened: int
    listened: int
    total_duration_seconds: int
    average_duration_seconds: float
