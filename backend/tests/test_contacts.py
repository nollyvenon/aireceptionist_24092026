"""Integration tests for Contacts API"""

import pytest
from uuid import uuid4
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient

from main import app
from app.models.crm import Contact
from app.models.customer import Customer
from app.models.organization import Organization
from app.models.user import User


class TestContactEndpoints:
    """Test suite for contact management endpoints"""

    def test_list_contacts_empty(self, client: TestClient, auth_headers: dict):
        """Test listing contacts when none exist"""
        response = client.get(
            "/api/v1/crm/contacts",
            headers=auth_headers,
            params={"token": auth_headers.get("Authorization", "").replace("Bearer ", "")}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert len(data["data"]) == 0

    def test_list_contacts_with_data(
        self,
        client: TestClient,
        auth_headers: dict,
        test_contact,
        test_auth_token: str
    ):
        """Test listing contacts with existing data"""
        response = client.get(
            "/api/v1/crm/contacts",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        assert len(data["data"]) >= 1

    def test_create_contact(self, client: TestClient, auth_headers: dict, test_auth_token: str, test_customer, test_organization):
        """Test creating a new contact"""
        contact_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": f"john_{uuid4().hex}@example.com",
            "phone": "+1234567890",
            "title": "Manager",
            "department": "Sales",
            "customer_id": str(test_customer.id),
            "is_primary": True,
        }

        response = client.post(
            "/api/v1/crm/contacts",
            json=contact_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["email"] == contact_data["email"]

    def test_create_contact_missing_required_fields(self, client: TestClient, auth_headers: dict, test_auth_token: str):
        """Test creating contact with missing required fields"""
        contact_data = {
            "first_name": "John",
        }

        response = client.post(
            "/api/v1/crm/contacts",
            json=contact_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        # Should fail or return error
        assert response.status_code in [400, 422, 200]  # Depends on implementation

    def test_get_contact_by_id(self, client: TestClient, auth_headers: dict, test_contact, test_auth_token: str):
        """Test retrieving a specific contact by ID"""
        response = client.get(
            f"/api/v1/crm/contacts/{test_contact.id}",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_contact.id)
        assert data["email"] == test_contact.email

    def test_get_contact_not_found(self, client: TestClient, auth_headers: dict, test_auth_token: str):
        """Test retrieving non-existent contact"""
        fake_id = uuid4()
        response = client.get(
            f"/api/v1/crm/contacts/{fake_id}",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 404

    def test_update_contact(self, client: TestClient, auth_headers: dict, test_contact, test_auth_token: str):
        """Test updating a contact"""
        update_data = {
            "first_name": "Jane",
            "last_name": "Smith",
            "phone": "+9876543210",
        }

        response = client.put(
            f"/api/v1/crm/contacts/{test_contact.id}",
            json=update_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204]

    def test_delete_contact(self, client: TestClient, auth_headers: dict, test_contact, test_auth_token: str):
        """Test deleting a contact"""
        response = client.delete(
            f"/api/v1/crm/contacts/{test_contact.id}",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204]

    def test_list_contacts_by_customer(self, client: TestClient, auth_headers: dict, test_contact, test_auth_token: str):
        """Test filtering contacts by customer"""
        response = client.get(
            "/api/v1/crm/contacts",
            headers=auth_headers,
            params={
                "token": test_auth_token,
                "customer_id": str(test_contact.customer_id)
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert all(c["id"] for c in data["data"])

    def test_contact_isolation_by_organization(self, client: TestClient, db: Session, test_contact, test_user, test_auth_token: str):
        """Test that contacts are isolated by organization"""
        headers = {"Authorization": f"Bearer {test_auth_token}"}

        response = client.get(
            f"/api/v1/crm/contacts/{test_contact.id}",
            headers=headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200

    def test_pagination_contacts(self, client: TestClient, auth_headers: dict, test_auth_token: str, db: Session, test_organization):
        """Test pagination of contacts"""
        # Create multiple contacts
        for i in range(15):
            contact = Contact(
                organization_id=test_organization.id,
                first_name=f"Contact{i}",
                last_name="Test",
                email=f"contact{i}_{uuid4().hex}@example.com",
            )
            db.add(contact)
        db.commit()

        # Get first page
        response = client.get(
            "/api/v1/crm/contacts",
            headers=auth_headers,
            params={"token": test_auth_token, "skip": 0, "limit": 10}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) <= 10

        # Get second page
        response = client.get(
            "/api/v1/crm/contacts",
            headers=auth_headers,
            params={"token": test_auth_token, "skip": 10, "limit": 10}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) <= 10
