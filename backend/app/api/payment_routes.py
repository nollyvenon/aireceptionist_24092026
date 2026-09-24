"""Payment API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db
from app.schemas.payment import PaymentCreate, PaymentResponse, PaymentListResponse, PaymentIntentResponse, RefundRequest
from app.services.payment_service import PaymentService
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/v1/payments", tags=["payments"])

def get_current_org(token: str = Query(...), db: Session = Depends(get_db)):
    """Get current organization"""
    token_data = AuthService.verify_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid token")

    from app.services.user_service import UserService
    user = UserService.get_user(token_data.user_id, db)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user

@router.post("", response_model=PaymentIntentResponse)
async def create_payment(
    payment_data: PaymentCreate,
    user = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """Create payment intent"""
    try:
        payment = PaymentService.create_payment_intent(payment_data, user.organization_id, db)

        return {
            "client_secret": "pi_test_secret",  # Would come from Stripe
            "payment_intent_id": payment.stripe_payment_intent_id or payment.id,
            "amount_cents": payment.amount_cents,
            "currency": payment.currency
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=PaymentListResponse)
async def list_payments(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: str = Query(None),
    user = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """List payments"""
    payments, total = PaymentService.list_payments(
        user.organization_id,
        db,
        skip=skip,
        limit=limit,
        status=status
    )

    return {
        "items": payments,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: UUID,
    user = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """Get payment by ID"""
    payment = PaymentService.get_payment(payment_id, db)

    if not payment or payment.organization_id != user.organization_id:
        raise HTTPException(status_code=404, detail="Payment not found")

    return payment

@router.post("/{payment_intent_id}/confirm")
async def confirm_payment(
    payment_intent_id: str,
    user = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """Confirm payment (webhook endpoint)"""
    try:
        payment = PaymentService.confirm_payment(payment_intent_id, db)
        return {"message": "Payment confirmed", "payment": payment}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{payment_id}/refund")
async def refund_payment(
    payment_id: UUID,
    refund_data: RefundRequest,
    user = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """Refund payment"""
    try:
        payment = PaymentService.refund_payment(
            payment_id,
            refund_data,
            user.organization_id,
            db
        )
        return {"message": "Payment refunded", "payment": payment}
    except ValueError as e:
        raise HTTPException(status_code=404 if "not found" in str(e) else 400, detail=str(e))
