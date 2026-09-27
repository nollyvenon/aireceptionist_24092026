"""Test configuration and fixtures for integration tests with real PostgreSQL"""

import os
import pytest
from uuid import uuid4
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session

from main import app
from database import Base, get_db
from app.models import *  # noqa: F401, F403
from app.services.auth_service import AuthService


# PostgreSQL Test Database Configuration
POSTGRES_HOST = os.getenv("TEST_DB_HOST", "localhost")
POSTGRES_PORT = os.getenv("TEST_DB_PORT", "5432")
POSTGRES_USER = os.getenv("TEST_DB_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("TEST_DB_PASSWORD", "postgres")
POSTGRES_DB = os.getenv("TEST_DB_NAME", "test_glacier_ai")

TEST_DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"

# Create engine with PostgreSQL
engine = create_engine(
    TEST_DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create all tables in the test database
Base.metadata.create_all(bind=engine)


def override_get_db():
    """Override get_db dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function", autouse=True)
def reset_db():
    """Reset database before each test"""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db():
    """Get database session for test"""
    session = TestingSessionLocal()
    yield session
    session.close()


@pytest.fixture(scope="function")
def client():
    """Get test client"""
    return TestClient(app)


@pytest.fixture
def mock_user_data():
    """Mock user data for testing"""
    return {
        "id": str(uuid4()),
        "email": f"test_{uuid4().hex}@example.com",
        "phone": "+1234567890",
        "first_name": "Test",
        "last_name": "User",
        "is_active": True,
        "created_at": datetime.utcnow(),
    }


@pytest.fixture
def mock_organization_data():
    """Mock organization data for testing"""
    return {
        "id": str(uuid4()),
        "name": "Test Org",
        "email": f"org_{uuid4().hex}@example.com",
        "phone": "+1987654321",
        "website": "https://example.com",
        "is_active": True,
        "created_at": datetime.utcnow(),
    }


@pytest.fixture
def mock_appointment_data():
    """Mock appointment data for testing"""
    return {
        "id": str(uuid4()),
        "title": "Test Appointment",
        "description": "Test Description",
        "start_time": datetime.utcnow() + timedelta(hours=1),
        "end_time": datetime.utcnow() + timedelta(hours=2),
        "status": "scheduled",
        "created_at": datetime.utcnow(),
    }


@pytest.fixture
def mock_payment_data():
    """Mock payment data for testing"""
    return {
        "id": str(uuid4()),
        "amount": 10000,
        "currency": "USD",
        "status": "completed",
        "method": "stripe",
        "created_at": datetime.utcnow(),
    }


@pytest.fixture
def mock_customer_data():
    """Mock customer data for testing"""
    return {
        "id": str(uuid4()),
        "first_name": "John",
        "last_name": "Doe",
        "email": f"customer_{uuid4().hex}@example.com",
        "phone": "+1234567890",
        "status": "active",
        "created_at": datetime.utcnow(),
    }


@pytest.fixture
def mock_workflow_data():
    """Mock workflow data for testing"""
    return {
        "id": str(uuid4()),
        "name": "Test Workflow",
        "triggers": ["appointment_booked"],
        "actions": ["send_email"],
        "is_active": True,
        "created_at": datetime.utcnow(),
    }


# Database fixtures for integration tests

@pytest.fixture
def test_organization(db):
    """Create test organization"""
    from app.models.organization import Organization
    org = Organization(
        name="Test Org",
        slug=f"test-org-{uuid4().hex[:8]}",
        email=f"org_{uuid4().hex}@example.com",
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    return org


@pytest.fixture
def test_user(db, test_organization):
    """Create test user"""
    from app.models.user import User
    import hashlib
    # Use simple SHA256 hash for testing (not secure, but bypasses bcrypt backend issues)
    test_password_hash = hashlib.sha256("testpass123".encode()).hexdigest()
    user = User(
        organization_id=test_organization.id,
        email=f"testuser_{uuid4().hex}@example.com",
        password_hash=test_password_hash,
        first_name="Test",
        last_name="User",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_customer(db, test_organization):
    """Create test customer"""
    from app.models.customer import Customer
    customer = Customer(
        organization_id=test_organization.id,
        email=f"customer_{uuid4().hex}@example.com",
        first_name="John",
        last_name="Doe",
        company_name="Test Company",
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@pytest.fixture
def test_lead(db, test_organization):
    """Create test lead"""
    from app.models.crm import Lead
    lead = Lead(
        organization_id=test_organization.id,
        first_name="Jane",
        last_name="Smith",
        email=f"lead_{uuid4().hex}@example.com",
        company="Lead Company",
        lead_score=75.0,
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


@pytest.fixture
def test_contact(db, test_organization, test_customer):
    """Create test contact"""
    from app.models.crm import Contact
    contact = Contact(
        organization_id=test_organization.id,
        customer_id=test_customer.id,
        first_name="Jane",
        last_name="Contact",
        email=f"contact_{uuid4().hex}@example.com",
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


@pytest.fixture
def test_deal(db, test_organization, test_customer):
    """Create test deal"""
    from app.models.crm import Deal
    deal = Deal(
        organization_id=test_organization.id,
        customer_id=test_customer.id,
        name="Test Deal",
        value=50000.0,
        probability=75.0,
    )
    db.add(deal)
    db.commit()
    db.refresh(deal)
    return deal


@pytest.fixture
def test_appointment(db, test_organization, test_customer):
    """Create test appointment"""
    from app.models.appointment import Appointment
    appointment = Appointment(
        organization_id=test_organization.id,
        customer_id=test_customer.id,
        title="Test Meeting",
        start_time=datetime.utcnow() + timedelta(days=1),
        end_time=datetime.utcnow() + timedelta(days=1, hours=1),
        duration_minutes=60,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


@pytest.fixture
def test_payment(db, test_organization, test_customer):
    """Create test payment"""
    from app.models.payment import Payment, PaymentStatus, PaymentMethod
    payment = Payment(
        organization_id=test_organization.id,
        customer_id=test_customer.id,
        amount_cents=100000,
        status=PaymentStatus.SUCCEEDED,
        payment_method=PaymentMethod.STRIPE,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


@pytest.fixture
def test_call(db, test_organization):
    """Create test call"""
    from app.models.communication import Call, CallStatus, CallType
    call = Call(
        organization_id=test_organization.id,
        from_number="+1234567890",
        to_number="+0987654321",
        call_type=CallType.INBOUND,
        status=CallStatus.COMPLETED,
        duration=300,
    )
    db.add(call)
    db.commit()
    db.refresh(call)
    return call


@pytest.fixture
def test_voicemail(db, test_organization):
    """Create test voicemail"""
    from app.models.communication import Voicemail
    voicemail = Voicemail(
        organization_id=test_organization.id,
        caller_number="+1234567890",
        duration=45,
        audio_url="https://example.com/voicemail.mp3",
    )
    db.add(voicemail)
    db.commit()
    db.refresh(voicemail)
    return voicemail


@pytest.fixture
def test_auth_token(test_user):
    """Create test JWT token"""
    from datetime import timedelta
    token = AuthService.create_access_token({"sub": str(test_user.id)}, timedelta(minutes=60))
    return token


@pytest.fixture
def auth_headers(test_auth_token):
    """Create authorization headers"""
    return {"Authorization": f"Bearer {test_auth_token}"}
