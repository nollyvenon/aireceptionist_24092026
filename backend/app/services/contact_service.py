"""Contact management service"""

from sqlalchemy.orm import Session
from uuid import UUID
from app.models.crm import Contact

class ContactService:
    @staticmethod
    def create_contact(data: dict, organization_id: UUID, db: Session) -> Contact:
        contact = Contact(
            organization_id=organization_id,
            customer_id=data.get("customer_id"),
            first_name=data.get("first_name"),
            last_name=data.get("last_name"),
            email=data.get("email"),
            phone=data.get("phone"),
            title=data.get("title"),
            department=data.get("department"),
            is_primary=data.get("is_primary", False),
        )
        db.add(contact)
        db.commit()
        return contact

    @staticmethod
    def get_contact(contact_id: UUID, db: Session) -> Contact:
        return db.query(Contact).filter(Contact.id == contact_id).first()

    @staticmethod
    def update_contact(contact_id: UUID, data: dict, db: Session) -> Contact:
        contact = db.query(Contact).filter(Contact.id == contact_id).first()
        if contact:
            for key, value in data.items():
                if hasattr(contact, key):
                    setattr(contact, key, value)
            db.commit()
        return contact

    @staticmethod
    def delete_contact(contact_id: UUID, db: Session) -> bool:
        contact = db.query(Contact).filter(Contact.id == contact_id).first()
        if contact:
            db.delete(contact)
            db.commit()
            return True
        return False

    @staticmethod
    def list_organization_contacts(org_id: UUID, db: Session, skip: int = 0,
                                  limit: int = 50) -> tuple:
        query = db.query(Contact).filter(Contact.organization_id == org_id)
        total = query.count()
        contacts = query.offset(skip).limit(limit).all()
        return contacts, total

    @staticmethod
    def list_customer_contacts(customer_id: UUID, db: Session) -> list:
        return db.query(Contact).filter(Contact.customer_id == customer_id).all()

    @staticmethod
    def get_primary_contact(customer_id: UUID, db: Session) -> Contact:
        return db.query(Contact).filter(
            Contact.customer_id == customer_id,
            Contact.is_primary == True
        ).first()

    @staticmethod
    def set_primary_contact(contact_id: UUID, customer_id: UUID, db: Session) -> Contact:
        # Unset current primary
        current_primary = db.query(Contact).filter(
            Contact.customer_id == customer_id,
            Contact.is_primary == True
        ).first()
        if current_primary:
            current_primary.is_primary = False

        # Set new primary
        contact = db.query(Contact).filter(Contact.id == contact_id).first()
        if contact:
            contact.is_primary = True
            db.commit()

        return contact

    @staticmethod
    def search_contacts(org_id: UUID, query_str: str, db: Session, skip: int = 0,
                       limit: int = 50) -> tuple:
        query = db.query(Contact).filter(
            Contact.organization_id == org_id,
            (Contact.first_name.ilike(f"%{query_str}%")) |
            (Contact.last_name.ilike(f"%{query_str}%")) |
            (Contact.email.ilike(f"%{query_str}%"))
        )
        total = query.count()
        contacts = query.offset(skip).limit(limit).all()
        return contacts, total

    @staticmethod
    def bulk_delete(contact_ids: list, db: Session) -> int:
        query = db.query(Contact).filter(Contact.id.in_(contact_ids))
        count = query.count()
        query.delete()
        db.commit()
        return count
