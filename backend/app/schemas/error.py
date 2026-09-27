"""Error response schema models"""

from pydantic import BaseModel, Field
from typing import Optional, Any


class ErrorResponse(BaseModel):
    status_code: int
    error: str
    message: str
    detail: Optional[str] = None
    timestamp: str = Field(..., description="ISO format timestamp")
    path: Optional[str] = None
    request_id: Optional[str] = None


class ValidationError(BaseModel):
    field: str
    message: str
    value: Optional[Any] = None


class ValidationErrorResponse(BaseModel):
    status_code: int = 422
    error: str = "Validation Error"
    message: str
    errors: list[ValidationError]
    timestamp: str
    path: Optional[str] = None
