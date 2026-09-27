"""Integration tests for Leads API"""

import pytest
from uuid import uuid4
from sqlalchemy.orm import Session

from main import app
from app.models.crm import Lead
from app.models.organization import Organization


class TestLeadsEndpoints:
    """Test suite for leads management endpoints"""

    def test_list_leads_empty(self, client, auth_headers, test_auth_token):
        """Test listing leads when none exist"""
        response = client.get(
            "/api/v1/crm/leads",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert len(data["items"]) == 0

    def test_list_leads_with_data(self, client, auth_headers, test_lead, test_auth_token):
        """Test listing leads with existing data"""
        response = client.get(
            "/api/v1/crm/leads",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    def test_create_lead(self, client, auth_headers, test_auth_token, test_organization):
        """Test creating a new lead"""
        lead_data = {
            "first_name": "Alice",
            "last_name": "Johnson",
            "email": f"alice_{uuid4().hex}@example.com",
            "phone": "+1111111111",
            "company": "Tech Corp",
            "title": "CEO",
            "status": "new",
            "lead_score": 85.0,
            "source": "website",
        }

        response = client.post(
            "/api/v1/crm/leads",
            json=lead_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data

    def test_get_lead_by_id(self, client, auth_headers, test_lead, test_auth_token):
        """Test retrieving a specific lead by ID"""
        response = client.get(
            f"/api/v1/crm/leads/{test_lead.id}",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_lead.id)

    def test_get_lead_not_found(self, client, auth_headers, test_auth_token):
        """Test retrieving non-existent lead"""
        fake_id = uuid4()
        response = client.get(
            f"/api/v1/crm/leads/{fake_id}",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 404

    def test_update_lead_status(self, client, auth_headers, test_lead, test_auth_token):
        """Test updating lead status"""
        update_data = {
            "status": "qualified",
            "lead_score": 95.0,
        }

        response = client.put(
            f"/api/v1/crm/leads/{test_lead.id}",
            json=update_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204]

    def test_list_leads_by_status(self, client, auth_headers, test_auth_token, test_lead):
        """Test filtering leads by status"""
        response = client.get(
            "/api/v1/crm/leads",
            headers=auth_headers,
            params={
                "token": test_auth_token,
                "status": test_lead.status.value
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    def test_delete_lead(self, client, auth_headers, test_lead, test_auth_token):
        """Test deleting a lead"""
        response = client.delete(
            f"/api/v1/crm/leads/{test_lead.id}",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204]

    def test_lead_score_calculation(self, client, auth_headers, test_auth_token, test_organization):
        """Test that lead score is properly stored"""
        lead_data = {
            "first_name": "Bob",
            "last_name": "Smith",
            "email": f"bob_{uuid4().hex}@example.com",
            "company": "StartUp Inc",
            "lead_score": 75.5,
        }

        response = client.post(
            "/api/v1/crm/leads",
            json=lead_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200

    def test_assign_lead_to_user(self, client, auth_headers, test_lead, test_user, test_auth_token):
        """Test assigning a lead to a user"""
        update_data = {
            "assigned_to_id": str(test_user.id),
        }

        response = client.put(
            f"/api/v1/crm/leads/{test_lead.id}",
            json=update_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204]

    def test_pagination_leads(self, client, auth_headers, test_auth_token, db, test_organization):
        """Test pagination of leads"""
        for i in range(25):
            lead = Lead(
                organization_id=test_organization.id,
                first_name=f"Lead{i}",
                last_name="Prospect",
                email=f"lead{i}_{uuid4().hex}@example.com",
                lead_score=50.0 + i,
            )
            db.add(lead)
        db.commit()

        response = client.get(
            "/api/v1/crm/leads",
            headers=auth_headers,
            params={"token": test_auth_token, "skip": 0, "limit": 10}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) <= 10
