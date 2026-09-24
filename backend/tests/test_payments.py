"""Tests for payment routes"""

import pytest
from fastapi.testclient import TestClient
from uuid import uuid4
from datetime import datetime

from main import app
from app.models.payment import Payment, PaymentStatus, PaymentMethod


client = TestClient(app)


class TestPaymentRoutes:
    """Test payment API endpoints"""
    
    def test_create_payment(self, test_user, test_organization, test_customer, test_token):
        """Test creating a payment"""
        response = client.post(
            "/api/v1/payments/payments",
            headers={"Authorization": f"Bearer {test_token}"},
            json={
                "organization_id": str(test_organization.id),
                "customer_id": str(test_customer.id),
                "amount_cents": 10000,
                "currency": "USD",
                "payment_method": "card",
                "description": "Test payment"
            }
        )
        assert response.status_code in [200, 201]
    
    def test_list_payments(self, test_user, test_organization, test_token):
        """Test listing payments"""
        response = client.get(
            "/api/v1/payments/payments",
            headers={"Authorization": f"Bearer {test_token}"},
            params={"organization_id": str(test_organization.id)}
        )
        assert response.status_code == 200
    
    def test_get_payment(self, test_user, test_organization, test_token):
        """Test getting payment details"""
        response = client.get(
            "/api/v1/payments/payments/test-payment-id",
            headers={"Authorization": f"Bearer {test_token}"}
        )
        # Will fail gracefully with 404 if payment doesn't exist
        assert response.status_code in [200, 404]
    
    def test_payment_analytics(self, test_user, test_organization, test_token):
        """Test payment analytics endpoint"""
        response = client.get(
            "/api/v1/payments/analytics",
            headers={"Authorization": f"Bearer {test_token}"},
            params={"organization_id": str(test_organization.id)}
        )
        assert response.status_code == 200


class TestPaymentMethods:
    """Test different payment methods"""
    
    def test_stripe_payment(self, test_user, test_organization, test_customer, test_token):
        """Test Stripe payment creation"""
        response = client.post(
            "/api/v1/payments/payments",
            headers={"Authorization": f"Bearer {test_token}"},
            json={
                "organization_id": str(test_organization.id),
                "customer_id": str(test_customer.id),
                "amount_cents": 5000,
                "currency": "USD",
                "payment_method": "stripe",
                "description": "Stripe test payment"
            }
        )
        assert response.status_code in [200, 201]
    
    def test_paypal_payment(self, test_user, test_organization, test_customer, test_token):
        """Test PayPal payment creation"""
        response = client.post(
            "/api/v1/payments/payments",
            headers={"Authorization": f"Bearer {test_token}"},
            json={
                "organization_id": str(test_organization.id),
                "customer_id": str(test_customer.id),
                "amount_cents": 5000,
                "currency": "USD",
                "payment_method": "paypal",
                "description": "PayPal test payment"
            }
        )
        assert response.status_code in [200, 201]
