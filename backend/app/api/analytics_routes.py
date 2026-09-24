"""Analytics and reporting routes"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.services.analytics_service import AnalyticsService
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])
analytics_service = AnalyticsService()

# Dashboard metrics
@router.get("/dashboard")
async def get_dashboard_metrics(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard overview metrics"""
    try:
        metrics = await analytics_service.get_dashboard_metrics(
            organization_id=current_user.get("organization_id"),
            db=db
        )
        return metrics
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Revenue analytics
@router.get("/revenue")
async def get_revenue_analytics(
    period: str = "month",
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get revenue metrics"""
    try:
        revenue = await analytics_service.get_revenue_analytics(
            organization_id=current_user.get("organization_id"),
            period=period,
            db=db
        )
        return revenue
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Appointment analytics
@router.get("/appointments")
async def get_appointment_analytics(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get appointment statistics"""
    try:
        stats = await analytics_service.get_appointment_analytics(
            organization_id=current_user.get("organization_id"),
            db=db
        )
        return stats
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Customer analytics
@router.get("/customers")
async def get_customer_analytics(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get customer insights"""
    try:
        analytics = await analytics_service.get_customer_analytics(
            organization_id=current_user.get("organization_id"),
            db=db
        )
        return analytics
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Top customers
@router.get("/top-customers")
async def get_top_customers(
    limit: int = 10,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get top customers by revenue"""
    try:
        customers = await analytics_service.get_top_customers(
            organization_id=current_user.get("organization_id"),
            limit=limit,
            db=db
        )
        return customers
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Staff utilization
@router.get("/staff-utilization")
async def get_staff_utilization(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get staff utilization rates"""
    try:
        utilization = await analytics_service.get_staff_utilization(
            organization_id=current_user.get("organization_id"),
            db=db
        )
        return utilization
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Conversion funnel
@router.get("/funnel")
async def get_conversion_funnel(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get conversion funnel metrics"""
    try:
        funnel = await analytics_service.get_conversion_funnel(
            organization_id=current_user.get("organization_id"),
            db=db
        )
        return funnel
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Forecasting
@router.get("/forecast/{months}")
async def get_forecast(
    months: int = 3,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Forecast future metrics"""
    try:
        forecast = await analytics_service.forecast_metrics(
            organization_id=current_user.get("organization_id"),
            months=months,
            db=db
        )
        return forecast
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Export report
@router.post("/export")
async def export_report(
    report_config: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export analytics report to CSV/PDF"""
    try:
        report_url = await analytics_service.export_report(
            organization_id=current_user.get("organization_id"),
            format=report_config.get("format", "csv"),
            metrics=report_config.get("metrics"),
            db=db
        )
        return {"url": report_url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Custom report
@router.post("/custom")
async def create_custom_report(
    report_data: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create custom analytics report"""
    try:
        report = await analytics_service.create_custom_report(
            organization_id=current_user.get("organization_id"),
            name=report_data.get("name"),
            metrics=report_data.get("metrics"),
            dimensions=report_data.get("dimensions"),
            filters=report_data.get("filters"),
            db=db
        )
        return report
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# AI performance
@router.get("/ai-performance")
async def get_ai_performance(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI receptionist performance metrics"""
    try:
        performance = await analytics_service.get_ai_performance(
            organization_id=current_user.get("organization_id"),
            db=db
        )
        return performance
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
