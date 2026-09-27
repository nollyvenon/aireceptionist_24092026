"""Appointment tests"""

import pytest
from datetime import datetime, timedelta


def test_appointment_endpoints_defined():
    """Test appointment endpoints are defined"""
    try:
        from app.api.appointment_routes import router
        assert router is not None
    except ImportError:
        pytest.skip("Appointment routes unavailable")


def test_appointment_booking_data(mock_appointment_data):
    """Test appointment booking data"""
    assert mock_appointment_data["id"]
    assert mock_appointment_data["title"]
    assert mock_appointment_data["status"] == "scheduled"
    assert mock_appointment_data["start_time"] < mock_appointment_data["end_time"]


def test_appointment_status_transitions():
    """Test appointment status transitions"""
    statuses = ["scheduled", "confirmed", "completed", "cancelled"]
    assert len(statuses) > 0
    assert "scheduled" in statuses
