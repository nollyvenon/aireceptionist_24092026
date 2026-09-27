"""Organization service"""

from uuid import UUID
from sqlalchemy.orm import Session

from app.models.organization import Organization
from app.models.settings import Settings
from app.models.user import User
from app.schemas.organization import OrganizationCreate, OrganizationUpdate

class OrganizationService:
    @staticmethod
    def create_organization(
        org_data: OrganizationCreate,
        db: Session
    ) -> Organization:
        """Create new organization"""
        # Create slug from name
        slug = org_data.name.lower().replace(" ", "-")

        db_org = Organization(
            name=org_data.name,
            slug=slug,
            email=org_data.email,
            phone=org_data.phone,
            website=org_data.website,
            timezone=org_data.timezone,
            industry=org_data.industry,
        )

        db.add(db_org)
        db.commit()

        # Create default settings
        settings = Settings(organization_id=db_org.id)
        db.add(settings)
        db.commit()

        db.refresh(db_org)
        return db_org

    @staticmethod
    def get_organization(org_id: UUID, db: Session) -> Organization:
        """Get organization by ID"""
        return db.query(Organization).filter(Organization.id == org_id).first()

    @staticmethod
    def update_organization(
        org_id: UUID,
        org_data: OrganizationUpdate,
        db: Session
    ) -> Organization:
        """Update organization"""
        db_org = OrganizationService.get_organization(org_id, db)
        if not db_org:
            raise ValueError("Organization not found")

        update_data = org_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_org, field, value)

        db.add(db_org)
        db.commit()
        db.refresh(db_org)
        return db_org

    @staticmethod
    def get_organization_settings(org_id: UUID, db: Session) -> Settings:
        """Get organization settings"""
        return db.query(Settings).filter(Settings.organization_id == org_id).first()

    @staticmethod
    def update_organization_settings(
        org_id: UUID,
        settings_data: dict,
        db: Session
    ) -> Settings:
        """Update organization settings"""
        settings = OrganizationService.get_organization_settings(org_id, db)
        if not settings:
            raise ValueError("Settings not found")

        for key, value in settings_data.items():
            if hasattr(settings, key) and value is not None:
                setattr(settings, key, value)

        db.add(settings)
        db.commit()
        db.refresh(settings)
        return settings

    @staticmethod
    def get_organization_members(org_id: UUID, db: Session) -> list[dict]:
        """Get organization members"""
        members = db.query(User).filter(User.organization_id == org_id).all()
        return [
            {
                "id": str(m.id),
                "email": m.email,
                "first_name": m.first_name,
                "last_name": m.last_name,
                "role": m.role.value if hasattr(m.role, 'value') else str(m.role),
                "is_active": m.is_active,
            }
            for m in members
        ]

    @staticmethod
    def invite_member(
        org_id: UUID,
        email: str,
        role: str,
        db: Session
    ) -> dict:
        """Invite a new member to organization"""
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            raise ValueError("User with this email already exists")

        # In production, this would send an email invitation
        # For now, just return success
        return {"message": "Invitation sent", "email": email}

    @staticmethod
    def remove_member(
        org_id: UUID,
        member_id: UUID,
        db: Session
    ) -> None:
        """Remove a member from organization"""
        member = db.query(User).filter(
            User.id == member_id,
            User.organization_id == org_id
        ).first()

        if not member:
            raise ValueError("Member not found")

        db.delete(member)
        db.commit()
