"""Tests for analytics routes"""

import pytest
from fastapi.testclient import TestClient
from uuid import uuid4

from main import app

client = TestClient(app)


class TestAnalyticsRoutes:
    """Test analytics API endpoints"""
    
    def test_get_dashboard_metrics(self, test_user, test_organization, test_token):
        """Test getting dashboard metrics"""
        response = client.get(
            "/api/v1/analytics/dashboard",
            headers={"Authorization": f"Bearer {test_token}"},
            params={"organization_id": str(test_organization.id)}
        )
        assert response.status_code == 200
    
    def test_get_revenue_analytics(self, test_user, test_organization, test_token):
        """Test revenue analytics"""
        response = client.get(
            "/api/v1/analytics/revenue",
            headers={"Authorization": f"Bearer {test_token}"},
            params={"organization_id": str(test_organization.id)}
        )
        assert response.status_code == 200
    
    def test_get_appointment_analytics(self, test_user, test_organization, test_token):
        """Test appointment analytics"""
        response = client.get(
            "/api/v1/analytics/appointments",
            headers={"Authorization": f"Bearer {test_token}"},
            params={"organization_id": str(test_organization.id)}
        )
        assert response.status_code == 200
    
    def test_get_customer_analytics(self, test_user, test_organization, test_token):
        """Test customer analytics"""
        response = client.get(
            "/api/v1/analytics/customers",
            headers={"Authorization": f"Bearer {test_token}"},
            params={"organization_id": str(test_organization.id)}
        )
        assert response.status_code == 200
    
    def test_get_conversion_funnel(self, test_user, test_organization, test_token):
        """Test conversion funnel analysis"""
        response = client.get(
            "/api/v1/analytics/funnel",
            headers={"Authorization": f"Bearer {test_token}"},
            params={"organization_id": str(test_organization.id)}
        )
        assert response.status_code == 200
    
    def test_get_forecast(self, test_user, test_organization, test_token):
        """Test revenue forecast"""
        response = client.get(
            "/api/v1/analytics/forecast",
            headers={"Authorization": f"Bearer {test_token}"},
            params={"organization_id": str(test_organization.id)}
        )
        assert response.status_code == 200


class TestReports:
    """Test reporting functionality"""
    
    def test_export_report(self, test_user, test_organization, test_token):
        """Test exporting report"""
        response = client.post(
            "/api/v1/analytics/reports/export",
            headers={"Authorization": f"Bearer {test_token}"},
            json={
                "organization_id": str(test_organization.id),
                "report_type": "revenue",
                "format": "csv"
            }
        )
        assert response.status_code in [200, 201]
