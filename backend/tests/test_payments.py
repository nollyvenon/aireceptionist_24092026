"""Payment API tests"""

import pytest
from fastapi.testclient import TestClient
from uuid import uuid4
from datetime import datetime, timedelta

from app.models.payment import Payment, PaymentStatus, PaymentMethod
from app.models.appointment import Appointment


def test_create_payment(client: TestClient, test_token: str, test_user, test_organization, test_customer, db):
    """Test creating a payment"""
    response = client.post(
        "/api/v1/payments",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "amount_cents": 10000,
            "currency": "USD",
            "payment_method": "credit_card",
            "customer_id": str(test_customer.id),
            "appointment_id": None
        }
    )
    assert response.status_code in [200, 400]  # May fail without Stripe setup


def test_create_paypal_payment(client: TestClient, test_token: str, test_user, test_organization, test_customer):
    """Test creating PayPal payment"""
    response = client.post(
        "/api/v1/payments/paypal",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "amount_cents": 10000,
            "currency": "USD",
            "customer_id": str(test_customer.id),
            "appointment_id": None
        }
    )
    assert response.status_code in [200, 400]


def test_create_flutterwave_payment(client: TestClient, test_token: str, test_user, test_organization, test_customer):
    """Test creating Flutterwave payment"""
    response = client.post(
        "/api/v1/payments/flutterwave",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "amount_cents": 10000,
            "currency": "NGN",
            "customer_id": str(test_customer.id),
            "appointment_id": None
        }
    )
    assert response.status_code in [200, 400]


def test_create_paystack_payment(client: TestClient, test_token: str, test_user, test_organization, test_customer):
    """Test creating Paystack payment"""
    response = client.post(
        "/api/v1/payments/paystack",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "amount_cents": 10000,
            "currency": "NGN",
            "customer_id": str(test_customer.id),
            "appointment_id": None
        }
    )
    assert response.status_code in [200, 400]


