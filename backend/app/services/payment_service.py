"""Payment service"""

from sqlalchemy.orm import Session
from uuid import UUID
from app.models.payment import Payment

class PaymentService:
    @staticmethod
    def create_payment(org_id: UUID, data: dict, db: Session):
        payment = Payment(
            organization_id=org_id,
            **data
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)
        return payment
    
    @staticmethod
    def list_payments(org_id: UUID, db: Session, skip=0, limit=100):
        return db.query(Payment).filter(Payment.organization_id == org_id).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_payment(payment_id: UUID, db: Session):
        return db.query(Payment).filter(Payment.id == payment_id).first()
