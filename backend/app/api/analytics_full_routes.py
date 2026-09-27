"""Comprehensive analytics API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime, timedelta
from app.models.user import User
from app.models.appointment import Appointment, AppointmentStatus
from app.models.payment import Payment, PaymentStatus
from app.models.crm import Lead, Deal
from app.models.communication import Call
from app.services.auth_service import AuthService
from app.middleware.auth import get_current_user
from app.services.user_service import UserService
from database import get_db

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])

@router.get("/revenue")
async def get_revenue_analytics(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    start_date = datetime.utcnow() - timedelta(days=days)
    payments = db.query(Payment).filter(
        Payment.organization_id == current_user.organization_id,
        Payment.created_at >= start_date,
        Payment.status == PaymentStatus.SUCCEEDED
    ).all()

    total_revenue = sum(p.amount for p in payments)
    total_transactions = len(payments)
    avg_transaction = total_revenue / total_transactions if total_transactions > 0 else 0

    daily_revenue = {}
    for payment in payments:
        date_key = payment.created_at.date().isoformat()
        if date_key not in daily_revenue:
            daily_revenue[date_key] = 0
        daily_revenue[date_key] += payment.amount

    return {
        "period_days": days,
        "total_revenue": total_revenue,
        "total_transactions": total_transactions,
        "average_transaction": avg_transaction,
        "daily_revenue": daily_revenue,
    }

@router.get("/appointments")
async def get_appointment_analytics(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    start_date = datetime.utcnow() - timedelta(days=days)
    appointments = db.query(Appointment).filter(
        Appointment.organization_id == current_user.organization_id,
        Appointment.created_at >= start_date
    ).all()

    total = len(appointments)
    completed = len([a for a in appointments if a.status == AppointmentStatus.COMPLETED])
    cancelled = len([a for a in appointments if a.status == AppointmentStatus.CANCELLED])
    no_show = len([a for a in appointments if a.status == AppointmentStatus.NO_SHOW])
    pending = len([a for a in appointments if a.status == AppointmentStatus.PENDING])

    return {
        "period_days": days,
        "total_appointments": total,
        "completed": completed,
        "cancelled": cancelled,
        "no_show": no_show,
        "pending": pending,
        "completion_rate": (completed / total * 100) if total > 0 else 0,
        "no_show_rate": (no_show / total * 100) if total > 0 else 0,
    }

@router.get("/leads")
async def get_leads_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    leads = db.query(Lead).filter(
        Lead.organization_id == current_user.organization_id
    ).all()

    total = len(leads)
    avg_score = sum(l.lead_score for l in leads) / total if total > 0 else 0

    status_breakdown = {}
    for lead in leads:
        status = lead.status.value
        if status not in status_breakdown:
            status_breakdown[status] = 0
        status_breakdown[status] += 1

    return {
        "total_leads": total,
        "average_score": avg_score,
        "by_status": status_breakdown,
    }

@router.get("/deals")
async def get_deals_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    deals = db.query(Deal).filter(
        Deal.organization_id == current_user.organization_id
    ).all()

    total = len(deals)
    total_value = sum(d.value for d in deals)
    avg_value = total_value / total if total > 0 else 0
    won = len([d for d in deals if d.status.value == "closed_won"])

    return {
        "total_deals": total,
        "total_value": total_value,
        "average_value": avg_value,
        "won": won,
        "win_rate": (won / total * 100) if total > 0 else 0,
    }

@router.get("/calls")
async def get_calls_analytics(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    start_date = datetime.utcnow() - timedelta(days=days)
    calls = db.query(Call).filter(
        Call.organization_id == current_user.organization_id,
        Call.created_at >= start_date
    ).all()

    total = len(calls)
    total_duration = sum(c.duration for c in calls)
    avg_duration = total_duration / total if total > 0 else 0

    return {
        "period_days": days,
        "total_calls": total,
        "total_duration_seconds": total_duration,
        "average_duration_seconds": avg_duration,
    }

@router.get("/performance")
async def get_performance_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    appointments = db.query(Appointment).filter(
        Appointment.organization_id == current_user.organization_id
    ).all()

    metrics = {}

    # Average response time (mock)
    metrics["avg_response_time_ms"] = 145

    # Success rate
    completed = len([a for a in appointments if a.status == AppointmentStatus.COMPLETED])
    total = len(appointments)
    metrics["success_rate"] = (completed / total * 100) if total > 0 else 0

    # Uptime (mock)
    metrics["uptime_percentage"] = 99.9

    return metrics

@router.get("/dashboard-summary")
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Revenue (last 30 days)
    start_date = datetime.utcnow() - timedelta(days=30)
    payments = db.query(Payment).filter(
        Payment.organization_id == current_user.organization_id,
        Payment.created_at >= start_date,
        Payment.status == PaymentStatus.SUCCEEDED
    ).all()

    revenue = sum(p.amount for p in payments)

    # Appointments (last 30 days)
    appointments = db.query(Appointment).filter(
        Appointment.organization_id == current_user.organization_id,
        Appointment.created_at >= start_date
    ).all()

    # Leads
    leads = db.query(Lead).filter(
        Lead.organization_id == current_user.organization_id
    ).all()

    return {
        "revenue_30d": revenue,
        "appointments_30d": len(appointments),
        "total_leads": len(leads),
        "key_metrics": {
            "active_customers": len([a for a in appointments if a.customer_id]),
            "conversion_rate": (len([l for l in leads if l.status.value == "qualified"]) / len(leads) * 100) if leads else 0,
        }
    }
