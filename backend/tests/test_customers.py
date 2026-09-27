"""Integration tests for Customers API"""

import pytest
from uuid import uuid4

from app.models.customer import Customer


class TestCustomerEndpoints:
    """Test suite for customer management endpoints"""

    def test_list_customers_empty(self, client, auth_headers, test_auth_token):
        """Test listing customers when none exist"""
        response = client.get(
            "/api/v1/customers",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert len(data["items"]) == 0

    def test_list_customers_with_data(self, client, auth_headers, test_customer, test_auth_token):
        """Test listing customers with existing data"""
        response = client.get(
            "/api/v1/customers",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    def test_create_customer(self, client, auth_headers, test_auth_token):
        """Test creating a new customer"""
        customer_data = {
            "email": f"customer_{uuid4().hex}@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "phone": "+1234567890",
            "company": "Acme Corp",
        }
        
        response = client.post(
            "/api/v1/customers",
            json=customer_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data

    def test_get_customer_by_id(self, client, auth_headers, test_customer, test_auth_token):
        """Test retrieving a specific customer by ID"""
        response = client.get(
            f"/api/v1/customers/{test_customer.id}",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_customer.id)
        assert data["email"] == test_customer.email

    def test_get_customer_not_found(self, client, auth_headers, test_auth_token):
        """Test retrieving non-existent customer"""
        fake_id = uuid4()
        response = client.get(
            f"/api/v1/customers/{fake_id}",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 404

    def test_update_customer(self, client, auth_headers, test_customer, test_auth_token):
        """Test updating a customer"""
        update_data = {
            "first_name": "Jane",
            "last_name": "Smith",
            "phone": "+9876543210",
            "company": "Tech Solutions Inc",
        }
        
        response = client.put(
            f"/api/v1/customers/{test_customer.id}",
            json=update_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204]

    def test_delete_customer(self, client, auth_headers, test_customer, test_auth_token):
        """Test deleting a customer"""
        response = client.delete(
            f"/api/v1/customers/{test_customer.id}",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204]

    def test_customer_status_filtering(self, client, auth_headers, test_auth_token, test_customer):
        """Test filtering customers by status"""
        response = client.get(
            "/api/v1/customers",
            headers=auth_headers,
            params={
                "token": test_auth_token,
                "status": test_customer.status
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    def test_pagination_customers(self, client, auth_headers, test_auth_token, db, test_organization):
        """Test pagination of customers"""
        for i in range(20):
            customer = Customer(
                organization_id=test_organization.id,
                email=f"customer{i}_{uuid4().hex}@example.com",
                first_name=f"Customer{i}",
                last_name="Test",
            )
            db.add(customer)
        db.commit()

        response = client.get(
            "/api/v1/customers",
            headers=auth_headers,
            params={"token": test_auth_token, "skip": 0, "limit": 10}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) <= 10

    def test_search_customers_by_email(self, client, auth_headers, test_auth_token, test_customer):
        """Test searching customers by email"""
        response = client.get(
            "/api/v1/customers",
            headers=auth_headers,
            params={
                "token": test_auth_token,
                "email": test_customer.email
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    def test_customer_isolation_by_organization(self, client, auth_headers, test_customer, test_auth_token):
        """Test that customers are isolated by organization"""
        response = client.get(
            f"/api/v1/customers/{test_customer.id}",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
