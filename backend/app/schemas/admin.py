"""Admin schemas"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class TenantResponse(BaseModel):
    id: UUID
    name: str
    email: str
    created_at: datetime
    subscription_plan: str

class SystemMetricsResponse(BaseModel):
    total_users: int
    total_organizations: int
    total_appointments: int
    total_payments: int
    active_ai_sessions: int

class SubscriptionResponse(BaseModel):
    id: UUID
    organization_id: UUID
    plan: str
    status: str
    created_at: datetime
    expires_at: Optional[datetime] = None
