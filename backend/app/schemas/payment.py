"""Payment schemas"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class PaymentCreate(BaseModel):
    customer_id: UUID
    appointment_id: Optional[UUID] = None
    amount_cents: int = Field(..., gt=0)
    currency: str = "USD"
    payment_method: str
    description: Optional[str] = None

class PaymentResponse(BaseModel):
    id: UUID
    customer_id: UUID
    appointment_id: Optional[UUID]
    amount_cents: int
    currency: str
    status: str
    payment_method: str
    paid_at: Optional[datetime]
    failed_at: Optional[datetime]
    is_refunded: bool
    refunded_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

class PaymentListResponse(BaseModel):
    items: list[PaymentResponse]
    total: int
    skip: int
    limit: int

class PaymentIntentResponse(BaseModel):
    client_secret: str
    payment_intent_id: str
    amount_cents: int
    currency: str

class PaymentUpdate(BaseModel):
    status: Optional[str] = None
    description: Optional[str] = None

class RefundRequest(BaseModel):
    reason: str = Field(..., max_length=500)
    amount_cents: Optional[int] = None  # If not provided, refund full amount
