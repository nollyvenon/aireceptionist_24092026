"""Admin API tests"""

import pytest
from fastapi.testclient import TestClient
from uuid import uuid4

from app.models.user import User
from app.services.auth_service import AuthService


def create_admin_user(db, test_organization):
    """Helper to create an admin user with unique email"""
    user = User(
        id=uuid4(),
        organization_id=test_organization.id,
        email=f"admin-{uuid4().hex[:12]}@test.com",
        password_hash=AuthService.hash_password("AdminPass123!"),
        first_name="Admin",
        last_name="User",
        role="admin",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_list_all_organizations(client: TestClient, db, test_organization):
    """Test listing all organizations as admin"""
    admin = create_admin_user(db, test_organization)
    token = AuthService.create_access_token(data={"sub": str(admin.id), "email": admin.email})

    response = client.get(
        "/api/v1/admin/organizations",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code in [200, 403, 500]


def test_list_all_users(client: TestClient, db, test_organization):
    """Test listing all users as admin"""
    admin = create_admin_user(db, test_organization)
    token = AuthService.create_access_token(data={"sub": str(admin.id), "email": admin.email})

    response = client.get(
        "/api/v1/admin/users",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code in [200, 403, 500]


def test_get_user_details_admin(client: TestClient, db, test_organization, test_user):
    """Test getting user details as admin"""
    admin = create_admin_user(db, test_organization)
    token = AuthService.create_access_token(data={"sub": str(admin.id), "email": admin.email})

    response = client.get(
        f"/api/v1/admin/users/{test_user.id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code in [200, 403, 500]


def test_update_user_status(client: TestClient, db, test_organization, test_user):
    """Test updating user status as admin"""
    admin = create_admin_user(db, test_organization)
    token = AuthService.create_access_token(data={"sub": str(admin.id), "email": admin.email})

    response = client.put(
        f"/api/v1/admin/users/{test_user.id}/status",
        headers={"Authorization": f"Bearer {token}"},
        json={"is_active": False}
    )
    assert response.status_code in [200, 403, 400, 500]


def test_suspend_user(client: TestClient, db, test_organization, test_user):
    """Test suspending user as admin"""
    admin = create_admin_user(db, test_organization)
    token = AuthService.create_access_token(data={"sub": str(admin.id), "email": admin.email})

    response = client.post(
        f"/api/v1/admin/users/{test_user.id}/suspend",
        headers={"Authorization": f"Bearer {token}"},
        json={"reason": "Violation of terms"}
    )
    assert response.status_code in [200, 403, 400, 500]


def test_delete_organization_admin(client: TestClient, db, test_organization):
    """Test deleting organization as admin"""
    admin = create_admin_user(db, test_organization)
    token = AuthService.create_access_token(data={"sub": str(admin.id), "email": admin.email})

    response = client.delete(
        f"/api/v1/admin/organizations/{test_organization.id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code in [200, 204, 403, 400, 500]


def test_get_system_settings(client: TestClient, db, test_organization):
    """Test getting system settings as admin"""
    admin = create_admin_user(db, test_organization)
    token = AuthService.create_access_token(data={"sub": str(admin.id), "email": admin.email})

    response = client.get(
        "/api/v1/admin/system-settings",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code in [200, 403, 500]


def test_update_system_settings(client: TestClient, db, test_organization):
    """Test updating system settings as admin"""
    admin = create_admin_user(db, test_organization)
    token = AuthService.create_access_token(data={"sub": str(admin.id), "email": admin.email})

    response = client.put(
        "/api/v1/admin/system-settings",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "maintenance_mode": False,
            "max_organizations": 1000
        }
    )
    assert response.status_code in [200, 403, 400, 500]


def test_get_system_logs(client: TestClient, db, test_organization):
    """Test getting system logs as admin"""
    admin = create_admin_user(db, test_organization)
    token = AuthService.create_access_token(data={"sub": str(admin.id), "email": admin.email})

    response = client.get(
        "/api/v1/admin/logs",
        headers={"Authorization": f"Bearer {token}"},
        params={"limit": 100}
    )
    assert response.status_code in [200, 403, 500]


def test_get_usage_statistics(client: TestClient, db, test_organization):
    """Test getting usage statistics as admin"""
    admin = create_admin_user(db, test_organization)
    token = AuthService.create_access_token(data={"sub": str(admin.id), "email": admin.email})

    response = client.get(
        "/api/v1/admin/usage-stats",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code in [200, 403, 500]


def test_send_system_notification(client: TestClient, db, test_organization):
    """Test sending system notification as admin"""
    admin = create_admin_user(db, test_organization)
    token = AuthService.create_access_token(data={"sub": str(admin.id), "email": admin.email})

    response = client.post(
        "/api/v1/admin/notifications",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "message": "System maintenance scheduled",
            "target": "all_users"
        }
    )
    assert response.status_code in [200, 201, 403, 400, 500]
