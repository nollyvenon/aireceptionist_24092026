"""Integration tests for Payments API"""

import pytest
from uuid import uuid4

from app.models.payment import Payment, PaymentStatus


class TestPaymentEndpoints:
    """Test suite for payment management endpoints"""

    def test_list_payments_empty(self, client, auth_headers, test_auth_token):
        """Test listing payments when none exist"""
        response = client.get(
            "/api/v1/payments",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert len(data["items"]) == 0

    def test_list_payments_with_data(self, client, auth_headers, test_payment, test_auth_token):
        """Test listing payments with existing data"""
        response = client.get(
            "/api/v1/payments",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    def test_create_payment(self, client, auth_headers, test_auth_token, test_customer):
        """Test creating a new payment"""
        payment_data = {
            "customer_id": str(test_customer.id),
            "amount": 5000.00,
            "currency": "USD",
            "status": "pending",
            "payment_method": "stripe",
            "description": "Monthly subscription",
        }
        
        response = client.post(
            "/api/v1/payments",
            json=payment_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data

    def test_get_payment_by_id(self, client, auth_headers, test_payment, test_auth_token):
        """Test retrieving a specific payment by ID"""
        response = client.get(
            f"/api/v1/payments/{test_payment.id}",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_payment.id)

    def test_get_payment_not_found(self, client, auth_headers, test_auth_token):
        """Test retrieving non-existent payment"""
        fake_id = uuid4()
        response = client.get(
            f"/api/v1/payments/{fake_id}",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 404

    def test_update_payment_status(self, client, auth_headers, test_payment, test_auth_token):
        """Test updating payment status"""
        update_data = {
            "status": "completed",
        }
        
        response = client.put(
            f"/api/v1/payments/{test_payment.id}",
            json=update_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204]

    def test_refund_payment(self, client, auth_headers, test_payment, test_auth_token):
        """Test refunding a payment"""
        update_data = {
            "status": "refunded",
        }
        
        response = client.put(
            f"/api/v1/payments/{test_payment.id}",
            json=update_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204]

    def test_list_payments_by_status(self, client, auth_headers, test_auth_token, test_payment):
        """Test filtering payments by status"""
        response = client.get(
            "/api/v1/payments",
            headers=auth_headers,
            params={
                "token": test_auth_token,
                "status": test_payment.status.value
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    def test_list_payments_by_customer(self, client, auth_headers, test_auth_token, test_payment):
        """Test filtering payments by customer"""
        response = client.get(
            "/api/v1/payments",
            headers=auth_headers,
            params={
                "token": test_auth_token,
                "customer_id": str(test_payment.customer_id)
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    def test_pagination_payments(self, client, auth_headers, test_auth_token, db, test_organization, test_customer):
        """Test pagination of payments"""
        for i in range(15):
            payment = Payment(
                organization_id=test_organization.id,
                customer_id=test_customer.id,
                amount=1000.0 * (i + 1),
                currency="USD",
                status=PaymentStatus.COMPLETED if i % 2 == 0 else PaymentStatus.PENDING,
                payment_method="stripe",
            )
            db.add(payment)
        db.commit()

        response = client.get(
            "/api/v1/payments",
            headers=auth_headers,
            params={"token": test_auth_token, "skip": 0, "limit": 10}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) <= 10

    def test_payment_with_transaction_id(self, client, auth_headers, test_auth_token, test_customer):
        """Test creating payment with transaction ID"""
        payment_data = {
            "customer_id": str(test_customer.id),
            "amount": 9999.99,
            "currency": "USD",
            "status": "completed",
            "payment_method": "stripe",
            "transaction_id": "txn_1234567890",
        }
        
        response = client.post(
            "/api/v1/payments",
            json=payment_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
