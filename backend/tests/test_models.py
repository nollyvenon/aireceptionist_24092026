"""Tests for database models"""

import pytest
from uuid import uuid4
from datetime import datetime, timedelta


def test_user_model_structure(mock_user_data):
    """Test user model structure"""
    assert mock_user_data["id"]
    assert mock_user_data["email"]
    assert "@" in mock_user_data["email"]
    assert mock_user_data["first_name"]
    assert mock_user_data["last_name"]
    assert mock_user_data["is_active"] is True


def test_organization_model_structure(mock_organization_data):
    """Test organization model structure"""
    assert mock_organization_data["id"]
    assert mock_organization_data["name"]
    assert mock_organization_data["email"]
    assert mock_organization_data["phone"]
    assert mock_organization_data["is_active"] is True


def test_appointment_model_structure(mock_appointment_data):
    """Test appointment model structure"""
    assert mock_appointment_data["id"]
    assert mock_appointment_data["title"]
    assert mock_appointment_data["status"] == "scheduled"
    assert mock_appointment_data["start_time"]
    assert mock_appointment_data["end_time"]


def test_payment_model_structure(mock_payment_data):
    """Test payment model structure"""
    assert mock_payment_data["id"]
    assert mock_payment_data["amount"] > 0
    assert mock_payment_data["currency"] == "USD"
    assert mock_payment_data["status"] == "completed"
