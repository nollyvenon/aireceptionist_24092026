"""Activity API tests"""

import pytest
from fastapi.testclient import TestClient
from uuid import uuid4

from app.models.activity import Activity, ActivityType


def test_get_organization_activity(client: TestClient, test_token: str, test_user, test_organization):
    """Test getting organization activity"""
    response = client.get(
        "/api/v1/activities",
        headers={"Authorization": f"Bearer {test_token}"},
        params={"limit": 50}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_get_appointment_activity(client: TestClient, test_token: str, test_user, test_organization, test_appointment, db):
    """Test getting appointment-specific activity"""
    response = client.get(
        f"/api/v1/activities/appointment/{test_appointment.id}",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == 200


def test_get_customer_activity(client: TestClient, test_token: str, test_user, test_organization, test_customer):
    """Test getting customer-specific activity"""
    response = client.get(
        f"/api/v1/activities/customer/{test_customer.id}",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == 200


def test_filter_activity_by_type(client: TestClient, test_token: str, test_user, test_organization):
    """Test filtering activity by type"""
    response = client.get(
        "/api/v1/activities",
        headers={"Authorization": f"Bearer {test_token}"},
        params={"type": "appointment_created"}
    )
    assert response.status_code == 200
