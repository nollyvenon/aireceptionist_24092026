"""Advanced analytics service for business intelligence"""

from sqlalchemy.orm import Session
from uuid import UUID
from app.models.appointment import Appointment, AppointmentStatus
from app.models.payment import Payment, PaymentStatus
from app.models.crm import Lead, Deal
from app.models.communication import Call, CallStatus, CallType
from datetime import datetime, timedelta


class AnalyticsService:
    @staticmethod
    def get_revenue_analytics(org_id: UUID, db: Session, days: int = 30) -> dict:
        """Get detailed revenue analytics"""
        start_date = datetime.utcnow() - timedelta(days=days)
        payments = db.query(Payment).filter(
            Payment.organization_id == org_id,
            Payment.created_at >= start_date,
            Payment.status == PaymentStatus.COMPLETED
        ).all()

        if not payments:
            return {
                "period_days": days,
                "total_revenue": 0,
                "transactions": 0,
                "average_transaction": 0,
                "daily_breakdown": {},
                "revenue_trend": [],
                "growth_rate": 0,
            }

        total_revenue = sum(p.amount for p in payments)
        transactions = len(payments)
        avg_transaction = total_revenue / transactions if transactions > 0 else 0

        daily_breakdown = {}
        for payment in payments:
            date_key = payment.created_at.date().isoformat()
            if date_key not in daily_breakdown:
                daily_breakdown[date_key] = {"revenue": 0, "count": 0}
            daily_breakdown[date_key]["revenue"] += payment.amount
            daily_breakdown[date_key]["count"] += 1

        revenue_trend = [
            {"date": date, "amount": data["revenue"], "transactions": data["count"]}
            for date, data in sorted(daily_breakdown.items())
        ]

        first_half = payments[:len(payments)//2]
        second_half = payments[len(payments)//2:]
        first_half_revenue = sum(p.amount for p in first_half) if first_half else 0
        second_half_revenue = sum(p.amount for p in second_half) if second_half else 0
        growth_rate = ((second_half_revenue - first_half_revenue) / first_half_revenue * 100) if first_half_revenue > 0 else 0

        return {
            "period_days": days,
            "total_revenue": total_revenue,
            "transactions": transactions,
            "average_transaction": round(avg_transaction, 2),
            "daily_breakdown": daily_breakdown,
            "revenue_trend": revenue_trend,
            "growth_rate": round(growth_rate, 2),
        }

    @staticmethod
    def get_appointment_analytics(org_id: UUID, db: Session, days: int = 30) -> dict:
        """Get detailed appointment analytics"""
        start_date = datetime.utcnow() - timedelta(days=days)
        appointments = db.query(Appointment).filter(
            Appointment.organization_id == org_id,
            Appointment.created_at >= start_date
        ).all()

        if not appointments:
            return {
                "period_days": days,
                "total": 0,
                "completed": 0,
                "pending": 0,
                "cancelled": 0,
                "no_show": 0,
                "completion_rate": 0,
                "no_show_rate": 0,
                "daily_breakdown": {},
            }

        total = len(appointments)
        completed = len([a for a in appointments if a.status == AppointmentStatus.COMPLETED])
        pending = len([a for a in appointments if a.status == AppointmentStatus.PENDING])
        cancelled = len([a for a in appointments if a.status == AppointmentStatus.CANCELLED])
        no_show = len([a for a in appointments if a.status == AppointmentStatus.NO_SHOW])

        daily_breakdown = {}
        for appointment in appointments:
            date_key = appointment.created_at.date().isoformat()
            if date_key not in daily_breakdown:
                daily_breakdown[date_key] = {"total": 0, "completed": 0, "no_show": 0}
            daily_breakdown[date_key]["total"] += 1
            if appointment.status == AppointmentStatus.COMPLETED:
                daily_breakdown[date_key]["completed"] += 1
            if appointment.status == AppointmentStatus.NO_SHOW:
                daily_breakdown[date_key]["no_show"] += 1

        return {
            "period_days": days,
            "total": total,
            "completed": completed,
            "pending": pending,
            "cancelled": cancelled,
            "no_show": no_show,
            "completion_rate": round((completed / total * 100) if total > 0 else 0, 2),
            "no_show_rate": round((no_show / total * 100) if total > 0 else 0, 2),
            "daily_breakdown": daily_breakdown,
        }

    @staticmethod
    def get_call_analytics(org_id: UUID, db: Session, days: int = 30) -> dict:
        """Get detailed call analytics"""
        start_date = datetime.utcnow() - timedelta(days=days)
        calls = db.query(Call).filter(
            Call.organization_id == org_id,
            Call.created_at >= start_date
        ).all()

        if not calls:
            return {
                "period_days": days,
                "total": 0,
                "inbound": 0,
                "outbound": 0,
                "completed": 0,
                "failed": 0,
                "missed": 0,
                "total_duration": 0,
                "average_duration": 0,
                "success_rate": 0,
                "daily_stats": {},
            }

        total = len(calls)
        inbound = len([c for c in calls if c.call_type == CallType.INBOUND])
        outbound = len([c for c in calls if c.call_type == CallType.OUTBOUND])
        completed = len([c for c in calls if c.status == CallStatus.COMPLETED])
        failed = len([c for c in calls if c.status == CallStatus.FAILED])
        missed = len([c for c in calls if c.status == CallStatus.MISSED])

        total_duration = sum(c.duration for c in calls)
        avg_duration = total_duration / total if total > 0 else 0
        success_rate = (completed / total * 100) if total > 0 else 0

        daily_stats = {}
        for call in calls:
            date_key = call.created_at.date().isoformat()
            if date_key not in daily_stats:
                daily_stats[date_key] = {
                    "total": 0,
                    "inbound": 0,
                    "outbound": 0,
                    "completed": 0,
                    "duration": 0,
                }
            daily_stats[date_key]["total"] += 1
            if call.call_type == CallType.INBOUND:
                daily_stats[date_key]["inbound"] += 1
            else:
                daily_stats[date_key]["outbound"] += 1
            if call.status == CallStatus.COMPLETED:
                daily_stats[date_key]["completed"] += 1
            daily_stats[date_key]["duration"] += call.duration

        return {
            "period_days": days,
            "total": total,
            "inbound": inbound,
            "outbound": outbound,
            "completed": completed,
            "failed": failed,
            "missed": missed,
            "total_duration": total_duration,
            "average_duration": round(avg_duration, 2),
            "success_rate": round(success_rate, 2),
            "daily_stats": daily_stats,
        }

    @staticmethod
    def get_lead_analytics(org_id: UUID, db: Session) -> dict:
        """Get lead funnel and conversion analytics"""
        leads = db.query(Lead).filter(Lead.organization_id == org_id).all()

        if not leads:
            return {
                "total": 0,
                "by_status": {},
                "average_score": 0,
                "conversion_rate": 0,
                "hot_leads": 0,
                "cold_leads": 0,
            }

        total = len(leads)

        by_status = {}
        for lead in leads:
            status = lead.status.value
            if status not in by_status:
                by_status[status] = 0
            by_status[status] += 1

        avg_score = sum(l.lead_score for l in leads if l.lead_score) / total if total > 0 else 0

        qualified = len([l for l in leads if l.status.value in ["qualified", "negotiation", "closed_won"]])
        conversion_rate = (qualified / total * 100) if total > 0 else 0

        hot_leads = len([l for l in leads if l.lead_score and l.lead_score >= 80])
        cold_leads = len([l for l in leads if l.lead_score and l.lead_score < 30])

        return {
            "total": total,
            "by_status": by_status,
            "average_score": round(avg_score, 2),
            "conversion_rate": round(conversion_rate, 2),
            "hot_leads": hot_leads,
            "cold_leads": cold_leads,
        }

    @staticmethod
    def get_deal_analytics(org_id: UUID, db: Session) -> dict:
        """Get deal pipeline and sales analytics"""
        deals = db.query(Deal).filter(Deal.organization_id == org_id).all()

        if not deals:
            return {
                "total": 0,
                "total_value": 0,
                "average_value": 0,
                "won": 0,
                "lost": 0,
                "win_rate": 0,
                "by_status": {},
                "pipeline_value": {},
            }

        total = len(deals)
        total_value = sum(d.value for d in deals)
        avg_value = total_value / total if total > 0 else 0

        won = len([d for d in deals if d.status.value == "closed_won"])
        lost = len([d for d in deals if d.status.value == "closed_lost"])
        win_rate = (won / (won + lost) * 100) if (won + lost) > 0 else 0

        by_status = {}
        pipeline_value = {}
        for deal in deals:
            status = deal.status.value
            if status not in by_status:
                by_status[status] = 0
                pipeline_value[status] = 0
            by_status[status] += 1
            pipeline_value[status] += float(deal.value)

        return {
            "total": total,
            "total_value": float(total_value),
            "average_value": round(float(avg_value), 2),
            "won": won,
            "lost": lost,
            "win_rate": round(win_rate, 2),
            "by_status": by_status,
            "pipeline_value": {k: round(v, 2) for k, v in pipeline_value.items()},
        }

    @staticmethod
    def get_business_summary(org_id: UUID, db: Session) -> dict:
        """Get comprehensive business summary"""
        revenue = AnalyticsService.get_revenue_analytics(org_id, db, 30)
        appointments = AnalyticsService.get_appointment_analytics(org_id, db, 30)
        calls = AnalyticsService.get_call_analytics(org_id, db, 30)
        leads = AnalyticsService.get_lead_analytics(org_id, db)
        deals = AnalyticsService.get_deal_analytics(org_id, db)

        return {
            "revenue": {
                "total_30d": revenue["total_revenue"],
                "transactions_30d": revenue["transactions"],
                "average_transaction": revenue["average_transaction"],
            },
            "appointments": {
                "total_30d": appointments["total"],
                "completed_30d": appointments["completed"],
                "completion_rate": appointments["completion_rate"],
            },
            "calls": {
                "total_30d": calls["total"],
                "inbound_30d": calls["inbound"],
                "success_rate_30d": calls["success_rate"],
            },
            "leads": {
                "total": leads["total"],
                "average_score": leads["average_score"],
                "conversion_rate": leads["conversion_rate"],
            },
            "deals": {
                "total": deals["total"],
                "pipeline_value": deals["total_value"],
                "win_rate": deals["win_rate"],
            },
            "timestamp": datetime.utcnow().isoformat(),
        }

    @staticmethod
    def get_dashboard_metrics(org_id: UUID, db: Session):
        summary = AnalyticsService.get_business_summary(org_id, db)
        return {
            "total_appointments": summary["appointments"]["total_30d"],
            "confirmed_rate": summary["appointments"]["completion_rate"] / 100,
            "revenue": summary["revenue"]["total_30d"],
            "new_customers": 0,
        }
