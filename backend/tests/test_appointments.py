"""Integration tests for Appointments API"""

import pytest
from uuid import uuid4
from datetime import datetime, timedelta

from app.models.appointment import Appointment


class TestAppointmentEndpoints:
    """Test suite for appointment management endpoints"""

    def test_list_appointments_empty(self, client, auth_headers, test_auth_token):
        """Test listing appointments when none exist"""
        response = client.get(
            "/api/v1/appointments",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert len(data["data"]) == 0

    def test_list_appointments_with_data(self, client, auth_headers, test_appointment, test_auth_token):
        """Test listing appointments with existing data"""
        response = client.get(
            "/api/v1/appointments",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    def test_create_appointment(self, client, auth_headers, test_auth_token, test_customer):
        """Test creating a new appointment"""
        start_time = datetime.utcnow() + timedelta(hours=2)
        end_time = start_time + timedelta(hours=1)

        appointment_data = {
            "customer_id": str(test_customer.id),
            "title": "Sales Consultation",
            "description": "Initial consultation with prospect",
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "status": "scheduled",
            "location": "Conference Room A",
        }

        response = client.post(
            "/api/v1/appointments",
            json=appointment_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data

    def test_get_appointment_by_id(self, client, auth_headers, test_appointment, test_auth_token):
        """Test retrieving a specific appointment by ID"""
        response = client.get(
            f"/api/v1/appointments/{test_appointment.id}",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_appointment.id)

    def test_get_appointment_not_found(self, client, auth_headers, test_auth_token):
        """Test retrieving non-existent appointment"""
        fake_id = uuid4()
        response = client.get(
            f"/api/v1/appointments/{fake_id}",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 404

    def test_update_appointment_status(self, client, auth_headers, test_appointment, test_auth_token):
        """Test updating appointment status"""
        update_data = {
            "status": "completed",
        }

        response = client.put(
            f"/api/v1/appointments/{test_appointment.id}",
            json=update_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204]

    def test_reschedule_appointment(self, client, auth_headers, test_appointment, test_auth_token):
        """Test rescheduling an appointment"""
        new_start = datetime.utcnow() + timedelta(days=3)
        new_end = new_start + timedelta(hours=1)

        update_data = {
            "start_time": new_start.isoformat(),
            "end_time": new_end.isoformat(),
        }

        response = client.put(
            f"/api/v1/appointments/{test_appointment.id}",
            json=update_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204]

    def test_cancel_appointment(self, client, auth_headers, test_appointment, test_auth_token):
        """Test cancelling an appointment"""
        update_data = {
            "status": "cancelled",
        }

        response = client.put(
            f"/api/v1/appointments/{test_appointment.id}",
            json=update_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204]

    def test_delete_appointment(self, client, auth_headers, test_appointment, test_auth_token):
        """Test deleting an appointment"""
        response = client.delete(
            f"/api/v1/appointments/{test_appointment.id}",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204]

    def test_list_appointments_by_customer(self, client, auth_headers, test_auth_token, test_appointment):
        """Test filtering appointments by customer"""
        response = client.get(
            "/api/v1/appointments",
            headers=auth_headers,
            params={
                "token": test_auth_token,
                "customer_id": str(test_appointment.customer_id)
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    def test_list_appointments_by_date_range(self, client, auth_headers, test_auth_token):
        """Test filtering appointments by date range"""
        start_date = datetime.utcnow()
        end_date = start_date + timedelta(days=7)

        response = client.get(
            "/api/v1/appointments",
            headers=auth_headers,
            params={
                "token": test_auth_token,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 0

    def test_pagination_appointments(self, client, auth_headers, test_auth_token, db, test_organization, test_customer):
        """Test pagination of appointments"""
        base_time = datetime.utcnow()
        for i in range(25):
            appointment = Appointment(
                organization_id=test_organization.id,
                customer_id=test_customer.id,
                title=f"Appointment {i}",
                start_time=base_time + timedelta(days=i),
                end_time=base_time + timedelta(days=i, hours=1),
                duration_minutes=60,
            )
            db.add(appointment)
        db.commit()

        response = client.get(
            "/api/v1/appointments",
            headers=auth_headers,
            params={"token": test_auth_token, "skip": 0, "limit": 10}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) <= 10

    def test_appointment_with_notes(self, client, auth_headers, test_auth_token, test_customer):
        """Test creating appointment with notes"""
        start_time = datetime.utcnow() + timedelta(hours=1)
        end_time = start_time + timedelta(hours=1)

        appointment_data = {
            "customer_id": str(test_customer.id),
            "title": "Product Demo",
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "description": "Prepare demo for CRM features",
            "status": "scheduled",
        }

        response = client.post(
            "/api/v1/appointments",
            json=appointment_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200

    def test_appointment_status_flow(self, client, auth_headers, test_auth_token, test_customer):
        """Test complete appointment status flow"""
        start_time = datetime.utcnow() + timedelta(hours=2)
        end_time = start_time + timedelta(hours=1)

        # Create appointment
        appointment_data = {
            "customer_id": str(test_customer.id),
            "title": "Meeting",
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "status": "scheduled",
        }

        response = client.post(
            "/api/v1/appointments",
            json=appointment_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        appointment_id = response.json().get("id")

        # Confirm appointment
        if appointment_id:
            response = client.put(
                f"/api/v1/appointments/{appointment_id}",
                json={"status": "confirmed"},
                headers=auth_headers,
                params={"token": test_auth_token}
            )
            assert response.status_code in [200, 204]
