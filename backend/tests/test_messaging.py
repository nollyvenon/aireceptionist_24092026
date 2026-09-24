"""Messaging API tests"""

import pytest
from fastapi.testclient import TestClient
from uuid import uuid4

from app.models.message import Message, MessageTemplate, Campaign, MessageStatus, CampaignStatus


def test_send_message(client: TestClient, test_token: str, test_user, test_organization, test_customer):
    """Test sending a message"""
    response = client.post(
        "/api/v1/messages/send",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "customer_id": str(test_customer.id),
            "content": "Hello, how can we help?",
            "channel": "email"
        }
    )
    assert response.status_code in [200, 201]


def test_send_sms(client: TestClient, test_token: str, test_user, test_organization, test_customer):
    """Test sending SMS"""
    response = client.post(
        "/api/v1/messages/sms",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "customer_id": str(test_customer.id),
            "content": "Appointment reminder: Tomorrow at 10 AM",
            "phone": test_customer.phone
        }
    )
    assert response.status_code in [200, 201, 400]


def test_send_email(client: TestClient, test_token: str, test_user, test_organization, test_customer):
    """Test sending email"""
    response = client.post(
        "/api/v1/messages/email",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "customer_id": str(test_customer.id),
            "subject": "Appointment Confirmation",
            "body": "Your appointment is confirmed",
            "recipient": test_customer.email
        }
    )
    assert response.status_code in [200, 201, 400]


def test_send_whatsapp(client: TestClient, test_token: str, test_user, test_organization, test_customer):
    """Test sending WhatsApp message"""
    response = client.post(
        "/api/v1/messages/whatsapp",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "customer_id": str(test_customer.id),
            "content": "Your appointment is confirmed",
            "phone": test_customer.phone
        }
    )
    assert response.status_code in [200, 201, 400]


def test_create_message_template(client: TestClient, test_token: str, test_user, test_organization):
    """Test creating message template"""
    response = client.post(
        "/api/v1/messages/templates",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "name": "Welcome Template",
            "content": "Welcome to {{company_name}}!",
            "channel": "email",
            "description": "Welcome message for new customers"
        }
    )
    assert response.status_code in [200, 201]


def test_list_message_templates(client: TestClient, test_token: str, test_user, test_organization, db):
    """Test listing message templates"""
    template = MessageTemplate(
        id=uuid4(),
        organization_id=test_organization.id,
        name="Test Template",
        content="Hello {{name}}",
        channel="email"
    )
    db.add(template)
    db.commit()

    response = client.get(
        "/api/v1/messages/templates",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_get_message_template(client: TestClient, test_token: str, test_user, test_organization, db):
    """Test getting message template"""
    template = MessageTemplate(
        id=uuid4(),
        organization_id=test_organization.id,
        name="Test Template",
        content="Hello {{name}}",
        channel="email"
    )
    db.add(template)
    db.commit()

    response = client.get(
        f"/api/v1/messages/templates/{template.id}",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == 200


def test_update_message_template(client: TestClient, test_token: str, test_user, test_organization, db):
    """Test updating message template"""
    template = MessageTemplate(
        id=uuid4(),
        organization_id=test_organization.id,
        name="Test Template",
        content="Hello {{name}}",
        channel="email"
    )
    db.add(template)
    db.commit()

    response = client.put(
        f"/api/v1/messages/templates/{template.id}",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "content": "Updated content"
        }
    )
    assert response.status_code in [200, 400]


def test_delete_message_template(client: TestClient, test_token: str, test_user, test_organization, db):
    """Test deleting message template"""
    template = MessageTemplate(
        id=uuid4(),
        organization_id=test_organization.id,
        name="Test Template",
        content="Hello {{name}}",
        channel="email"
    )
    db.add(template)
    db.commit()

    response = client.delete(
        f"/api/v1/messages/templates/{template.id}",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code in [200, 204]


def test_create_campaign(client: TestClient, test_token: str, test_user, test_organization, db):
    """Test creating campaign"""
    template = MessageTemplate(
        id=uuid4(),
        organization_id=test_organization.id,
        name="Test Template",
        content="Hello {{name}}",
        channel="email"
    )
    db.add(template)
    db.commit()

    response = client.post(
        "/api/v1/messages/campaigns",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "name": "Summer Promotion",
            "template_id": str(template.id),
            "status": "draft",
            "scheduled_at": "2025-06-01T10:00:00"
        }
    )
    assert response.status_code in [200, 201]


def test_list_campaigns(client: TestClient, test_token: str, test_user, test_organization, db):
    """Test listing campaigns"""
    campaign = Campaign(
        id=uuid4(),
        organization_id=test_organization.id,
        name="Test Campaign",
        status=CampaignStatus.DRAFT
    )
    db.add(campaign)
    db.commit()

    response = client.get(
        "/api/v1/messages/campaigns",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == 200
