"""Tests for AI receptionist routes"""

import pytest
from fastapi.testclient import TestClient
from uuid import uuid4

from main import app

client = TestClient(app)


class TestAIReceptionistRoutes:
    """Test AI receptionist API endpoints"""
    
    def test_chat_with_ai(self, test_user, test_organization, test_token):
        """Test chat with AI receptionist"""
        response = client.post(
            "/api/v1/ai/chat",
            headers={"Authorization": f"Bearer {test_token}"},
            json={
                "organization_id": str(test_organization.id),
                "message": "I want to book an appointment",
                "user_id": str(test_user.id)
            }
        )
        assert response.status_code in [200, 201]
    
    def test_initiate_voice_call(self, test_user, test_organization, test_customer, test_token):
        """Test initiating voice call"""
        response = client.post(
            "/api/v1/ai/voice/initiate",
            headers={"Authorization": f"Bearer {test_token}"},
            json={
                "organization_id": str(test_organization.id),
                "customer_id": str(test_customer.id),
                "phone": "+1234567890"
            }
        )
        assert response.status_code in [200, 201]
    
    def test_process_booking_intent(self, test_user, test_organization, test_customer, test_token):
        """Test processing booking intent"""
        response = client.post(
            "/api/v1/ai/bookings/process",
            headers={"Authorization": f"Bearer {test_token}"},
            json={
                "organization_id": str(test_organization.id),
                "customer_id": str(test_customer.id),
                "intent": "book_appointment",
                "date": "2026-10-01",
                "time": "14:00"
            }
        )
        assert response.status_code in [200, 201]
    
    def test_process_reschedule(self, test_user, test_organization, test_appointment, test_token):
        """Test processing reschedule request"""
        response = client.post(
            "/api/v1/ai/reschedule/process",
            headers={"Authorization": f"Bearer {test_token}"},
            json={
                "organization_id": str(test_organization.id),
                "appointment_id": str(test_appointment.id),
                "new_date": "2026-10-05",
                "new_time": "15:00"
            }
        )
        assert response.status_code in [200, 201]
    
    def test_analyze_sentiment(self, test_user, test_organization, test_token):
        """Test sentiment analysis"""
        response = client.post(
            "/api/v1/ai/sentiment/analyze",
            headers={"Authorization": f"Bearer {test_token}"},
            json={
                "organization_id": str(test_organization.id),
                "text": "I'm very happy with your service!"
            }
        )
        assert response.status_code == 200


class TestAICapabilities:
    """Test AI capabilities"""
    
    def test_multilingual_chat(self, test_user, test_organization, test_token):
        """Test multi-language support"""
        response = client.post(
            "/api/v1/ai/chat/multilingual",
            headers={"Authorization": f"Bearer {test_token}"},
            json={
                "organization_id": str(test_organization.id),
                "message": "Hola, quiero reservar una cita",
                "language": "es",
                "user_id": str(test_user.id)
            }
        )
        assert response.status_code in [200, 201]
    
    def test_ai_health_check(self, test_token):
        """Test AI service health check"""
        response = client.get(
            "/api/v1/ai/health",
            headers={"Authorization": f"Bearer {test_token}"}
        )
        assert response.status_code == 200
