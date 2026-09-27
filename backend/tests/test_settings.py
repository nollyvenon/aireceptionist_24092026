"""Settings API tests"""

import pytest
from fastapi.testclient import TestClient


def test_get_organization_settings(client: TestClient, test_token: str, test_user, test_organization):
    """Test getting organization settings"""
    response = client.get(
        "/api/v1/settings/organization",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == 200


def test_update_organization_settings(client: TestClient, test_token: str, test_user, test_organization):
    """Test updating organization settings"""
    response = client.put(
        "/api/v1/settings/organization",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "timezone": "America/Los_Angeles",
            "business_hours": {"start": "09:00", "end": "17:00"}
        }
    )
    assert response.status_code in [200, 400]
