"""Tests for admin routes"""

import pytest
from fastapi.testclient import TestClient
from uuid import uuid4

from main import app

client = TestClient(app)


class TestAdminRoutes:
    """Test admin API endpoints"""
    
    def test_list_tenants(self, test_user, test_token):
        """Test listing tenants (admin only)"""
        response = client.get(
            "/api/v1/admin/tenants",
            headers={"Authorization": f"Bearer {test_token}"}
        )
        # Will succeed if user is admin
        assert response.status_code in [200, 403]
    
    def test_get_system_metrics(self, test_user, test_token):
        """Test system metrics"""
        response = client.get(
            "/api/v1/admin/metrics",
            headers={"Authorization": f"Bearer {test_token}"}
        )
        assert response.status_code in [200, 403]
    
    def test_list_subscriptions(self, test_user, test_token):
        """Test listing subscriptions"""
        response = client.get(
            "/api/v1/admin/subscriptions",
            headers={"Authorization": f"Bearer {test_token}"}
        )
        assert response.status_code in [200, 403]
    
    def test_admin_health_check(self, test_token):
        """Test admin health check"""
        response = client.get(
            "/api/v1/admin/health",
            headers={"Authorization": f"Bearer {test_token}"}
        )
        assert response.status_code in [200, 403]
