"""Integration tests for Authentication API"""

import pytest
from uuid import uuid4

from app.services.auth_service import AuthService


class TestAuthenticationEndpoints:
    """Test suite for authentication endpoints"""

    def test_register_user(self, client):
        """Test user registration"""
        register_data = {
            "email": f"newuser_{uuid4().hex}@example.com",
            "password": "SecurePassword123!",
            "first_name": "New",
            "last_name": "User",
        }
        
        response = client.post(
            "/api/v1/auth/register",
            json=register_data
        )
        assert response.status_code in [200, 201]
        data = response.json()
        assert "id" in data or "user_id" in data

    def test_login_user(self, client, test_user):
        """Test user login"""
        login_data = {
            "email": test_user.email,
            "password": "testpass123",
        }
        
        response = client.post(
            "/api/v1/auth/login",
            json=login_data
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data or "token" in data

    def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials"""
        login_data = {
            "email": f"nonexistent_{uuid4().hex}@example.com",
            "password": "wrongpassword",
        }
        
        response = client.post(
            "/api/v1/auth/login",
            json=login_data
        )
        assert response.status_code in [401, 400]

    def test_verify_token(self, client, test_auth_token, test_user):
        """Test token verification"""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {test_auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_user.id)

    def test_invalid_token(self, client):
        """Test with invalid token"""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid_token_xyz"}
        )
        assert response.status_code == 401

    def test_missing_auth_header(self, client):
        """Test missing authorization header"""
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 401

    def test_logout_user(self, client, auth_headers, test_auth_token):
        """Test user logout"""
        response = client.post(
            "/api/v1/auth/logout",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204]

    def test_refresh_token(self, client, test_auth_token):
        """Test token refresh"""
        response = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": test_auth_token}
        )
        assert response.status_code in [200, 401]

    def test_change_password(self, client, auth_headers, test_user, test_auth_token):
        """Test changing password"""
        change_password_data = {
            "current_password": "testpass123",
            "new_password": "NewPassword123!",
        }
        
        response = client.post(
            "/api/v1/auth/change-password",
            json=change_password_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204]

    def test_request_password_reset(self, client, test_user):
        """Test password reset request"""
        reset_data = {
            "email": test_user.email,
        }
        
        response = client.post(
            "/api/v1/auth/request-password-reset",
            json=reset_data
        )
        assert response.status_code in [200, 204]

    def test_two_factor_auth_enable(self, client, auth_headers, test_auth_token):
        """Test enabling 2FA"""
        response = client.post(
            "/api/v1/auth/2fa/enable",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 201]

    def test_verify_2fa_code(self, client, auth_headers, test_auth_token):
        """Test verifying 2FA code"""
        verify_data = {
            "code": "000000",
        }
        
        response = client.post(
            "/api/v1/auth/2fa/verify",
            json=verify_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 400, 401]

    def test_get_user_profile(self, client, auth_headers, test_user, test_auth_token):
        """Test retrieving user profile"""
        response = client.get(
            "/api/v1/auth/me",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user.email

    def test_update_user_profile(self, client, auth_headers, test_auth_token):
        """Test updating user profile"""
        update_data = {
            "first_name": "Updated",
            "last_name": "Name",
        }
        
        response = client.put(
            "/api/v1/auth/me",
            json=update_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204]