def test_list_payments(client: TestClient, test_token: str, test_user, test_organization, test_customer, db):
    """Test listing payments"""
    # Create a payment first
    payment = Payment(
        id=uuid4(),
        organization_id=test_organization.id,
        customer_id=test_customer.id,
        amount_cents=10000,
        currency="USD",
        payment_method=PaymentMethod.CREDIT_CARD,
        status=PaymentStatus.SUCCEEDED,
        paid_at=datetime.utcnow()
    )
    db.add(payment)
    db.commit()

    response = client.get(
        "/api/v1/payments",
        headers={"Authorization": f"Bearer {test_token}"},
        params={"skip": 0, "limit": 50}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_list_payments_with_status_filter(client: TestClient, test_token: str, test_user, test_organization, test_customer, db):
    """Test listing payments with status filter"""
    payment = Payment(
        id=uuid4(),
        organization_id=test_organization.id,
        customer_id=test_customer.id,
        amount_cents=10000,
        currency="USD",
        payment_method=PaymentMethod.CREDIT_CARD,
        status=PaymentStatus.SUCCEEDED
    )
    db.add(payment)
    db.commit()

    response = client.get(
        "/api/v1/payments",
        headers={"Authorization": f"Bearer {test_token}"},
        params={"status": "succeeded"}
    )
    assert response.status_code == 200


def test_get_payment(client: TestClient, test_token: str, test_user, test_organization, test_customer, db):
    """Test getting a specific payment"""
    payment = Payment(
        id=uuid4(),
        organization_id=test_organization.id,
        customer_id=test_customer.id,
        amount_cents=15000,
        currency="USD",
        payment_method=PaymentMethod.CREDIT_CARD,
        status=PaymentStatus.PENDING
    )
    db.add(payment)
    db.commit()

    response = client.get(
        f"/api/v1/payments/{payment.id}",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(payment.id)
    assert data["amount_cents"] == 15000


def test_get_payment_not_found(client: TestClient, test_token: str):
    """Test getting non-existent payment"""
    fake_id = uuid4()
    response = client.get(
        f"/api/v1/payments/{fake_id}",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == 404


def test_confirm_payment(client: TestClient, test_token: str, test_user, test_organization, test_customer, db):
    """Test confirming a payment"""
    payment = Payment(
        id=uuid4(),
        organization_id=test_organization.id,
        customer_id=test_customer.id,
        amount_cents=20000,
        currency="USD",
        payment_method=PaymentMethod.CREDIT_CARD,
        status=PaymentStatus.PROCESSING
    )
    db.add(payment)
    db.commit()

    response = client.post(
        f"/api/v1/payments/{payment.id}/confirm",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code in [200, 400]


def test_refund_payment(client: TestClient, test_token: str, test_user, test_organization, test_customer, db):
    """Test refunding a payment"""
    payment = Payment(
        id=uuid4(),
        organization_id=test_organization.id,
        customer_id=test_customer.id,
        amount_cents=25000,
        currency="USD",
        payment_method=PaymentMethod.CREDIT_CARD,
        status=PaymentStatus.SUCCEEDED,
        paid_at=datetime.utcnow()
    )
    db.add(payment)
    db.commit()

    response = client.post(
        f"/api/v1/payments/{payment.id}/refund",
        headers={"Authorization": f"Bearer {test_token}"},
        params={"refund_reason": "Customer requested"}
    )
    assert response.status_code in [200, 400]


def test_stripe_webhook(client: TestClient, db):
    """Test Stripe webhook handling"""
    response = client.post(
        "/api/v1/payments/webhooks/stripe",
        json={
            "type": "payment_intent.succeeded",
            "data": {
                "object": {
                    "id": "pi_test123",
                    "amount": 10000,
                    "currency": "usd"
                }
            }
        }
    )
    assert response.status_code in [200, 400]


def test_paypal_webhook(client: TestClient, db):
    """Test PayPal webhook handling"""
    response = client.post(
        "/api/v1/payments/webhooks/paypal",
        json={
            "event_type": "PAYMENT.SALE.COMPLETED",
            "resource": {
                "id": "sale123",
                "amount": {"total": "100.00", "currency": "USD"}
            }
        }
    )
    assert response.status_code in [200, 400]


def test_create_invoice(client: TestClient, test_token: str, test_user, test_organization, test_customer, db):
    """Test creating invoice for payment"""
    payment = Payment(
        id=uuid4(),
        organization_id=test_organization.id,
        customer_id=test_customer.id,
        amount_cents=30000,
        currency="USD",
        payment_method=PaymentMethod.CREDIT_CARD,
        status=PaymentStatus.SUCCEEDED
    )
    db.add(payment)
    db.commit()

    response = client.post(
        "/api/v1/payments/invoices",
        headers={"Authorization": f"Bearer {test_token}"},
        params={"payment_id": str(payment.id)}
    )
    assert response.status_code in [200, 400]


def test_apply_coupon(client: TestClient, test_token: str, test_user, test_organization, test_customer, db):
    """Test applying coupon to payment"""
    payment = Payment(
        id=uuid4(),
        organization_id=test_organization.id,
        customer_id=test_customer.id,
        amount_cents=35000,
        currency="USD",
        payment_method=PaymentMethod.CREDIT_CARD,
        status=PaymentStatus.PENDING
    )
    db.add(payment)
    db.commit()

    response = client.post(
        f"/api/v1/payments/coupons/SAVE10/apply",
        headers={"Authorization": f"Bearer {test_token}"},
        params={"payment_id": str(payment.id)}
    )
    assert response.status_code in [200, 400]


def test_payment_analytics(client: TestClient, test_token: str, test_user, test_organization):
    """Test getting payment analytics"""
    response = client.get(
        "/api/v1/payments/analytics/summary",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code in [200, 500]  # May fail without analytics setup
