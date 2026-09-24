"""Authentication tests"""

import pytest
from fastapi.testclient import TestClient
from uuid import uuid4

from app.services.auth_service import AuthService
from app.models.user import User

def test_register_user(client: TestClient, db, test_organization):
    """Test user registration"""
    response = client.post(
        "/api/v1/auth/register",
        params={
            "email": "newuser@test.com",
            "password": "SecurePass123!",
            "first_name": "New",
            "last_name": "User",
            "organization_id": str(test_organization.id)
        }
    )
    assert response.status_code == 200
    assert response.json()["email"] == "newuser@test.com"

def test_login(client: TestClient, test_user: User):
    """Test user login"""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": test_user.email,
            "password": "Password123!"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_credentials(client: TestClient, test_user: User):
    """Test login with invalid credentials"""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": test_user.email,
            "password": "WrongPassword123!"
        }
    )
    assert response.status_code == 401

def test_refresh_token(client: TestClient, test_user: User):
    """Test token refresh"""
    # First login
    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": test_user.email,
            "password": "Password123!"
        }
    )
    refresh_token = login_response.json()["refresh_token"]

    # Refresh token
    response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_get_current_user(client: TestClient, test_token: str, test_user: User):
    """Test getting current user"""
    response = client.get(
        "/api/v1/auth/me",
        params={"token": test_token}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user.email

def test_password_hashing():
    """Test password hashing"""
    password = "SecurePassword123!"
    hashed = AuthService.hash_password(password)

    assert hashed != password
    assert AuthService.verify_password(password, hashed)
    assert not AuthService.verify_password("WrongPassword", hashed)
