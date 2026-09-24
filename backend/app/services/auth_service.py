"""Authentication service"""

from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID
import os

from fastapi import Depends
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import jwt

from database import get_db
from app.models.user import User
from app.models.organization import Organization
from app.schemas.auth import LoginRequest, TokenData

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using bcrypt"""
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def create_access_token(
        data: dict,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    @staticmethod
    def create_refresh_token(data: dict) -> str:
        """Create JWT refresh token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    @staticmethod
    def verify_token(token: str) -> Optional[TokenData]:
        """Verify JWT token and return decoded data"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id is None:
                return None
            return TokenData(user_id=user_id, email=payload.get("email"))
        except jwt.JWTError:
            return None

    @staticmethod
    def authenticate_user(
        email: str,
        password: str,
        db: Session
    ) -> Optional[User]:
        """Authenticate user by email and password"""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not AuthService.verify_password(password, user.password_hash):
            return None
        return user

    @staticmethod
    def get_current_user(
        token: str,
        db: Session = Depends(get_db)
    ) -> User:
        """Get current user from JWT token"""
        token_data = AuthService.verify_token(token)
        if token_data is None:
            raise Exception("Invalid token")

        user = db.query(User).filter(User.id == UUID(token_data.user_id)).first()
        if user is None:
            raise Exception("User not found")

        if not user.is_active:
            raise Exception("User is inactive")

        return user

    @staticmethod
    def verify_organization_access(
        user: User,
        organization_id: UUID,
        db: Session
    ) -> bool:
        """Verify user has access to organization"""
        return user.organization_id == organization_id
