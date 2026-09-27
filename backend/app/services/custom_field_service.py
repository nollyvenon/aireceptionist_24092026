"""Custom field management service"""

from sqlalchemy.orm import Session
from uuid import UUID
from app.models.advanced import CustomField, FieldValue
from datetime import datetime


class CustomFieldService:
    @staticmethod
    def create_field(data: dict, organization_id: UUID, db: Session) -> CustomField:
        field = CustomField(
            organization_id=organization_id,
            name=data.get("name"),
            field_type=data.get("field_type"),
            description=data.get("description"),
            is_required=data.get("is_required", False),
            is_active=data.get("is_active", True),
        )
        db.add(field)
        db.commit()
        return field

    @staticmethod
    def get_field(field_id: UUID, db: Session) -> CustomField:
        return db.query(CustomField).filter(CustomField.id == field_id).first()

    @staticmethod
    def list_organization_fields(org_id: UUID, db: Session, skip: int = 0,
                                 limit: int = 50, active_only: bool = False) -> tuple:
        query = db.query(CustomField).filter(CustomField.organization_id == org_id)

        if active_only:
            query = query.filter(CustomField.is_active == True)

        total = query.count()
        fields = query.order_by(CustomField.created_at.desc()).offset(skip).limit(limit).all()
        return fields, total

    @staticmethod
    def update_field(field_id: UUID, data: dict, db: Session) -> CustomField:
        field = db.query(CustomField).filter(CustomField.id == field_id).first()
        if field:
            if "name" in data:
                field.name = data["name"]
            if "description" in data:
                field.description = data["description"]
            if "is_required" in data:
                field.is_required = data["is_required"]
            if "is_active" in data:
                field.is_active = data["is_active"]
            field.updated_at = datetime.utcnow()
            db.commit()
        return field

    @staticmethod
    def delete_field(field_id: UUID, db: Session) -> bool:
        field = db.query(CustomField).filter(CustomField.id == field_id).first()
        if field:
            db.delete(field)
            db.commit()
            return True
        return False

    @staticmethod
    def set_field_value(resource_id: UUID, field_id: UUID, value: str,
                       organization_id: UUID, db: Session) -> FieldValue:
        existing = db.query(FieldValue).filter(
            FieldValue.resource_id == resource_id,
            FieldValue.field_id == field_id
        ).first()

        if existing:
            existing.value = value
            existing.updated_at = datetime.utcnow()
            db.commit()
            return existing

        field_value = FieldValue(
            organization_id=organization_id,
            resource_id=resource_id,
            field_id=field_id,
            value=value,
        )
        db.add(field_value)
        db.commit()
        return field_value

    @staticmethod
    def get_field_values(resource_id: UUID, db: Session) -> list:
        return db.query(FieldValue).filter(FieldValue.resource_id == resource_id).all()

    @staticmethod
    def get_field_value(resource_id: UUID, field_id: UUID, db: Session) -> FieldValue:
        return db.query(FieldValue).filter(
            FieldValue.resource_id == resource_id,
            FieldValue.field_id == field_id
        ).first()

    @staticmethod
    def delete_field_value(resource_id: UUID, field_id: UUID, db: Session) -> bool:
        field_value = db.query(FieldValue).filter(
            FieldValue.resource_id == resource_id,
            FieldValue.field_id == field_id
        ).first()
        if field_value:
            db.delete(field_value)
            db.commit()
            return True
        return False

    @staticmethod
    def bulk_delete_field_values(field_id: UUID, db: Session) -> int:
        count = db.query(FieldValue).filter(FieldValue.field_id == field_id).delete()
        db.commit()
        return count

    @staticmethod
    def search_fields(org_id: UUID, name_query: str, db: Session) -> list:
        return db.query(CustomField).filter(
            CustomField.organization_id == org_id,
            CustomField.name.ilike(f"%{name_query}%")
        ).all()

    @staticmethod
    def get_field_summary(org_id: UUID, db: Session) -> dict:
        fields = db.query(CustomField).filter(CustomField.organization_id == org_id).all()

        total = len(fields)
        active = len([f for f in fields if f.is_active])
        required = len([f for f in fields if f.is_required])

        by_type = {}
        for field in fields:
            field_type = field.field_type
            if field_type not in by_type:
                by_type[field_type] = 0
            by_type[field_type] += 1

        return {
            "total_fields": total,
            "active_fields": active,
            "required_fields": required,
            "by_type": by_type,
        }
