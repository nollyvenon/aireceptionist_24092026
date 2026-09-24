"""Analytics service for business metrics and reporting"""

from sqlalchemy.orm import Session
from uuid import UUID
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

from app.models.organization import Organization
from app.models.appointment import Appointment
from app.models.customer import Customer
from app.models.payment import Payment

class AnalyticsService:
    @staticmethod
    def get_dashboard_metrics(
        db: Session,
        organization_id: UUID,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get dashboard metrics"""
        start_date = datetime.utcnow() - timedelta(days=days)

        # Count metrics
        total_customers = db.query(Customer).filter(
            Customer.organization_id == organization_id
        ).count()

        recent_appointments = db.query(Appointment).filter(
            Appointment.organization_id == organization_id,
            Appointment.created_at >= start_date
        ).count()

        total_revenue = db.query(Payment).filter(
            Payment.organization_id == organization_id,
            Payment.status == "completed",
            Payment.created_at >= start_date
        ).with_entities(db.func.sum(Payment.amount_cents)).scalar() or 0

        return {
            "total_customers": total_customers,
            "recent_appointments": recent_appointments,
            "total_revenue": total_revenue / 100,  # Convert cents to dollars
            "period_days": days,
            "timestamp": datetime.utcnow().isoformat()
        }

    @staticmethod
    def get_revenue_analytics(
        db: Session,
        organization_id: UUID,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get revenue analytics"""
        start_date = datetime.utcnow() - timedelta(days=days)

        payments = db.query(Payment).filter(
            Payment.organization_id == organization_id,
            Payment.status == "completed",
            Payment.created_at >= start_date
        ).all()

        total_revenue = sum(p.amount_cents for p in payments) / 100
        payment_count = len(payments)
        avg_payment = total_revenue / payment_count if payment_count > 0 else 0

        return {
            "total_revenue": total_revenue,
            "payment_count": payment_count,
            "average_payment": avg_payment,
            "period_days": days
        }

    @staticmethod
    def get_appointment_analytics(
        db: Session,
        organization_id: UUID,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get appointment analytics"""
        start_date = datetime.utcnow() - timedelta(days=days)

        appointments = db.query(Appointment).filter(
            Appointment.organization_id == organization_id,
            Appointment.created_at >= start_date
        ).all()

        confirmed = len([a for a in appointments if a.status == "confirmed"])
        pending = len([a for a in appointments if a.status == "pending"])
        cancelled = len([a for a in appointments if a.status == "cancelled"])

        return {
            "total_appointments": len(appointments),
            "confirmed": confirmed,
            "pending": pending,
            "cancelled": cancelled,
            "period_days": days
        }

    @staticmethod
    def get_customer_analytics(
        db: Session,
        organization_id: UUID,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get customer analytics"""
        start_date = datetime.utcnow() - timedelta(days=days)

        new_customers = db.query(Customer).filter(
            Customer.organization_id == organization_id,
            Customer.created_at >= start_date
        ).count()

        total_customers = db.query(Customer).filter(
            Customer.organization_id == organization_id
        ).count()

        return {
            "new_customers": new_customers,
            "total_customers": total_customers,
            "period_days": days
        }

    @staticmethod
    def get_conversion_funnel(
        db: Session,
        organization_id: UUID
    ) -> Dict[str, Any]:
        """Get conversion funnel data"""
        total_customers = db.query(Customer).filter(
            Customer.organization_id == organization_id
        ).count()

        booked_customers = db.query(Customer).filter(
            Customer.organization_id == organization_id
        ).join(Appointment).distinct().count()

        paid_customers = db.query(Customer).filter(
            Customer.organization_id == organization_id
        ).join(Payment).distinct().count()

        return {
            "total_leads": total_customers,
            "booked": booked_customers,
            "paid": paid_customers,
            "booking_rate": (booked_customers / total_customers * 100) if total_customers > 0 else 0,
            "payment_rate": (paid_customers / booked_customers * 100) if booked_customers > 0 else 0
        }

    @staticmethod
    def get_forecast(
        db: Session,
        organization_id: UUID,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get revenue forecast"""
        # Simple forecast based on historical average
        start_date = datetime.utcnow() - timedelta(days=days * 2)

        historical_payments = db.query(Payment).filter(
            Payment.organization_id == organization_id,
            Payment.status == "completed",
            Payment.created_at >= start_date
        ).all()

        daily_average = (sum(p.amount_cents for p in historical_payments) / 100) / (days * 2) if historical_payments else 0
        forecasted_revenue = daily_average * days

        return {
            "forecasted_revenue": forecasted_revenue,
            "daily_average": daily_average,
            "period_days": days
        }

    @staticmethod
    def export_report(
        db: Session,
        organization_id: UUID,
        report_type: str = "summary",
        days: int = 30
    ) -> Dict[str, Any]:
        """Export report data"""
        dashboard = AnalyticsService.get_dashboard_metrics(db, organization_id, days)
        revenue = AnalyticsService.get_revenue_analytics(db, organization_id, days)
        appointments = AnalyticsService.get_appointment_analytics(db, organization_id, days)
        customers = AnalyticsService.get_customer_analytics(db, organization_id, days)

        return {
            "report_type": report_type,
            "generated_at": datetime.utcnow().isoformat(),
            "period_days": days,
            "dashboard": dashboard,
            "revenue": revenue,
            "appointments": appointments,
            "customers": customers
        }
