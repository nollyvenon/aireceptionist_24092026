"""Payment service with Stripe integration"""

from uuid import UUID
from datetime import datetime
import os
from typing import Optional
from sqlalchemy.orm import Session

try:
    import stripe
except ImportError:
    stripe = None

from app.models.payment import Payment, PaymentStatus
from app.models.customer import Customer
from app.schemas.payment import PaymentCreate, RefundRequest

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")

if STRIPE_SECRET_KEY and stripe:
    stripe.api_key = STRIPE_SECRET_KEY

class PaymentService:
    @staticmethod
    def create_payment_intent(
        payment_data: PaymentCreate,
        organization_id: UUID,
        db: Session
    ) -> Payment:
        """Create payment and Stripe payment intent"""
        if not stripe:
            raise ValueError("Stripe not configured")

        # Create payment record
        db_payment = Payment(
            organization_id=organization_id,
            customer_id=payment_data.customer_id,
            appointment_id=payment_data.appointment_id,
            amount_cents=payment_data.amount_cents,
            currency=payment_data.currency,
            payment_method=payment_data.payment_method,
            description=payment_data.description,
        )

        try:
            # Create Stripe payment intent
            intent = stripe.PaymentIntent.create(
                amount=payment_data.amount_cents,
                currency=payment_data.currency.lower(),
                payment_method_types=["card"],
                metadata={
                    "appointment_id": str(payment_data.appointment_id) if payment_data.appointment_id else "",
                    "organization_id": str(organization_id),
                }
            )

            db_payment.stripe_payment_intent_id = intent.id
            db.add(db_payment)
            db.commit()
            db.refresh(db_payment)

            return db_payment
        except Exception as e:
            db.rollback()
            raise ValueError(f"Payment creation failed: {str(e)}")

    @staticmethod
    def confirm_payment(
        payment_intent_id: str,
        db: Session
    ) -> Payment:
        """Confirm payment after Stripe callback"""
        if not stripe:
            raise ValueError("Stripe not configured")

        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)

            db_payment = db.query(Payment).filter(
                Payment.stripe_payment_intent_id == payment_intent_id
            ).first()

            if not db_payment:
                raise ValueError("Payment not found")

            if intent.status == "succeeded":
                db_payment.status = PaymentStatus.SUCCEEDED
                db_payment.stripe_charge_id = intent.charges.data[0].id if intent.charges.data else None
                db_payment.paid_at = datetime.utcnow()

                # Update customer lifetime value
                customer = db.query(Customer).filter(Customer.id == db_payment.customer_id).first()
                if customer:
                    customer.lifetime_value_cents += db_payment.amount_cents
                    customer.status = "customer"

            elif intent.status == "payment_failed":
                db_payment.status = PaymentStatus.FAILED
                db_payment.failed_at = datetime.utcnow()
                db_payment.failure_reason = intent.last_payment_error.message if intent.last_payment_error else "Unknown"

            db.add(db_payment)
            db.commit()
            db.refresh(db_payment)

            return db_payment
        except Exception as e:
            raise ValueError(f"Payment confirmation failed: {str(e)}")

    @staticmethod
    def refund_payment(
        payment_id: UUID,
        refund_data: RefundRequest,
        organization_id: UUID,
        db: Session
    ) -> Payment:
        """Refund payment"""
        if not stripe:
            raise ValueError("Stripe not configured")

        db_payment = db.query(Payment).filter(Payment.id == payment_id).first()
        if not db_payment:
            raise ValueError("Payment not found")

        if db_payment.organization_id != organization_id:
            raise ValueError("Unauthorized")

        if db_payment.status != PaymentStatus.SUCCEEDED:
            raise ValueError("Can only refund successful payments")

        try:
            refund_amount = refund_data.amount_cents or db_payment.amount_cents

            refund = stripe.Refund.create(
                payment_intent=db_payment.stripe_payment_intent_id,
                amount=refund_amount,
                reason="requested_by_customer",
                metadata={"reason": refund_data.reason}
            )

            db_payment.is_refunded = True
            db_payment.refund_amount_cents = refund_amount
            db_payment.refund_reason = refund_data.reason
            db_payment.refund_stripe_id = refund.id
            db_payment.refunded_at = datetime.utcnow()
            db_payment.status = PaymentStatus.REFUNDED

            # Update customer lifetime value
            customer = db.query(Customer).filter(Customer.id == db_payment.customer_id).first()
            if customer:
                customer.lifetime_value_cents -= refund_amount

            db.add(db_payment)
            db.commit()
            db.refresh(db_payment)

            return db_payment
        except Exception as e:
            raise ValueError(f"Refund failed: {str(e)}")

    @staticmethod
    def get_payment(payment_id: UUID, db: Session) -> Payment:
        """Get payment by ID"""
        return db.query(Payment).filter(Payment.id == payment_id).first()

    @staticmethod
    def list_payments(
        organization_id: UUID,
        db: Session,
        skip: int = 0,
        limit: int = 50,
        status: str = None,
    ) -> tuple[list[Payment], int]:
        """List payments with filters"""
        query = db.query(Payment).filter(Payment.organization_id == organization_id)

        if status:
            query = query.filter(Payment.status == status)

        query = query.order_by(Payment.created_at.desc())
        total = query.count()
        payments = query.offset(skip).limit(limit).all()
        return payments, total
