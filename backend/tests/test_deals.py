"""Integration tests for Deals API"""

import pytest
from uuid import uuid4
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.models.crm import Deal
from app.models.organization import Organization


class TestDealsEndpoints:
    """Test suite for deals management endpoints"""

    def test_list_deals_empty(self, client, auth_headers, test_auth_token):
        """Test listing deals when none exist"""
        response = client.get(
            "/api/v1/crm/deals",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert len(data["items"]) == 0

    def test_list_deals_with_data(self, client, auth_headers, test_deal, test_auth_token):
        """Test listing deals with existing data"""
        response = client.get(
            "/api/v1/crm/deals",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    def test_create_deal(self, client, auth_headers, test_auth_token, test_customer):
        """Test creating a new deal"""
        deal_data = {
            "customer_id": str(test_customer.id),
            "name": "Enterprise License Deal",
            "value": 50000.0,
            "status": "prospect",
            "probability": 60.0,
            "expected_close_date": (datetime.utcnow() + timedelta(days=30)).isoformat(),
        }

        response = client.post(
            "/api/v1/crm/deals",
            json=deal_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data

    def test_get_deal_by_id(self, client, auth_headers, test_deal, test_auth_token):
        """Test retrieving a specific deal by ID"""
        response = client.get(
            f"/api/v1/crm/deals/{test_deal.id}",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_deal.id)

    def test_get_deal_not_found(self, client, auth_headers, test_auth_token):
        """Test retrieving non-existent deal"""
        fake_id = uuid4()
        response = client.get(
            f"/api/v1/crm/deals/{fake_id}",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 404

    def test_update_deal_status(self, client, auth_headers, test_deal, test_auth_token):
        """Test updating deal status"""
        update_data = {
            "status": "negotiation",
            "probability": 80.0,
        }

        response = client.put(
            f"/api/v1/crm/deals/{test_deal.id}",
            json=update_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204]

    def test_close_deal(self, client, auth_headers, test_deal, test_auth_token):
        """Test closing a deal"""
        update_data = {
            "status": "closed_won",
            "probability": 100.0,
            "close_date": datetime.utcnow().isoformat(),
        }

        response = client.put(
            f"/api/v1/crm/deals/{test_deal.id}",
            json=update_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204]

    def test_list_deals_by_status(self, client, auth_headers, test_auth_token, test_deal):
        """Test filtering deals by status"""
        response = client.get(
            "/api/v1/crm/deals",
            headers=auth_headers,
            params={
                "token": test_auth_token,
                "status": test_deal.status
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    def test_delete_deal(self, client, auth_headers, test_deal, test_auth_token):
        """Test deleting a deal"""
        response = client.delete(
            f"/api/v1/crm/deals/{test_deal.id}",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204]

    def test_deal_value_tracking(self, client, auth_headers, test_auth_token, test_customer):
        """Test that deal value is properly tracked"""
        deal_value = 75000.0
        deal_data = {
            "customer_id": str(test_customer.id),
            "name": "Large Deal",
            "value": deal_value,
            "status": "prospect",
            "probability": 50.0,
        }

        response = client.post(
            "/api/v1/crm/deals",
            json=deal_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200

    def test_assign_deal_to_user(self, client, auth_headers, test_deal, test_user, test_auth_token):
        """Test assigning a deal to a user"""
        update_data = {
            "assigned_to_id": str(test_user.id),
        }

        response = client.put(
            f"/api/v1/crm/deals/{test_deal.id}",
            json=update_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204]

    def test_pagination_deals(self, client, auth_headers, test_auth_token, db, test_organization, test_customer):
        """Test pagination of deals"""
        for i in range(20):
            deal = Deal(
                organization_id=test_organization.id,
                customer_id=test_customer.id,
                name=f"Deal {i}",
                value=10000.0 * (i + 1),
                status="prospect",
                probability=50.0,
            )
            db.add(deal)
        db.commit()

        response = client.get(
            "/api/v1/crm/deals",
            headers=auth_headers,
            params={"token": test_auth_token, "skip": 0, "limit": 10}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) <= 10

    def test_list_deals_by_customer(self, client, auth_headers, test_auth_token, test_deal):
        """Test filtering deals by customer"""
        response = client.get(
            "/api/v1/crm/deals",
            headers=auth_headers,
            params={
                "token": test_auth_token,
                "customer_id": str(test_deal.customer_id)
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
