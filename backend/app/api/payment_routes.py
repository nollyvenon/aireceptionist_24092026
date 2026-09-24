"""Payment routes for Stripe, PayPal, and other payment processors"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime
from app.database import get_db
from app.models.payment import Payment, PaymentStatus, PaymentMethod
from app.models.organization import Organization
from app.schemas.payment import PaymentCreate, PaymentUpdate, PaymentResponse
from app.services.payment_service import PaymentService
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/v1/payments", tags=["payments"])
payment_service = PaymentService()

# Create payment intent (Stripe)
@router.post("/", response_model=PaymentResponse)
async def create_payment(
    payment_data: PaymentCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a payment intent with Stripe"""
    try:
        payment = await payment_service.create_payment_intent(
            organization_id=current_user.get("organization_id"),
            amount_cents=payment_data.amount_cents,
            currency=payment_data.currency,
            payment_method=payment_data.payment_method,
            customer_id=payment_data.customer_id,
            appointment_id=payment_data.appointment_id,
            db=db
        )
        return payment
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Create PayPal payment
@router.post("/paypal", response_model=PaymentResponse)
async def create_paypal_payment(
    payment_data: PaymentCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a PayPal payment"""
    try:
        payment = await payment_service.create_paypal_payment(
            organization_id=current_user.get("organization_id"),
            amount_cents=payment_data.amount_cents,
            currency=payment_data.currency,
            customer_id=payment_data.customer_id,
            appointment_id=payment_data.appointment_id,
            db=db
        )
        return payment
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Create Flutterwave payment
@router.post("/flutterwave", response_model=PaymentResponse)
async def create_flutterwave_payment(
    payment_data: PaymentCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a Flutterwave payment"""
    try:
        payment = await payment_service.create_flutterwave_payment(
            organization_id=current_user.get("organization_id"),
            amount_cents=payment_data.amount_cents,
            currency=payment_data.currency,
            customer_id=payment_data.customer_id,
            appointment_id=payment_data.appointment_id,
            db=db
        )
        return payment
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Create Paystack payment
@router.post("/paystack", response_model=PaymentResponse)
async def create_paystack_payment(
    payment_data: PaymentCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a Paystack payment"""
    try:
        payment = await payment_service.create_paystack_payment(
            organization_id=current_user.get("organization_id"),
            amount_cents=payment_data.amount_cents,
            currency=payment_data.currency,
            customer_id=payment_data.customer_id,
            appointment_id=payment_data.appointment_id,
            db=db
        )
        return payment
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# List payments
@router.get("/", response_model=list[PaymentResponse])
async def list_payments(
    skip: int = 0,
    limit: int = 50,
    status: str = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List payments with optional status filtering"""
    query = db.query(Payment).filter(
        Payment.organization_id == current_user.get("organization_id")
    )
    if status:
        query = query.filter(Payment.status == status)
    return query.offset(skip).limit(limit).all()

# Get payment by ID
@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get payment details by ID"""
    payment = db.query(Payment).filter(
        Payment.id == payment_id,
        Payment.organization_id == current_user.get("organization_id")
    ).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment

# Confirm payment
@router.post("/{payment_id}/confirm", response_model=PaymentResponse)
async def confirm_payment(
    payment_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Confirm a payment"""
    try:
        payment = await payment_service.confirm_payment(payment_id, db=db)
        return payment
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Process refund
@router.post("/{payment_id}/refund", response_model=PaymentResponse)
async def refund_payment(
    payment_id: UUID,
    refund_reason: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Process a refund for a payment"""
    try:
        payment = await payment_service.refund_payment(
            payment_id=payment_id,
            reason=refund_reason,
            db=db
        )
        return payment
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Webhook for Stripe
@router.post("/webhooks/stripe")
async def stripe_webhook(payload: dict, db: Session = Depends(get_db)):
    """Handle Stripe webhook events"""
    try:
        await payment_service.handle_stripe_webhook(payload, db=db)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Webhook for PayPal
@router.post("/webhooks/paypal")
async def paypal_webhook(payload: dict, db: Session = Depends(get_db)):
    """Handle PayPal webhook events"""
    try:
        await payment_service.handle_paypal_webhook(payload, db=db)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Create invoice
@router.post("/invoices", response_model=dict)
async def create_invoice(
    payment_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create an invoice for a payment"""
    try:
        invoice = await payment_service.create_invoice(payment_id, db=db)
        return invoice
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Apply coupon
@router.post("/coupons/{coupon_code}/apply", response_model=PaymentResponse)
async def apply_coupon(
    coupon_code: str,
    payment_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Apply a coupon to a payment"""
    try:
        payment = await payment_service.apply_coupon(
            coupon_code=coupon_code,
            payment_id=payment_id,
            db=db
        )
        return payment
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Payment analytics
@router.get("/analytics/summary", response_model=dict)
async def payment_analytics(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get payment analytics summary"""
    return await payment_service.get_analytics(
        organization_id=current_user.get("organization_id"),
        db=db
    )
