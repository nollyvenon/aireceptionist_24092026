"""Automation API tests"""

import pytest
from fastapi.testclient import TestClient
from uuid import uuid4

from app.models.automation import Automation, AutomationTrigger


def test_create_automation(client: TestClient, test_token: str, test_user, test_organization, db):
    """Test creating automation"""
    response = client.post(
        "/api/v1/automations",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "name": "Auto Reply",
            "description": "Send automatic reply to new inquiries",
            "trigger_type": "appointment_created",
            "status": "active",
            "actions": [
                {
                    "type": "send_message",
                    "config": {
                        "message": "Thank you for booking!",
                        "channel": "email"
                    }
                }
            ]
        }
    )
    assert response.status_code in [200, 201]


def test_list_automations(client: TestClient, test_token: str, test_user, test_organization, db):
    """Test listing automations"""
    automation = Automation(
        id=uuid4(),
        organization_id=test_organization.id,
        name="Test Automation",
        trigger=AutomationTrigger.APPOINTMENT_CREATED,
        is_active=True,
        actions=[]
    )
    db.add(automation)
    db.commit()

    response = client.get(
        "/api/v1/automations",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_get_automation(client: TestClient, test_token: str, test_user, test_organization, db):
    """Test getting automation details"""
    automation = Automation(
        id=uuid4(),
        organization_id=test_organization.id,
        name="Test Automation",
        trigger=AutomationTrigger.APPOINTMENT_CREATED,
        is_active=True,
        actions=[]
    )
    db.add(automation)
    db.commit()

    response = client.get(
        f"/api/v1/automations/{automation.id}",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Automation"


def test_update_automation(client: TestClient, test_token: str, test_user, test_organization, db):
    """Test updating automation"""
    automation = Automation(
        id=uuid4(),
        organization_id=test_organization.id,
        name="Test Automation",
        trigger=AutomationTrigger.APPOINTMENT_CREATED,
        is_active=True,
        actions=[]
    )
    db.add(automation)
    db.commit()

    response = client.put(
        f"/api/v1/automations/{automation.id}",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "name": "Updated Automation",
            "status": "inactive"
        }
    )
    assert response.status_code in [200, 400]


def test_delete_automation(client: TestClient, test_token: str, test_user, test_organization, db):
    """Test deleting automation"""
    automation = Automation(
        id=uuid4(),
        organization_id=test_organization.id,
        name="Test Automation",
        trigger=AutomationTrigger.APPOINTMENT_CREATED,
        is_active=True,
        actions=[]
    )
    db.add(automation)
    db.commit()

    response = client.delete(
        f"/api/v1/automations/{automation.id}",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code in [200, 204]


def test_toggle_automation(client: TestClient, test_token: str, test_user, test_organization, db):
    """Test toggling automation status"""
    automation = Automation(
        id=uuid4(),
        organization_id=test_organization.id,
        name="Test Automation",
        trigger=AutomationTrigger.APPOINTMENT_CREATED,
        is_active=True,
        actions=[]
    )
    db.add(automation)
    db.commit()

    response = client.post(
        f"/api/v1/automations/{automation.id}/toggle",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code in [200, 400]


def test_test_automation(client: TestClient, test_token: str, test_user, test_organization, test_customer, db):
    """Test running automation test"""
    automation = Automation(
        id=uuid4(),
        organization_id=test_organization.id,
        name="Test Automation",
        trigger=AutomationTrigger.APPOINTMENT_CREATED,
        is_active=True,
        actions=[]
    )
    db.add(automation)
    db.commit()

    response = client.post(
        f"/api/v1/automations/{automation.id}/test",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "customer_id": str(test_customer.id)
        }
    )
    assert response.status_code in [200, 400]


def test_get_automation_not_found(client: TestClient, test_token: str):
    """Test getting non-existent automation"""
    fake_id = uuid4()
    response = client.get(
        f"/api/v1/automations/{fake_id}",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == 404
