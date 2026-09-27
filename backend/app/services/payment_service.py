"""Payment service"""

from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime
from app.models.payment import Payment, PaymentStatus

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

    @staticmethod
    async def create_payment_intent(organization_id: UUID, amount_cents: int, currency: str,
                                   payment_method: str, customer_id: UUID = None,
                                   appointment_id: UUID = None, db: Session = None):
        """Create payment intent with Stripe"""
        payment = Payment(
            organization_id=organization_id,
            customer_id=customer_id,
            amount_cents=amount_cents,
            currency=currency,
            payment_method=payment_method,
            status=PaymentStatus.PENDING
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)
        return payment

    @staticmethod
    async def create_paypal_payment(organization_id: UUID, amount_cents: int, currency: str,
                                   customer_id: UUID = None, appointment_id: UUID = None,
                                   db: Session = None):
        """Create PayPal payment"""
        payment = Payment(
            organization_id=organization_id,
            customer_id=customer_id,
            amount_cents=amount_cents,
            currency=currency,
            payment_method="paypal",
            status=PaymentStatus.PENDING
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)
        return payment

    @staticmethod
    async def create_flutterwave_payment(organization_id: UUID, amount_cents: int, currency: str,
                                        customer_id: UUID = None, appointment_id: UUID = None,
                                        db: Session = None):
        """Create Flutterwave payment"""
        payment = Payment(
            organization_id=organization_id,
            customer_id=customer_id,
            amount_cents=amount_cents,
            currency=currency,
            payment_method="flutterwave",
            status=PaymentStatus.PENDING
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)
        return payment

    @staticmethod
    async def create_paystack_payment(organization_id: UUID, amount_cents: int, currency: str,
                                     customer_id: UUID = None, appointment_id: UUID = None,
                                     db: Session = None):
        """Create Paystack payment"""
        payment = Payment(
            organization_id=organization_id,
            customer_id=customer_id,
            amount_cents=amount_cents,
            currency=currency,
            payment_method="paystack",
            status=PaymentStatus.PENDING
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)
        return payment

    @staticmethod
    async def confirm_payment(payment_id: UUID, db: Session = None):
        """Confirm payment"""
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        if payment:
            payment.status = PaymentStatus.SUCCEEDED
            db.commit()
            db.refresh(payment)
        return payment

    @staticmethod
    async def refund_payment(payment_id: UUID, reason: str = None, db: Session = None):
        """Refund payment"""
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        if payment:
            payment.status = PaymentStatus.REFUNDED
            db.commit()
            db.refresh(payment)
        return payment

    @staticmethod
    async def handle_stripe_webhook(payload: dict, db: Session = None):
        """Handle Stripe webhook"""
        return {"status": "processed"}

    @staticmethod
    async def handle_paypal_webhook(payload: dict, db: Session = None):
        """Handle PayPal webhook"""
        return {"status": "processed"}

    @staticmethod
    async def create_invoice(payment_id: UUID, db: Session = None):
        """Create invoice for payment"""
        return {"invoice_id": str(payment_id), "url": f"/invoices/{payment_id}.pdf"}

    @staticmethod
    async def apply_coupon(coupon_code: str, payment_id: UUID, db: Session = None):
        """Apply coupon to payment"""
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        if payment:
            db.commit()
            db.refresh(payment)
        return payment

    @staticmethod
    async def get_analytics(organization_id: UUID, db: Session = None):
        """Get payment analytics"""
        return {
            "total_revenue": 0,
            "total_transactions": 0,
            "average_transaction": 0
        }
