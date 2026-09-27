"""Custom fields API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db
from app.models.advanced import CustomField, FieldValue
from app.models.user import User
from app.services.auth_service import AuthService
from app.services.user_service import UserService

router = APIRouter(prefix="/api/v1/custom-fields", tags=["custom-fields"])

def get_current_user(token: str = Query(...), db: Session = Depends(get_db)) -> User:
    token_data = AuthService.verify_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = UserService.get_user(token_data.user_id, db)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.get("")
async def list_custom_fields(
    entity_type: str = Query(...),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(CustomField).filter(
        CustomField.organization_id == current_user.organization_id,
        CustomField.entity_type == entity_type
    )
    total = query.count()
    fields = query.offset(skip).limit(limit).all()

    return {
        "data": [
            {
                "id": str(f.id),
                "field_name": f.field_name,
                "field_type": f.field_type,
                "is_required": f.is_required,
            }
            for f in fields
        ],
        "total": total,
    }

@router.post("")
async def create_custom_field(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    field = CustomField(
        organization_id=current_user.organization_id,
        entity_type=body.get("entity_type"),
        field_name=body.get("field_name"),
        field_type=body.get("field_type"),
        is_required=body.get("is_required", False),
        default_value=body.get("default_value"),
        options=body.get("options"),
    )
    db.add(field)
    db.commit()
    db.refresh(field)

    return {"id": str(field.id)}

@router.get("/{field_id}")
async def get_custom_field(
    field_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    field = db.query(CustomField).filter(
        CustomField.id == field_id,
        CustomField.organization_id == current_user.organization_id
    ).first()

    if not field:
        raise HTTPException(status_code=404, detail="Custom field not found")

    return {
        "id": str(field.id),
        "field_name": field.field_name,
        "field_type": field.field_type,
        "is_required": field.is_required,
    }

@router.put("/{field_id}")
async def update_custom_field(
    field_id: UUID,
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    field = db.query(CustomField).filter(
        CustomField.id == field_id,
        CustomField.organization_id == current_user.organization_id
    ).first()

    if not field:
        raise HTTPException(status_code=404, detail="Custom field not found")

    for key, value in body.items():
        if hasattr(field, key):
            setattr(field, key, value)

    db.commit()
    return {"id": str(field.id)}

@router.delete("/{field_id}")
async def delete_custom_field(
    field_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    field = db.query(CustomField).filter(
        CustomField.id == field_id,
        CustomField.organization_id == current_user.organization_id
    ).first()

    if not field:
        raise HTTPException(status_code=404, detail="Custom field not found")

    db.delete(field)
    db.commit()

    return {"message": "Custom field deleted"}

@router.post("/{field_id}/values")
async def set_field_value(
    field_id: UUID,
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    field = db.query(CustomField).filter(
        CustomField.id == field_id,
        CustomField.organization_id == current_user.organization_id
    ).first()

    if not field:
        raise HTTPException(status_code=404, detail="Custom field not found")

    field_value = FieldValue(
        organization_id=current_user.organization_id,
        custom_field_id=field_id,
        entity_id=body.get("entity_id"),
        value=body.get("value"),
    )
    db.add(field_value)
    db.commit()
    db.refresh(field_value)

    return {"id": str(field_value.id)}
