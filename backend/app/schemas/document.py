"""Document schema models"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class DocumentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    document_type: str = Field(..., max_length=50)
    file_url: str
    file_size: int = Field(default=0, ge=0)
    description: Optional[str] = None


class DocumentCreate(DocumentBase):
    uploaded_by: UUID


class DocumentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    file_url: Optional[str] = None
    file_size: Optional[int] = Field(None, ge=0)


class DocumentResponse(DocumentBase):
    id: UUID
    organization_id: UUID
    uploaded_by: UUID
    download_count: Optional[int] = 0
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    items: list[DocumentResponse]
    total: int
    skip: int
    limit: int


class DocumentSummaryResponse(BaseModel):
    total_documents: int
    total_size_bytes: int
    total_size_mb: float
    total_downloads: int
    average_downloads_per_document: float
    by_type: dict[str, int]
