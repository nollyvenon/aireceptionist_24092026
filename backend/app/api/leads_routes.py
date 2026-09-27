"""Lead management API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from database import get_db
from app.models.crm import Lead, LeadStatus
from app.models.user import User
from app.services.auth_service import AuthService
from app.services.user_service import UserService

router = APIRouter(prefix="/api/v1/crm/leads", tags=["crm-leads"])

def get_current_user(token: str = Query(...), db: Session = Depends(get_db)) -> User:
    token_data = AuthService.verify_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = UserService.get_user(token_data.user_id, db)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.get("")
async def list_leads(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    assigned_to: Optional[UUID] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Lead).filter(Lead.organization_id == current_user.organization_id)

    if status:
        query = query.filter(Lead.status == LeadStatus(status))
    if assigned_to:
        query = query.filter(Lead.assigned_to_id == assigned_to)

    total = query.count()
    leads = query.offset(skip).limit(limit).all()

    return {
        "data": [
            {
                "id": str(lead.id),
                "first_name": lead.first_name,
                "last_name": lead.last_name,
                "email": lead.email,
                "phone": lead.phone,
                "company": lead.company,
                "status": lead.status.value,
                "lead_score": lead.lead_score,
                "created_at": lead.created_at.isoformat(),
                "updated_at": lead.updated_at.isoformat(),
            }
            for lead in leads
        ],
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.post("")
async def create_lead(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lead = Lead(
        organization_id=current_user.organization_id,
        first_name=body.get("first_name"),
        last_name=body.get("last_name"),
        email=body.get("email"),
        phone=body.get("phone"),
        company=body.get("company"),
        title=body.get("title"),
        status=LeadStatus(body.get("status", "new")),
        lead_score=body.get("lead_score", 0.0),
        assigned_to_id=body.get("assigned_to_id"),
        notes=body.get("notes"),
        source=body.get("source"),
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)

    return {
        "id": str(lead.id),
        "first_name": lead.first_name,
        "last_name": lead.last_name,
        "email": lead.email,
        "status": lead.status.value,
        "created_at": lead.created_at.isoformat(),
    }

@router.get("/{lead_id}")
async def get_lead(
    lead_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id,
        Lead.organization_id == current_user.organization_id
    ).first()

    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    return {
        "id": str(lead.id),
        "first_name": lead.first_name,
        "last_name": lead.last_name,
        "email": lead.email,
        "phone": lead.phone,
        "company": lead.company,
        "title": lead.title,
        "status": lead.status.value,
        "lead_score": lead.lead_score,
        "assigned_to_id": str(lead.assigned_to_id) if lead.assigned_to_id else None,
        "notes": lead.notes,
        "source": lead.source,
        "created_at": lead.created_at.isoformat(),
        "updated_at": lead.updated_at.isoformat(),
    }

@router.put("/{lead_id}")
async def update_lead(
    lead_id: UUID,
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id,
        Lead.organization_id == current_user.organization_id
    ).first()

    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    for key, value in body.items():
        if key == "status":
            setattr(lead, key, LeadStatus(value))
        elif hasattr(lead, key):
            setattr(lead, key, value)

    db.commit()
    db.refresh(lead)

    return {
        "id": str(lead.id),
        "first_name": lead.first_name,
        "last_name": lead.last_name,
        "status": lead.status.value,
        "updated_at": lead.updated_at.isoformat(),
    }

@router.delete("/{lead_id}")
async def delete_lead(
    lead_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id,
        Lead.organization_id == current_user.organization_id
    ).first()

    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    db.delete(lead)
    db.commit()

    return {"message": "Lead deleted successfully"}

@router.get("/{lead_id}/convert-to-customer")
async def convert_to_customer(
    lead_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id,
        Lead.organization_id == current_user.organization_id
    ).first()

    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    return {
        "message": "Lead conversion initiated",
        "lead_id": str(lead_id),
    }
