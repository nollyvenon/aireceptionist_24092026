"""User service"""

from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from .auth_service import AuthService

class UserService:
    @staticmethod
    def create_user(
        user_data: UserCreate,
        organization_id: UUID,
        db: Session
    ) -> User:
        """Create new user"""
        # Check if email exists
        existing = db.query(User).filter(User.email == user_data.email).first()
        if existing:
            raise ValueError("Email already registered")

        # Hash password
        hashed_password = AuthService.hash_password(user_data.password)

        # Create user
        db_user = User(
            organization_id=organization_id,
            email=user_data.email,
            password_hash=hashed_password,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            phone=user_data.phone,
            role=user_data.role,
        )

        try:
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            return db_user
        except IntegrityError:
            db.rollback()
            raise ValueError("User creation failed")

    @staticmethod
    def get_user(user_id: UUID, db: Session) -> User:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_user_by_email(email: str, db: Session) -> User:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def update_user(
        user_id: UUID,
        user_data: UserUpdate,
        db: Session
    ) -> User:
        """Update user"""
        db_user = UserService.get_user(user_id, db)
        if not db_user:
            raise ValueError("User not found")

        update_data = user_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)

        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def deactivate_user(user_id: UUID, db: Session) -> User:
        """Deactivate user"""
        db_user = UserService.get_user(user_id, db)
        if not db_user:
            raise ValueError("User not found")

        db_user.is_active = False
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def list_organization_users(
        organization_id: UUID,
        db: Session,
        skip: int = 0,
        limit: int = 50
    ) -> tuple[list[User], int]:
        """List users in organization"""
        query = db.query(User).filter(User.organization_id == organization_id)
        total = query.count()
        users = query.offset(skip).limit(limit).all()
        return users, total
