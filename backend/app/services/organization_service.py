"""Organization service"""

from uuid import UUID
from sqlalchemy.orm import Session

from app.models.organization import Organization
from app.models.settings import Settings
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
