"""Authentication schemas"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str]
    token_type: str = "bearer"
    expires_in: int  # Seconds

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class TokenData(BaseModel):
    user_id: Optional[str] = None
    organization_id: Optional[str] = None
    email: Optional[str] = None
    scopes: list[str] = []
