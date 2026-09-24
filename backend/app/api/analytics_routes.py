"""Analytics API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from datetime import datetime, timedelta
from typing import Optional

from database import get_db
from app.services.auth_service import AuthService
from app.models.appointment import Appointment
from app.models.customer import Customer
from app.models.payment import Payment
from app.models.activity import Activity

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])

def get_current_user(token: str = Query(...), db: Session = Depends(get_db)):
    """Get current user"""
    token_data = AuthService.verify_token(token)
    if not token_data:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    from app.services.user_service import UserService
    user = UserService.get_user(token_data.user_id, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user

@router.get("/dashboard/summary")
async def get_dashboard_summary(
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard summary metrics"""
    org_id = user.organization_id

    total_customers = db.query(func.count(Customer.id)).filter(
        Customer.organization_id == org_id
    ).scalar()

    total_appointments = db.query(func.count(Appointment.id)).filter(
        Appointment.organization_id == org_id
    ).scalar()

    completed_appointments = db.query(func.count(Appointment.id)).filter(
        Appointment.organization_id == org_id,
        Appointment.status == "completed"
    ).scalar()

    total_revenue = db.query(func.sum(Payment.amount_cents)).filter(
        Payment.organization_id == org_id,
        Payment.status == "succeeded"
    ).scalar() or 0

    return {
        "total_customers": total_customers,
        "total_appointments": total_appointments,
        "completed_appointments": completed_appointments,
        "total_revenue_cents": int(total_revenue),
        "average_revenue_per_appointment": int(total_revenue / completed_appointments) if completed_appointments > 0 else 0
    }

@router.get("/appointments/by-status")
async def get_appointments_by_status(
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get appointment count by status"""
    results = db.query(
        Appointment.status,
        func.count(Appointment.id).label("count")
    ).filter(
        Appointment.organization_id == user.organization_id
    ).group_by(Appointment.status).all()

    return {
        "data": [{"status": r[0], "count": r[1]} for r in results]
    }

@router.get("/customers/by-status")
async def get_customers_by_status(
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get customer count by status"""
    results = db.query(
        Customer.status,
        func.count(Customer.id).label("count")
    ).filter(
        Customer.organization_id == user.organization_id
    ).group_by(Customer.status).all()

    return {
        "data": [{"status": r[0], "count": r[1]} for r in results]
    }

@router.get("/revenue/daily")
async def get_daily_revenue(
    days: int = Query(30, ge=1, le=365),
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get daily revenue for last N days"""
    start_date = datetime.utcnow() - timedelta(days=days)

    results = db.query(
        func.date(Payment.created_at).label("date"),
        func.sum(Payment.amount_cents).label("revenue")
    ).filter(
        Payment.organization_id == user.organization_id,
        Payment.status == "succeeded",
        Payment.created_at >= start_date
    ).group_by(func.date(Payment.created_at)).all()

    return {
        "period_days": days,
        "data": [{"date": str(r[0]), "revenue_cents": int(r[1])} for r in results]
    }

@router.get("/appointments/daily")
async def get_daily_appointments(
    days: int = Query(30, ge=1, le=365),
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get daily appointment count for last N days"""
    start_date = datetime.utcnow() - timedelta(days=days)

    results = db.query(
        func.date(Appointment.start_time).label("date"),
        func.count(Appointment.id).label("count")
    ).filter(
        Appointment.organization_id == user.organization_id,
        Appointment.start_time >= start_date
    ).group_by(func.date(Appointment.start_time)).all()

    return {
        "period_days": days,
        "data": [{"date": str(r[0]), "count": int(r[1])} for r in results]
    }

@router.get("/top-customers")
async def get_top_customers(
    limit: int = Query(10, ge=1, le=100),
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get top customers by lifetime value"""
    customers = db.query(Customer).filter(
        Customer.organization_id == user.organization_id
    ).order_by(
        Customer.lifetime_value_cents.desc()
    ).limit(limit).all()

    return {
        "data": [
            {
                "id": str(c.id),
                "name": f"{c.first_name} {c.last_name}",
                "lifetime_value_cents": c.lifetime_value_cents,
                "total_appointments": c.total_appointments
            }
            for c in customers
        ]
    }

@router.get("/activity/by-type")
async def get_activity_by_type(
    days: int = Query(30, ge=1, le=365),
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get activity count by type"""
    start_date = datetime.utcnow() - timedelta(days=days)

    results = db.query(
        Activity.activity_type,
        func.count(Activity.id).label("count")
    ).filter(
        Activity.organization_id == user.organization_id,
        Activity.created_at >= start_date
    ).group_by(Activity.activity_type).all()

    return {
        "period_days": days,
        "data": [{"type": r[0], "count": r[1]} for r in results]
    }
