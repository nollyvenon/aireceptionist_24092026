"""Automation schemas"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID

class ActionConfig(BaseModel):
    """Configuration for automation actions"""
    action_type: str
    parameters: Dict[str, Any] = {}

class AutomationCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    trigger_type: str
    trigger_config: Dict[str, Any]
    actions: List[ActionConfig]
    is_active: bool = True

class AutomationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    trigger_type: Optional[str] = None
    trigger_config: Optional[Dict[str, Any]] = None
    actions: Optional[List[ActionConfig]] = None
    is_active: Optional[bool] = None

class AutomationResponse(BaseModel):
    id: UUID
    organization_id: UUID
    name: str
    description: Optional[str]
    trigger_type: str
    trigger_config: Dict[str, Any]
    actions: List[ActionConfig]
    is_active: bool
    run_count: int
    last_run_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AutomationListResponse(BaseModel):
    items: List[AutomationResponse]
    total: int
    skip: int
    limit: int

class AutomationTestRequest(BaseModel):
    trigger_data: Dict[str, Any]
