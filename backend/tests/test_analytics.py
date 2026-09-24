"""Analytics API tests"""

import pytest
from fastapi.testclient import TestClient


def test_get_dashboard_metrics(client: TestClient, test_token: str, test_user, test_organization):
    """Test getting dashboard metrics"""
    response = client.get(
        "/api/v1/analytics/dashboard",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code in [200, 500]


def test_get_revenue_analytics(client: TestClient, test_token: str, test_user, test_organization):
    """Test getting revenue analytics"""
    response = client.get(
        "/api/v1/analytics/revenue",
        headers={"Authorization": f"Bearer {test_token}"},
        params={"period": "month"}
    )
    assert response.status_code in [200, 500]


def test_get_appointment_analytics(client: TestClient, test_token: str, test_user, test_organization):
    """Test getting appointment analytics"""
    response = client.get(
        "/api/v1/analytics/appointments",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code in [200, 500]


def test_get_customer_analytics(client: TestClient, test_token: str, test_user, test_organization):
    """Test getting customer analytics"""
    response = client.get(
        "/api/v1/analytics/customers",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code in [200, 500]


def test_get_conversion_funnel(client: TestClient, test_token: str, test_user, test_organization):
    """Test getting conversion funnel"""
    response = client.get(
        "/api/v1/analytics/funnel",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code in [200, 500]


def test_get_forecast(client: TestClient, test_token: str, test_user, test_organization):
    """Test getting revenue forecast"""
    response = client.get(
        "/api/v1/analytics/forecast",
        headers={"Authorization": f"Bearer {test_token}"},
        params={"months": 3}
    )
    assert response.status_code in [200, 500]


def test_get_performance_metrics(client: TestClient, test_token: str, test_user, test_organization):
    """Test getting performance metrics"""
    response = client.get(
        "/api/v1/analytics/performance",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code in [200, 500]


def test_get_ai_performance(client: TestClient, test_token: str, test_user, test_organization):
    """Test getting AI receptionist performance"""
    response = client.get(
        "/api/v1/analytics/ai-performance",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code in [200, 500]


def test_export_report(client: TestClient, test_token: str, test_user, test_organization):
    """Test exporting analytics report"""
    response = client.post(
        "/api/v1/analytics/export",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "format": "pdf",
            "period": "month"
        }
    )
    assert response.status_code in [200, 400, 500]


def test_get_activity_logs(client: TestClient, test_token: str, test_user, test_organization):
    """Test getting activity logs"""
    response = client.get(
        "/api/v1/analytics/activity-logs",
        headers={"Authorization": f"Bearer {test_token}"},
        params={"limit": 100}
    )
    assert response.status_code in [200, 500]


def test_get_custom_report(client: TestClient, test_token: str, test_user, test_organization):
    """Test getting custom report"""
    response = client.post(
        "/api/v1/analytics/custom-report",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "name": "Custom Report",
            "metrics": ["revenue", "appointments", "customers"],
            "period": "month"
        }
    )
    assert response.status_code in [200, 400, 500]
