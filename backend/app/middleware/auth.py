"""Authentication utilities"""

from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from database import get_db
from app.services.auth_service import AuthService
from app.services.user_service import UserService


async def get_current_user(
    authorization: str = Header(None),
    token: str = None,
    db: Session = Depends(get_db)
):
    """Get current user from token in Authorization header or query parameter"""
    auth_token = None

    # Try to get token from Authorization header first
    if authorization:
        if authorization.startswith("Bearer "):
            auth_token = authorization[7:]
        else:
            auth_token = authorization

    # Fall back to token query parameter
    if not auth_token and token:
        auth_token = token

    if not auth_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No token provided"
        )

    token_data = AuthService.verify_token(auth_token)

    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    from uuid import UUID
    user = UserService.get_user(UUID(token_data.user_id), db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user


def check_admin_role(user):
    """Check if user has admin role"""
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required"
        )
    return user
