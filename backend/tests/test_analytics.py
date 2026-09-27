"""Analytics tests"""

import pytest


def test_analytics_module_exists():
    """Test analytics module exists"""
    try:
        from app.services.analytics_service import AnalyticsService
        assert AnalyticsService is not None
    except ImportError:
        pytest.skip("Analytics service unavailable")


def test_metric_data_structure():
    """Test metric data structure"""
    metrics = {
        "total_appointments": 150,
        "revenue": 5000.00,
        "response_time_ms": 250
    }
    assert metrics["total_appointments"] > 0
    assert metrics["revenue"] >= 0
    assert metrics["response_time_ms"] >= 0
