"""Customer API tests"""

import pytest
from uuid import uuid4

def test_create_customer(client, test_token: str, test_organization):
    """Test customer creation"""
    response = client.post(
        "/api/v1/customers",
        json={
            "first_name": "Jane",
            "last_name": "Smith",
            "email": "jane@example.com",
            "phone": "+1234567890",
            "company_name": "Tech Corp",
            "job_title": "CTO",
            "source": "referral"
        },
        params={"token": test_token}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["first_name"] == "Jane"
    assert data["email"] == "jane@example.com"

def test_list_customers(client, test_token: str, test_customer):
    """Test listing customers"""
    response = client.get(
        "/api/v1/customers",
        params={"token": test_token, "skip": 0, "limit": 50}
    )
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert data["total"] >= 1

def test_get_customer(client, test_token: str, test_customer):
    """Test getting a specific customer"""
    response = client.get(
        f"/api/v1/customers/{test_customer.id}",
        params={"token": test_token}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(test_customer.id)
    assert data["email"] == test_customer.email

def test_update_customer(client, test_token: str, test_customer):
    """Test updating customer"""
    response = client.put(
        f"/api/v1/customers/{test_customer.id}",
        json={
            "first_name": "Jane",
            "status": "customer"
        },
        params={"token": test_token}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["first_name"] == "Jane"
    assert data["status"] == "customer"

def test_search_customers(client, test_token: str, test_customer):
    """Test searching customers"""
    response = client.get(
        "/api/v1/customers/search",
        params={
            "token": test_token,
            "q": test_customer.first_name,
            "skip": 0,
            "limit": 50
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any(c["id"] == str(test_customer.id) for c in data["items"])

def test_get_lead_score(client, test_token: str, test_customer):
    """Test getting customer lead score"""
    response = client.get(
        f"/api/v1/customers/{test_customer.id}/lead-score",
        params={"token": test_token}
    )
    assert response.status_code == 200
    data = response.json()
    assert "lead_score" in data
    assert 0 <= data["lead_score"] <= 100
