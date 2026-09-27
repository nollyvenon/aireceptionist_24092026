"""Mock database configuration for tests when PostgreSQL is unavailable"""

import pytest
from unittest.mock import Mock, MagicMock
from uuid import uuid4
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

from main import app
from app.services.auth_service import AuthService


@pytest.fixture(scope="function")
def mock_db():
    """Mock database session"""
    db = Mock()
    db.query = MagicMock()
    db.add = Mock()
    db.commit = Mock()
    db.refresh = Mock()
    db.close = Mock()
    return db


@pytest.fixture(scope="function")
def client_mock():
    """FastAPI test client with mocked database"""
    return TestClient(app)


@pytest.fixture(scope="function")
def mock_user_fixture():
    """Mock user entity"""
    return {
        "id": str(uuid4()),
        "email": "testuser@example.com",
        "first_name": "Test",
        "last_name": "User",
        "organization_id": str(uuid4()),
        "password_hash": AuthService.hash_password("testpass123"),
    }


@pytest.fixture(scope="function")
def mock_organization_fixture():
    """Mock organization entity"""
    return {
        "id": str(uuid4()),
        "name": "Test Organization",
        "slug": "test-org",
        "timezone": "UTC",
    }


@pytest.fixture(scope="function")
def mock_customer_fixture():
    """Mock customer entity"""
    return {
        "id": str(uuid4()),
        "email": "customer@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "organization_id": str(uuid4()),
    }


@pytest.fixture(scope="function")
def mock_auth_token():
    """Mock JWT token"""
    test_user_id = str(uuid4())
    return AuthService.create_access_token(test_user_id, 3600)
