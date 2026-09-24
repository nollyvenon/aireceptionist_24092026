"""Appointment API tests"""

from datetime import datetime, timedelta
from uuid import uuid4

def test_create_appointment(client, test_token: str, test_customer, test_user):
    """Test appointment creation"""
    start_time = datetime.utcnow() + timedelta(days=1)
    end_time = start_time + timedelta(hours=1)

    response = client.post(
        "/api/v1/appointments",
        json={
            "customer_id": str(test_customer.id),
            "title": "Consultation",
            "description": "Annual review",
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "duration_minutes": 60,
            "appointment_type": "consultation",
            "location": "Conference Room A"
        },
        params={"token": test_token}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Consultation"

def test_list_appointments(client, test_token: str, test_appointment):
    """Test listing appointments"""
    response = client.get(
        "/api/v1/appointments",
        params={"token": test_token, "skip": 0, "limit": 50}
    )
    assert response.status_code == 200
    data = response.json()
    assert "items" in data

def test_get_appointment(client, test_token: str, test_appointment):
    """Test getting a specific appointment"""
    response = client.get(
        f"/api/v1/appointments/{test_appointment.id}",
        params={"token": test_token}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(test_appointment.id)

def test_update_appointment(client, test_token: str, test_appointment):
    """Test updating appointment"""
    response = client.put(
        f"/api/v1/appointments/{test_appointment.id}",
        json={"title": "Rescheduled Consultation"},
        params={"token": test_token}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Rescheduled Consultation"

def test_confirm_appointment(client, test_token: str, test_appointment):
    """Test confirming appointment"""
    response = client.post(
        f"/api/v1/appointments/{test_appointment.id}/confirm",
        params={"token": test_token}
    )
    assert response.status_code == 200
    assert response.json()["appointment"]["is_confirmed"]

def test_cancel_appointment(client, test_token: str, test_appointment):
    """Test cancelling appointment"""
    response = client.post(
        f"/api/v1/appointments/{test_appointment.id}/cancel",
        params={"token": test_token, "cancellation_reason": "Rescheduled"}
    )
    assert response.status_code == 200
    assert response.json()["appointment"]["status"] == "cancelled"

def test_get_available_slots(client, test_token: str, test_user):
    """Test getting available appointment slots"""
    tomorrow = datetime.utcnow() + timedelta(days=1)
    date_str = tomorrow.date().isoformat()

    response = client.get(
        f"/api/v1/appointments/availability/{test_user.id}",
        params={
            "token": test_token,
            "date": date_str,
            "duration_minutes": 60
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "available_slots" in data
