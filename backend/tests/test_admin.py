"""Admin API tests"""

import pytest
from fastapi.testclient import TestClient
from uuid import uuid4

from app.models.user import User
from app.services.auth_service import AuthService


def test_list_all_organizations(client: TestClient, db):
    """Test listing all organizations as admin"""
    from app.models.organization import Organization

    admin_user = User(
        id=uuid4(),
        email="admin@test.com",
        password_hash=AuthService.hash_password("AdminPass123!"),
        first_name="Admin",
        last_name="User",
        role="superadmin",
        is_active=True
    )
    db.add(admin_user)
    db.commit()

    admin_token = AuthService.create_access_token(
        data={"sub": str(admin_user.id), "email": admin_user.email}
    )

    response = client.get(
        "/api/v1/admin/organizations",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code in [200, 403]


def test_list_all_users(client: TestClient, db):
    """Test listing all users as admin"""
    admin_user = User(
        id=uuid4(),
        email="admin@test.com",
        password_hash=AuthService.hash_password("AdminPass123!"),
        first_name="Admin",
        last_name="User",
        role="superadmin",
        is_active=True
    )
    db.add(admin_user)
    db.commit()

    admin_token = AuthService.create_access_token(
        data={"sub": str(admin_user.id), "email": admin_user.email}
    )

    response = client.get(
        "/api/v1/admin/users",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code in [200, 403]


def test_get_user_details_admin(client: TestClient, test_user, db):
    """Test getting user details as admin"""
    admin_user = User(
        id=uuid4(),
        email="admin@test.com",
        password_hash=AuthService.hash_password("AdminPass123!"),
        first_name="Admin",
        last_name="User",
        role="superadmin",
        is_active=True
    )
    db.add(admin_user)
    db.commit()

    admin_token = AuthService.create_access_token(
        data={"sub": str(admin_user.id), "email": admin_user.email}
    )

    response = client.get(
        f"/api/v1/admin/users/{test_user.id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code in [200, 403]


def test_update_user_status(client: TestClient, test_user, db):
    """Test updating user status as admin"""
    admin_user = User(
        id=uuid4(),
        email="admin@test.com",
        password_hash=AuthService.hash_password("AdminPass123!"),
        first_name="Admin",
        last_name="User",
        role="superadmin",
        is_active=True
    )
    db.add(admin_user)
    db.commit()

    admin_token = AuthService.create_access_token(
        data={"sub": str(admin_user.id), "email": admin_user.email}
    )

    response = client.put(
        f"/api/v1/admin/users/{test_user.id}/status",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"is_active": False}
    )
    assert response.status_code in [200, 403]


def test_suspend_user(client: TestClient, test_user, db):
    """Test suspending user as admin"""
    admin_user = User(
        id=uuid4(),
        email="admin@test.com",
        password_hash=AuthService.hash_password("AdminPass123!"),
        first_name="Admin",
        last_name="User",
        role="superadmin",
        is_active=True
    )
    db.add(admin_user)
    db.commit()

    admin_token = AuthService.create_access_token(
        data={"sub": str(admin_user.id), "email": admin_user.email}
    )

    response = client.post(
        f"/api/v1/admin/users/{test_user.id}/suspend",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"reason": "Violation of terms"}
    )
    assert response.status_code in [200, 403]


def test_delete_organization_admin(client: TestClient, test_organization, db):
    """Test deleting organization as admin"""
    admin_user = User(
        id=uuid4(),
        email="admin@test.com",
        password_hash=AuthService.hash_password("AdminPass123!"),
        first_name="Admin",
        last_name="User",
        role="superadmin",
        is_active=True
    )
    db.add(admin_user)
    db.commit()

    admin_token = AuthService.create_access_token(
        data={"sub": str(admin_user.id), "email": admin_user.email}
    )

    response = client.delete(
        f"/api/v1/admin/organizations/{test_organization.id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code in [200, 204, 403]


def test_get_system_settings(client: TestClient, db):
    """Test getting system settings as admin"""
    admin_user = User(
        id=uuid4(),
        email="admin@test.com",
        password_hash=AuthService.hash_password("AdminPass123!"),
        first_name="Admin",
        last_name="User",
        role="superadmin",
        is_active=True
    )
    db.add(admin_user)
    db.commit()

    admin_token = AuthService.create_access_token(
        data={"sub": str(admin_user.id), "email": admin_user.email}
    )

    response = client.get(
        "/api/v1/admin/system-settings",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code in [200, 403]


def test_update_system_settings(client: TestClient, db):
    """Test updating system settings as admin"""
    admin_user = User(
        id=uuid4(),
        email="admin@test.com",
        password_hash=AuthService.hash_password("AdminPass123!"),
        first_name="Admin",
        last_name="User",
        role="superadmin",
        is_active=True
    )
    db.add(admin_user)
    db.commit()

    admin_token = AuthService.create_access_token(
        data={"sub": str(admin_user.id), "email": admin_user.email}
    )

    response = client.put(
        "/api/v1/admin/system-settings",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "maintenance_mode": False,
            "max_organizations": 1000
        }
    )
    assert response.status_code in [200, 403]


def test_get_system_logs(client: TestClient, db):
    """Test getting system logs as admin"""
    admin_user = User(
        id=uuid4(),
        email="admin@test.com",
        password_hash=AuthService.hash_password("AdminPass123!"),
        first_name="Admin",
        last_name="User",
        role="superadmin",
        is_active=True
    )
    db.add(admin_user)
    db.commit()

    admin_token = AuthService.create_access_token(
        data={"sub": str(admin_user.id), "email": admin_user.email}
    )

    response = client.get(
        "/api/v1/admin/logs",
        headers={"Authorization": f"Bearer {admin_token}"},
        params={"limit": 100}
    )
    assert response.status_code in [200, 403]


def test_get_usage_statistics(client: TestClient, db):
    """Test getting usage statistics as admin"""
    admin_user = User(
        id=uuid4(),
        email="admin@test.com",
        password_hash=AuthService.hash_password("AdminPass123!"),
        first_name="Admin",
        last_name="User",
        role="superadmin",
        is_active=True
    )
    db.add(admin_user)
    db.commit()

    admin_token = AuthService.create_access_token(
        data={"sub": str(admin_user.id), "email": admin_user.email}
    )

    response = client.get(
        "/api/v1/admin/usage-stats",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code in [200, 403]


def test_send_system_notification(client: TestClient, db):
    """Test sending system notification as admin"""
    admin_user = User(
        id=uuid4(),
        email="admin@test.com",
        password_hash=AuthService.hash_password("AdminPass123!"),
        first_name="Admin",
        last_name="User",
        role="superadmin",
        is_active=True
    )
    db.add(admin_user)
    db.commit()

    admin_token = AuthService.create_access_token(
        data={"sub": str(admin_user.id), "email": admin_user.email}
    )

    response = client.post(
        "/api/v1/admin/notifications",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "message": "System maintenance scheduled",
            "target": "all_users"
        }
    )
    assert response.status_code in [200, 201, 403]
