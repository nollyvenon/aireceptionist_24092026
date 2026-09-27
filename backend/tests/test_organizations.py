"""Integration tests for Organizations API"""

import pytest
from uuid import uuid4


class TestOrganizationEndpoints:
    """Test suite for organization management endpoints"""

    def test_get_organization_details(self, client, auth_headers, test_organization, test_auth_token):
        """Test retrieving organization details"""
        response = client.get(
            f"/api/v1/organizations/{test_organization.id}",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_organization.id)
        assert data["name"] == test_organization.name

    def test_update_organization(self, client, auth_headers, test_organization, test_auth_token):
        """Test updating organization details"""
        update_data = {
            "name": "Updated Org Name",
            "website": "https://updated.example.com",
            "timezone": "America/New_York",
        }
        
        response = client.put(
            f"/api/v1/organizations/{test_organization.id}",
            json=update_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204]

    def test_get_organization_members(self, client, auth_headers, test_organization, test_auth_token):
        """Test retrieving organization members"""
        response = client.get(
            f"/api/v1/organizations/{test_organization.id}/members",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "members" in data or "data" in data

    def test_get_organization_settings(self, client, auth_headers, test_organization, test_auth_token):
        """Test retrieving organization settings"""
        response = client.get(
            f"/api/v1/organizations/{test_organization.id}/settings",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 404]

    def test_update_organization_settings(self, client, auth_headers, test_organization, test_auth_token):
        """Test updating organization settings"""
        settings_data = {
            "timezone": "UTC",
            "business_hours_start": "09:00",
            "business_hours_end": "17:00",
        }
        
        response = client.put(
            f"/api/v1/organizations/{test_organization.id}/settings",
            json=settings_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204]

    def test_invite_member(self, client, auth_headers, test_organization, test_auth_token):
        """Test inviting a new member"""
        invite_data = {
            "email": f"invite_{uuid4().hex}@example.com",
            "role": "staff",
        }
        
        response = client.post(
            f"/api/v1/organizations/{test_organization.id}/invite",
            json=invite_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 201]

    def test_remove_member(self, client, auth_headers, test_organization, test_user, test_auth_token):
        """Test removing a member"""
        response = client.delete(
            f"/api/v1/organizations/{test_organization.id}/members/{test_user.id}",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204, 403]

    def test_organization_not_found(self, client, auth_headers, test_auth_token):
        """Test retrieving non-existent organization"""
        fake_id = uuid4()
        response = client.get(
            f"/api/v1/organizations/{fake_id}",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 404
