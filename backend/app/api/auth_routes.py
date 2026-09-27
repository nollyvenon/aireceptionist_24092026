"""Authentication API routes"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from database import get_db
from app.schemas.auth import (
    LoginRequest, LoginResponse, RefreshTokenRequest,
    ChangePasswordRequest, PasswordResetRequest, TwoFactorVerifyRequest
)
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.services.auth_service import AuthService, ACCESS_TOKEN_EXPIRE_MINUTES
from app.services.user_service import UserService
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Register new user"""
    try:
        from uuid import uuid4
        user = UserService.create_user(user_data, uuid4(), db)
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
async def get_me(
    current_user = Depends(get_current_user)
):
    """Get current user info"""
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_me(
    update_data: UserUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    user = current_user
    if update_data.first_name:
        user.first_name = update_data.first_name
    if update_data.last_name:
        user.last_name = update_data.last_name

    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/logout")
async def logout(
    current_user = Depends(get_current_user)
):
    """Logout user"""
    return {"message": "Logged out successfully"}

@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    if not AuthService.verify_password(request.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    current_user.password_hash = AuthService.hash_password(request.new_password)
    db.add(current_user)
    db.commit()

    return {"message": "Password changed successfully"}

@router.post("/request-password-reset")
async def request_password_reset(
    request: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """Request password reset"""
    user = UserService.get_user_by_email(request.email, db)
    if not user:
        return {"message": "If user exists, reset email will be sent"}

    return {"message": "Password reset email sent"}

@router.post("/2fa/enable")
async def enable_2fa(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enable 2FA for user"""
    import pyotp
    secret = pyotp.random_base32()
    current_user.two_factor_secret = secret
    db.add(current_user)
    db.commit()

    return {"secret": secret, "message": "2FA enabled"}

@router.post("/2fa/verify")
async def verify_2fa(
    request: TwoFactorVerifyRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify 2FA code"""
    import pyotp
    if not current_user.two_factor_secret:
        raise HTTPException(status_code=400, detail="2FA not enabled")

    totp = pyotp.TOTP(current_user.two_factor_secret)
    if not totp.verify(request.code):
        raise HTTPException(status_code=400, detail="Invalid code")

    return {"message": "2FA verified"}
