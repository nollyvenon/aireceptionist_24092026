"""Tests for marketplace routes"""

import pytest
from fastapi.testclient import TestClient
from uuid import uuid4

from main import app

client = TestClient(app)


class TestMarketplaceRoutes:
    """Test marketplace API endpoints"""
    
    def test_list_integrations(self, test_user, test_organization, test_token):
        """Test listing available integrations"""
        response = client.get(
            "/api/v1/marketplace/integrations",
            headers={"Authorization": f"Bearer {test_token}"},
            params={"organization_id": str(test_organization.id)}
        )
        assert response.status_code == 200
    
    def test_list_installed_integrations(self, test_user, test_organization, test_token):
        """Test listing installed integrations"""
        response = client.get(
            "/api/v1/marketplace/integrations/installed",
            headers={"Authorization": f"Bearer {test_token}"},
            params={"organization_id": str(test_organization.id)}
        )
        assert response.status_code == 200
    
    def test_create_api_key(self, test_user, test_organization, test_token):
        """Test creating API key"""
        response = client.post(
            "/api/v1/marketplace/api-keys",
            headers={"Authorization": f"Bearer {test_token}"},
            json={
                "organization_id": str(test_organization.id),
                "name": "Test API Key",
                "scopes": ["read:customers", "read:appointments"]
            }
        )
        assert response.status_code in [200, 201]
    
    def test_list_api_keys(self, test_user, test_organization, test_token):
        """Test listing API keys"""
        response = client.get(
            "/api/v1/marketplace/api-keys",
            headers={"Authorization": f"Bearer {test_token}"},
            params={"organization_id": str(test_organization.id)}
        )
        assert response.status_code == 200
    
    def test_create_webhook(self, test_user, test_organization, test_token):
        """Test creating webhook"""
        response = client.post(
            "/api/v1/marketplace/webhooks",
            headers={"Authorization": f"Bearer {test_token}"},
            json={
                "organization_id": str(test_organization.id),
                "url": "https://example.com/webhook",
                "events": ["appointment.created", "payment.completed"]
            }
        )
        assert response.status_code in [200, 201]
    
    def test_list_webhooks(self, test_user, test_organization, test_token):
        """Test listing webhooks"""
        response = client.get(
            "/api/v1/marketplace/webhooks",
            headers={"Authorization": f"Bearer {test_token}"},
            params={"organization_id": str(test_organization.id)}
        )
        assert response.status_code == 200
