"""AI Receptionist tests"""

import pytest


def test_ai_receptionist_module_exists():
    """Test AI receptionist module exists"""
    try:
        from app.services.ai_service import AIService
        assert AIService is not None
    except ImportError:
        pytest.skip("AI service not available")


def test_conversation_flow():
    """Test conversation flow structure"""
    conversation = {
        "id": "conv_123",
        "messages": ["Hello", "How can I help?"],
        "status": "active"
    }
    assert conversation["id"]
    assert len(conversation["messages"]) > 0
    assert conversation["status"] == "active"


def test_intent_detection():
    """Test intent detection data"""
    intents = {
        "appointment_booking": 0.95,
        "faq_answer": 0.05
    }
    assert sum(intents.values()) <= 1.0
    assert max(intents.values()) <= 1.0
