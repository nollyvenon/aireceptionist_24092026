"""Organization API tests"""

import pytest
from fastapi.testclient import TestClient
from uuid import uuid4

from app.services.organization_service import OrganizationService
from app.models.organization import Organization


def test_create_organization(client: TestClient, db):
    """Test organization creation"""
    response = client.post(
        "/api/v1/organizations",
        json={
            "name": "New Organization",
            "slug": f"new-org-{uuid4().hex[:8]}",
            "email": "neworg@example.com",
            "phone": "+1234567890",
            "website": "https://example.com",
            "timezone": "UTC",
            "plan": "professional",
            "ai_enabled": True,
            "voice_enabled": True,
            "whatsapp_enabled": False,
            "automation_enabled": True
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "New Organization"
    assert data["email"] == "neworg@example.com"
    assert data["plan"] == "professional"


def test_get_organization(client: TestClient, test_token: str, test_user, test_organization: Organization):
    """Test getting organization details"""
    response = client.get(
        f"/api/v1/organizations/{test_organization.id}",
        params={"token": test_token}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(test_organization.id)
    assert data["name"] == test_organization.name


def test_get_organization_not_found(client: TestClient, test_token: str, test_user):
    """Test getting non-existent organization"""
    fake_id = uuid4()
    response = client.get(
        f"/api/v1/organizations/{fake_id}",
        params={"token": test_token}
    )
    assert response.status_code == 404


def test_get_organization_forbidden(client: TestClient, db):
    """Test accessing other organization"""
    # Create two organizations and users
    org1 = Organization(
        id=uuid4(),
        name="Org 1",
        slug=f"org1-{uuid4().hex[:8]}",
        email="org1@example.com",
        phone="+1111111111",
        website="https://org1.com",
        timezone="UTC",
        plan="professional",
        ai_enabled=True,
        voice_enabled=True
    )
    org2 = Organization(
        id=uuid4(),
        name="Org 2",
        slug=f"org2-{uuid4().hex[:8]}",
        email="org2@example.com",
        phone="+2222222222",
        website="https://org2.com",
        timezone="UTC",
        plan="professional",
        ai_enabled=True,
        voice_enabled=True
    )
    db.add(org1)
    db.add(org2)
    db.commit()

    from app.services.auth_service import AuthService
    from app.models.user import User

    user1 = User(
        id=uuid4(),
        organization_id=org1.id,
        email="user1@test.com",
        password_hash=AuthService.hash_password("Password123!"),
        first_name="User",
        last_name="One",
        role="admin",
        is_active=True
    )
    db.add(user1)
    db.commit()

    token = AuthService.create_access_token(
        data={"sub": str(user1.id), "email": user1.email}
    )

    # Try to access org2 with user from org1
    response = client.get(
        f"/api/v1/organizations/{org2.id}",
        params={"token": token}
    )
    assert response.status_code == 403


def test_update_organization(client: TestClient, test_token: str, test_user, test_organization: Organization):
    """Test updating organization"""
    response = client.put(
        f"/api/v1/organizations/{test_organization.id}",
        params={"token": test_token},
        json={
            "name": "Updated Organization",
            "website": "https://updated.com",
            "timezone": "America/New_York"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Organization"
    assert data["website"] == "https://updated.com"


def test_get_organization_settings(client: TestClient, test_token: str, test_user, test_organization: Organization):
    """Test getting organization settings"""
    response = client.get(
        f"/api/v1/organizations/{test_organization.id}/settings",
        params={"token": test_token}
    )
    assert response.status_code == 200
    data = response.json()
    assert "ai_model" in data
    assert "timezone" in data
    assert data["timezone"] == test_organization.timezone
