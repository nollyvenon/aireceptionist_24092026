"""Analytics schemas"""

from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

class MetricResponse(BaseModel):
    name: str
    value: Any
    unit: Optional[str] = None
    timestamp: datetime

class DashboardMetricsResponse(BaseModel):
    metrics: List[MetricResponse]
    period: str

class ReportExportRequest(BaseModel):
    report_type: str
    format: str = "csv"
    date_range: Optional[str] = None

class ReportExportResponse(BaseModel):
    report_id: UUID
    download_url: str
    created_at: datetime
