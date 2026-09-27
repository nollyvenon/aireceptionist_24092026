"""Automation schemas"""

from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

class ActionConfig(BaseModel):
    type: str
    config: Dict[str, Any] = {}

class AutomationCreate(BaseModel):
    name: str
    trigger: str
    actions: List[ActionConfig]
    enabled: bool = True

class AutomationUpdate(BaseModel):
    name: Optional[str] = None
    trigger: Optional[str] = None
    actions: Optional[List[ActionConfig]] = None
    enabled: Optional[bool] = None

class AutomationResponse(BaseModel):
    id: UUID
    name: str
    trigger: str
    actions: List[ActionConfig]
    enabled: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
