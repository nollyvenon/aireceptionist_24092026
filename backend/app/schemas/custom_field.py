"""Custom field schema models"""

from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime
from uuid import UUID


class CustomFieldBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    field_type: str = Field(..., description="Field type: text, email, phone, number, date, select, checkbox")
    description: Optional[str] = None
    is_required: bool = Field(default=False)
    is_active: bool = Field(default=True)


class CustomFieldCreate(CustomFieldBase):
    pass


class CustomFieldUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    is_required: Optional[bool] = None
    is_active: Optional[bool] = None


class CustomFieldResponse(CustomFieldBase):
    id: UUID
    organization_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class FieldValueBase(BaseModel):
    value: str


class FieldValueCreate(FieldValueBase):
    resource_id: UUID
    field_id: UUID


class FieldValueResponse(FieldValueBase):
    id: UUID
    organization_id: UUID
    resource_id: UUID
    field_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
