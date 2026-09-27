"""Contact management API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from database import get_db
from app.models.crm import Contact
from app.models.user import User
from app.services.auth_service import AuthService
from app.services.user_service import UserService

router = APIRouter(prefix="/api/v1/crm/contacts", tags=["crm-contacts"])

def get_current_user(token: str = Query(...), db: Session = Depends(get_db)) -> User:
    token_data = AuthService.verify_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = UserService.get_user(token_data.user_id, db)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.get("")
async def list_contacts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    customer_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Contact).filter(Contact.organization_id == current_user.organization_id)

    if customer_id:
        query = query.filter(Contact.customer_id == customer_id)

    total = query.count()
    contacts = query.offset(skip).limit(limit).all()

    return {
        "items": [
            {
                "id": str(c.id),
                "first_name": c.first_name,
                "last_name": c.last_name,
                "email": c.email,
                "phone": c.phone,
                "title": c.title,
                "is_primary": c.is_primary,
            }
            for c in contacts
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }

@router.post("")
async def create_contact(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    contact = Contact(
        organization_id=current_user.organization_id,
        customer_id=body.get("customer_id"),
        first_name=body.get("first_name"),
        last_name=body.get("last_name"),
        email=body.get("email"),
        phone=body.get("phone"),
        title=body.get("title"),
        department=body.get("department"),
        is_primary=body.get("is_primary", False),
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)

    return {"id": str(contact.id), "email": contact.email}

@router.get("/{contact_id}")
async def get_contact(
    contact_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    contact = db.query(Contact).filter(
        Contact.id == contact_id,
        Contact.organization_id == current_user.organization_id
    ).first()

    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    return {
        "id": str(contact.id),
        "first_name": contact.first_name,
        "last_name": contact.last_name,
        "email": contact.email,
        "phone": contact.phone,
        "title": contact.title,
        "department": contact.department,
        "is_primary": contact.is_primary,
    }

@router.put("/{contact_id}")
async def update_contact(
    contact_id: UUID,
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    contact = db.query(Contact).filter(
        Contact.id == contact_id,
        Contact.organization_id == current_user.organization_id
    ).first()

    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    for key, value in body.items():
        if hasattr(contact, key):
            setattr(contact, key, value)

    db.commit()
    return {"id": str(contact.id)}

@router.delete("/{contact_id}")
async def delete_contact(
    contact_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    contact = db.query(Contact).filter(
        Contact.id == contact_id,
        Contact.organization_id == current_user.organization_id
    ).first()

    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    db.delete(contact)
    db.commit()
    return {"message": "Contact deleted"}
