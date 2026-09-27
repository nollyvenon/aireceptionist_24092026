"""Test configuration and fixtures"""

import pytest
from uuid import uuid4
from datetime import datetime, timedelta


@pytest.fixture
def mock_user_data():
    """Mock user data for testing"""
    return {
        "id": str(uuid4()),
        "email": f"test_{uuid4().hex}@example.com",
        "phone": "+1234567890",
        "first_name": "Test",
        "last_name": "User",
        "is_active": True,
        "created_at": datetime.utcnow(),
    }


@pytest.fixture
def mock_organization_data():
    """Mock organization data for testing"""
    return {
        "id": str(uuid4()),
        "name": "Test Org",
        "email": f"org_{uuid4().hex}@example.com",
        "phone": "+1987654321",
        "website": "https://example.com",
        "is_active": True,
        "created_at": datetime.utcnow(),
    }


@pytest.fixture
def mock_appointment_data():
    """Mock appointment data for testing"""
    return {
        "id": str(uuid4()),
        "title": "Test Appointment",
        "description": "Test Description",
        "start_time": datetime.utcnow() + timedelta(hours=1),
        "end_time": datetime.utcnow() + timedelta(hours=2),
        "status": "scheduled",
        "created_at": datetime.utcnow(),
    }


@pytest.fixture
def mock_payment_data():
    """Mock payment data for testing"""
    return {
        "id": str(uuid4()),
        "amount": 10000,
        "currency": "USD",
        "status": "completed",
        "method": "stripe",
        "created_at": datetime.utcnow(),
    }


@pytest.fixture
def mock_customer_data():
    """Mock customer data for testing"""
    return {
        "id": str(uuid4()),
        "first_name": "John",
        "last_name": "Doe",
        "email": f"customer_{uuid4().hex}@example.com",
        "phone": "+1234567890",
        "status": "active",
        "created_at": datetime.utcnow(),
    }


@pytest.fixture
def mock_workflow_data():
    """Mock workflow data for testing"""
    return {
        "id": str(uuid4()),
        "name": "Test Workflow",
        "triggers": ["appointment_booked"],
        "actions": ["send_email"],
        "is_active": True,
        "created_at": datetime.utcnow(),
    }
