"""Referral schema models"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class ReferralBase(BaseModel):
    referrer_id: UUID
    referred_customer_id: UUID
    reward_amount: Decimal = Field(default=0, ge=0, decimal_places=2)
    reward_type: Optional[str] = Field(None, max_length=50)
    status: str = Field(default="pending", description="Status: pending, completed, rejected")


class ReferralCreate(ReferralBase):
    pass


class ReferralUpdate(BaseModel):
    status: Optional[str] = None
    reward_amount: Optional[Decimal] = Field(None, ge=0, decimal_places=2)


class ReferralResponse(ReferralBase):
    id: UUID
    organization_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class ReferralListResponse(BaseModel):
    items: list[ReferralResponse]
    total: int
    skip: int
    limit: int


class ReferralSummaryResponse(BaseModel):
    total_referrals: int
    completed: int
    pending: int
    rejected: int
    total_rewards_given: Decimal
    completion_rate: float
