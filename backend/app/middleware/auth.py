"""Authentication utilities"""

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from app.services.auth_service import AuthService
from app.services.user_service import UserService


async def get_current_user(token: str, db: Session = Depends(get_db)):
    """Get current user from token"""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No token provided"
        )

    # Remove "Bearer " prefix if present
    if token.startswith("Bearer "):
        token = token[7:]

    token_data = AuthService.verify_token(token)

    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    user = UserService.get_user(token_data.user_id, db)
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
