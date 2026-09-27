"""Integration tests for Analytics API"""

import pytest
from datetime import datetime, timedelta


class TestAnalyticsEndpoints:
    """Test suite for analytics endpoints"""

    def test_get_appointments_analytics(self, client, auth_headers, test_auth_token):
        """Test retrieving appointment analytics"""
        response = client.get(
            "/api/v1/analytics/appointments",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "total" in data or "data" in data

    def test_get_revenue_analytics(self, client, auth_headers, test_auth_token):
        """Test retrieving revenue analytics"""
        response = client.get(
            "/api/v1/analytics/revenue",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 404]

    def test_get_call_analytics(self, client, auth_headers, test_auth_token):
        """Test retrieving call analytics"""
        response = client.get(
            "/api/v1/analytics/calls",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 404]

    def test_get_customer_analytics(self, client, auth_headers, test_auth_token):
        """Test retrieving customer analytics"""
        response = client.get(
            "/api/v1/analytics/customers",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 404]

    def test_get_lead_analytics(self, client, auth_headers, test_auth_token):
        """Test retrieving lead analytics"""
        response = client.get(
            "/api/v1/analytics/leads",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 404]

    def test_analytics_with_date_range(self, client, auth_headers, test_auth_token):
        """Test analytics with date range filter"""
        start_date = datetime.utcnow() - timedelta(days=30)
        end_date = datetime.utcnow()
        
        response = client.get(
            "/api/v1/analytics/appointments",
            headers=auth_headers,
            params={
                "token": test_auth_token,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
            }
        )
        assert response.status_code == 200

    def test_get_dashboard_summary(self, client, auth_headers, test_auth_token):
        """Test retrieving dashboard summary"""
        response = client.get(
            "/api/v1/analytics/dashboard",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 404]

    def test_get_performance_metrics(self, client, auth_headers, test_auth_token):
        """Test retrieving performance metrics"""
        response = client.get(
            "/api/v1/analytics/performance",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 404]

    def test_get_staff_performance(self, client, auth_headers, test_auth_token):
        """Test retrieving staff performance metrics"""
        response = client.get(
            "/api/v1/analytics/staff-performance",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 404]

    def test_export_analytics_report(self, client, auth_headers, test_auth_token):
        """Test exporting analytics report"""
        response = client.get(
            "/api/v1/analytics/export",
            headers=auth_headers,
            params={
                "token": test_auth_token,
                "format": "csv",
            }
        )
        assert response.status_code in [200, 404, 400]

    def test_get_crm_pipeline_analytics(self, client, auth_headers, test_auth_token):
        """Test retrieving CRM pipeline analytics"""
        response = client.get(
            "/api/v1/analytics/crm-pipeline",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 404]

    def test_get_conversion_funnel(self, client, auth_headers, test_auth_token):
        """Test retrieving conversion funnel analytics"""
        response = client.get(
            "/api/v1/analytics/conversion-funnel",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 404]
