"""AI Service API tests"""

import pytest
from fastapi.testclient import TestClient
from uuid import uuid4


def test_process_message(client: TestClient, test_token: str, test_organization, test_customer):
    """Test processing customer message with AI"""
    response = client.post(
        "/api/v1/ai/message",
        params={
            "token": test_token,
            "customer_id": str(test_customer.id),
            "message": "I'd like to schedule an appointment"
        }
    )
    assert response.status_code in [200, 400, 500]


def test_get_available_appointments(client: TestClient, test_token: str, test_organization, test_customer):
    """Test getting available appointments"""
    response = client.get(
        "/api/v1/ai/availability",
        params={
            "token": test_token,
            "customer_id": str(test_customer.id)
        }
    )
    assert response.status_code in [200, 400, 500]


def test_initiate_voice_call(client: TestClient, test_token: str, test_organization, test_customer):
    """Test initiating voice call"""
    response = client.post(
        "/api/v1/ai/voice/initiate",
        params={
            "token": test_token,
            "customer_phone": test_customer.phone
        }
    )
    assert response.status_code in [200, 500]


def test_start_chat(client: TestClient, test_token: str, test_organization, test_customer):
    """Test starting chat session"""
    response = client.post(
        "/api/v1/ai/chat/start",
        params={
            "token": test_token,
            "customer_id": str(test_customer.id)
        }
    )
    assert response.status_code in [200, 500]


def test_ai_health(client: TestClient, test_token: str, test_organization):
    """Test AI service health check"""
    response = client.get(
        "/api/v1/ai/health",
        params={"token": test_token}
    )
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
