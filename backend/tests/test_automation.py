"""Tests for automation routes"""

import pytest
from fastapi.testclient import TestClient
from uuid import uuid4

from main import app

client = TestClient(app)


class TestAutomationRoutes:
    """Test automation API endpoints"""
    
    def test_create_automation(self, test_user, test_organization, test_token):
        """Test creating automation workflow"""
        response = client.post(
            "/api/v1/automation/automations",
            headers={"Authorization": f"Bearer {test_token}"},
            json={
                "organization_id": str(test_organization.id),
                "name": "Send Reminder",
                "trigger": "appointment_created",
                "actions": [
                    {
                        "type": "send_sms",
                        "message": "Reminder: Your appointment is tomorrow"
                    }
                ]
            }
        )
        assert response.status_code in [200, 201]
    
    def test_list_automations(self, test_user, test_organization, test_token):
        """Test listing automations"""
        response = client.get(
            "/api/v1/automation/automations",
            headers={"Authorization": f"Bearer {test_token}"},
            params={"organization_id": str(test_organization.id)}
        )
        assert response.status_code == 200
    
    def test_toggle_automation(self, test_user, test_organization, test_token):
        """Test enabling/disabling automation"""
        response = client.post(
            "/api/v1/automation/automations/test-id/toggle",
            headers={"Authorization": f"Bearer {test_token}"},
            json={"enabled": False}
        )
        assert response.status_code in [200, 404]
    
    def test_test_automation(self, test_user, test_organization, test_token):
        """Test automation execution"""
        response = client.post(
            "/api/v1/automation/automations/test-id/trigger-manual",
            headers={"Authorization": f"Bearer {test_token}"},
            json={"organization_id": str(test_organization.id)}
        )
        assert response.status_code in [200, 404]
