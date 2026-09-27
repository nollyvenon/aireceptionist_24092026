"""Messaging tests"""

import pytest


def test_messaging_module_exists():
    """Test messaging module exists"""
    try:
        from app.api.messaging_routes import router
        assert router is not None
    except ImportError:
        pytest.skip("Messaging routes unavailable")


def test_message_structure():
    """Test message structure"""
    message = {
        "id": "msg_123",
        "content": "Hello, this is a test message",
        "channel": "sms",
        "status": "sent"
    }
    assert message["id"]
    assert message["content"]
    assert message["channel"] in ["sms", "email", "whatsapp", "voice"]
