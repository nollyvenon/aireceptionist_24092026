"""Analytics service"""

from sqlalchemy.orm import Session
from uuid import UUID

class AnalyticsService:
    @staticmethod
    def get_dashboard_metrics(org_id: UUID, db: Session):
        return {
            "total_appointments": 42,
            "confirmed_rate": 0.85,
            "revenue": 12500,
            "new_customers": 8
        }
    
    @staticmethod
    def get_revenue_analytics(org_id: UUID, db: Session):
        return {
            "total_revenue": 50000,
            "monthly_trend": [1000, 2000, 1500],
            "forecast": 52500
        }
