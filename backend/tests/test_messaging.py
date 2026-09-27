"""Tests for messaging routes"""

import pytest
from fastapi.testclient import TestClient
from uuid import uuid4

from main import app

client = TestClient(app)


class TestMessagingRoutes:
    """Test messaging API endpoints"""
    
    def test_send_sms(self, test_user, test_organization, test_customer, test_token):
        """Test sending SMS"""
        response = client.post(
            "/api/v1/messaging/sms/send",
            headers={"Authorization": f"Bearer {test_token}"},
            json={
                "organization_id": str(test_organization.id),
                "customer_id": str(test_customer.id),
                "message": "Test SMS message",
                "phone": "+1234567890"
            }
        )
        assert response.status_code in [200, 201]
    
    def test_send_email(self, test_user, test_organization, test_customer, test_token):
        """Test sending email"""
        response = client.post(
            "/api/v1/messaging/email/send",
            headers={"Authorization": f"Bearer {test_token}"},
            json={
                "organization_id": str(test_organization.id),
                "customer_id": str(test_customer.id),
                "subject": "Test Email",
                "body": "Test email body",
                "to": "test@example.com"
            }
        )
        assert response.status_code in [200, 201]
    
    def test_send_whatsapp(self, test_user, test_organization, test_customer, test_token):
        """Test sending WhatsApp message"""
        response = client.post(
            "/api/v1/messaging/whatsapp/send",
            headers={"Authorization": f"Bearer {test_token}"},
            json={
                "organization_id": str(test_organization.id),
                "customer_id": str(test_customer.id),
                "message": "Test WhatsApp message",
                "phone": "+1234567890"
            }
        )
        assert response.status_code in [200, 201]
    
    def test_create_campaign(self, test_user, test_organization, test_token):
        """Test creating messaging campaign"""
        response = client.post(
            "/api/v1/messaging/campaigns",
            headers={"Authorization": f"Bearer {test_token}"},
            json={
                "organization_id": str(test_organization.id),
                "name": "Test Campaign",
                "message": "Test campaign message",
                "channel": "sms"
            }
        )
        assert response.status_code in [200, 201]
    
    def test_list_campaigns(self, test_user, test_organization, test_token):
        """Test listing campaigns"""
        response = client.get(
            "/api/v1/messaging/campaigns",
            headers={"Authorization": f"Bearer {test_token}"},
            params={"organization_id": str(test_organization.id)}
        )
        assert response.status_code == 200


class TestMessageTemplates:
    """Test message templates"""
    
    def test_create_template(self, test_user, test_organization, test_token):
        """Test creating message template"""
        response = client.post(
            "/api/v1/messaging/templates",
            headers={"Authorization": f"Bearer {test_token}"},
            json={
                "organization_id": str(test_organization.id),
                "name": "Welcome Template",
                "content": "Welcome {{name}}, your appointment is on {{date}}",
                "channel": "sms"
            }
        )
        assert response.status_code in [200, 201]
    
    def test_list_templates(self, test_user, test_organization, test_token):
        """Test listing templates"""
        response = client.get(
            "/api/v1/messaging/templates",
            headers={"Authorization": f"Bearer {test_token}"},
            params={"organization_id": str(test_organization.id)}
        )
        assert response.status_code == 200
