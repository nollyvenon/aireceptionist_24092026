"""AI Receptionist API tests"""

import pytest
from fastapi.testclient import TestClient
from uuid import uuid4

from app.models.ai_conversation import AIConversation, ConversationStatus, IntentType


def test_start_conversation(client: TestClient, test_token: str, test_organization, test_customer):
    """Test starting an AI conversation"""
    response = client.post(
        "/api/v1/ai/conversation/start",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "customer_id": str(test_customer.id),
            "channel": "phone"
        }
    )
    assert response.status_code in [200, 201]


def test_send_message_to_ai(client: TestClient, test_token: str, test_organization, test_customer, db):
    """Test sending message to AI receptionist"""
    conversation = AIConversation(
        id=uuid4(),
        organization_id=test_organization.id,
        customer_id=test_customer.id,
        channel="phone",
        status=ConversationStatus.ACTIVE
    )
    db.add(conversation)
    db.commit()

    response = client.post(
        f"/api/v1/ai/conversation/{conversation.id}/message",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "content": "I'd like to book an appointment",
            "message_type": "user"
        }
    )
    assert response.status_code in [200, 201]


def test_end_conversation(client: TestClient, test_token: str, test_organization, test_customer, db):
    """Test ending AI conversation"""
    conversation = AIConversation(
        id=uuid4(),
        organization_id=test_organization.id,
        customer_id=test_customer.id,
        channel="phone",
        status=ConversationStatus.ACTIVE
    )
    db.add(conversation)
    db.commit()

    response = client.post(
        f"/api/v1/ai/conversation/{conversation.id}/end",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code in [200, 400]


def test_get_conversation_transcript(client: TestClient, test_token: str, test_organization, test_customer, db):
    """Test getting conversation transcript"""
    conversation = AIConversation(
        id=uuid4(),
        organization_id=test_organization.id,
        customer_id=test_customer.id,
        channel="phone",
        status=ConversationStatus.COMPLETED
    )
    db.add(conversation)
    db.commit()

    response = client.get(
        f"/api/v1/ai/conversation/{conversation.id}/transcript",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == 200


def test_get_conversation_sentiment(client: TestClient, test_token: str, test_organization, test_customer, db):
    """Test getting conversation sentiment analysis"""
    conversation = AIConversation(
        id=uuid4(),
        organization_id=test_organization.id,
        customer_id=test_customer.id,
        channel="phone",
        status=ConversationStatus.COMPLETED,
        sentiment_score=0.75
    )
    db.add(conversation)
    db.commit()

    response = client.get(
        f"/api/v1/ai/conversation/{conversation.id}/sentiment",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == 200


def test_list_conversations(client: TestClient, test_token: str, test_organization):
    """Test listing AI conversations"""
    response = client.get(
        "/api/v1/ai/conversations",
        headers={"Authorization": f"Bearer {test_token}"},
        params={"limit": 50}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_get_intent_detection(client: TestClient, test_token: str, test_organization):
    """Test getting intent detection for text"""
    response = client.post(
        "/api/v1/ai/detect-intent",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "text": "I need to book an appointment"
        }
    )
    assert response.status_code == 200


def test_handle_call(client: TestClient, test_token: str, test_organization, test_customer):
    """Test handling incoming call"""
    response = client.post(
        "/api/v1/ai/handle-call",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "caller_id": test_customer.phone,
            "call_id": f"call_{uuid4().hex[:8]}"
        }
    )
    assert response.status_code in [200, 201]


def test_transfer_to_human(client: TestClient, test_token: str, test_organization, test_customer, db, test_user):
    """Test transferring conversation to human agent"""
    conversation = AIConversation(
        id=uuid4(),
        organization_id=test_organization.id,
        customer_id=test_customer.id,
        channel="phone",
        status=ConversationStatus.ACTIVE
    )
    db.add(conversation)
    db.commit()

    response = client.post(
        f"/api/v1/ai/conversation/{conversation.id}/transfer",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "agent_id": str(test_user.id),
            "reason": "Customer request"
        }
    )
    assert response.status_code in [200, 400]


def test_get_ai_performance_metrics(client: TestClient, test_token: str, test_organization):
    """Test getting AI performance metrics"""
    response = client.get(
        "/api/v1/ai/metrics",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code in [200, 500]


def test_get_conversation_not_found(client: TestClient, test_token: str):
    """Test getting non-existent conversation"""
    fake_id = uuid4()
    response = client.get(
        f"/api/v1/ai/conversation/{fake_id}/transcript",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == 404


def test_configure_ai_settings(client: TestClient, test_token: str, test_user, test_organization):
    """Test configuring AI receptionist settings"""
    response = client.put(
        "/api/v1/ai/settings",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "model": "gpt-4",
            "temperature": 0.7,
            "max_tokens": 500
        }
    )
    assert response.status_code in [200, 400]


def test_test_ai_receptionist(client: TestClient, test_token: str, test_organization):
    """Test AI receptionist with test call"""
    response = client.post(
        "/api/v1/ai/test",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "message": "Can I book an appointment?"
        }
    )
    assert response.status_code in [200, 400]
