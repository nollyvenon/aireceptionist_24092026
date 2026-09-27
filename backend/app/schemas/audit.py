"""Audit log schema models"""

from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime
from uuid import UUID


class AuditLogBase(BaseModel):
    action: str = Field(..., description="Action: CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT, EXPORT, IMPORT")
    resource_type: str
    resource_id: Optional[UUID] = None
    details: Optional[dict] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class AuditLogResponse(AuditLogBase):
    id: UUID
    organization_id: UUID
    user_id: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AuditSummaryResponse(BaseModel):
    total_actions: int
    by_action: dict[str, int]
    by_resource: dict[str, int]
    by_user: dict[str, int]
