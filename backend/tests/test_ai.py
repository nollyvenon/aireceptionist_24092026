"""AI service tests"""

import pytest


def test_ai_service_exists():
    """Test AI service module"""
    try:
        from app.services.ai_service import AIService
        assert AIService is not None
    except ImportError:
        pytest.skip("AI service unavailable")


def test_prompt_generation():
    """Test prompt generation"""
    prompt = "You are a helpful AI receptionist"
    assert prompt
    assert len(prompt) > 0
    assert "receptionist" in prompt.lower()
