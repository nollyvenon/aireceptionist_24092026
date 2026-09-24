"""Authentication API routes"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from database import get_db
from app.schemas.auth import LoginRequest, LoginResponse, RefreshTokenRequest
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import AuthService, ACCESS_TOKEN_EXPIRE_MINUTES
from app.services.user_service import UserService

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
async def register(
    email: str,
    password: str,
    first_name: str,
    last_name: str,
    organization_id: str,
    db: Session = Depends(get_db)
):
    """Register new user"""
    try:
        from uuid import UUID
        user_data = UserCreate(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
        user = UserService.create_user(user_data, UUID(organization_id), db)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=LoginResponse)
async def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    """Login with email and password"""
    user = AuthService.authenticate_user(credentials.email, credentials.password, db)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Create tokens
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = AuthService.create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires
    )

    refresh_token = AuthService.create_refresh_token(
        data={"sub": str(user.id)}
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.post("/refresh", response_model=LoginResponse)
async def refresh_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """Refresh access token"""
    token_data = AuthService.verify_token(request.refresh_token)

    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    user = UserService.get_user(token_data.user_id, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    # Create new access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = AuthService.create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "refresh_token": request.refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.post("/verify-email")
async def verify_email(
    token: str,
    db: Session = Depends(get_db)
):
    """Verify email address"""
    token_data = AuthService.verify_token(token)

    if token_data is None:
        raise HTTPException(status_code=400, detail="Invalid token")

    user = UserService.get_user(token_data.user_id, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_email_verified = True
    db.add(user)
    db.commit()

    return {"message": "Email verified successfully"}

@router.get("/me", response_model=UserResponse)
async def get_current_user(
    token: str,
    db: Session = Depends(get_db)
):
    """Get current user info"""
    token_data = AuthService.verify_token(token)

    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    user = UserService.get_user(token_data.user_id, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
