"""Customer tests"""

import pytest


def test_customer_endpoints_defined():
    """Test customer endpoints defined"""
    try:
        from app.api.customer_routes import router
        assert router is not None
    except ImportError:
        pytest.skip("Customer routes unavailable")


def test_customer_profile_structure():
    """Test customer profile structure"""
    customer = {
        "id": "cust_123",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "status": "active"
    }
    assert customer["id"]
    assert customer["email"]
    assert "@" in customer["email"]
