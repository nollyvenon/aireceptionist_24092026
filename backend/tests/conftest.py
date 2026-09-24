"""Test configuration and fixtures"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi.testclient import TestClient
from uuid import uuid4
from datetime import datetime, timedelta

from main import app
from database import get_db, Base
from app.models.user import User
from app.models.organization import Organization
from app.models.customer import Customer
from app.models.appointment import Appointment
from app.services.auth_service import AuthService

# Use in-memory SQLite for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def db():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def test_organization(db: Session):
    org = Organization(
        id=uuid4(),
        name="Test Organization",
        slug="test-org",
        email="test@org.com",
        phone="+1234567890",
        website="https://testorg.com",
        timezone="UTC",
        subscription_plan="professional",
        ai_enabled=True,
        voice_enabled=True,
        whatsapp_enabled=False,
        automation_enabled=True
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    return org

@pytest.fixture
def test_user(db: Session, test_organization: Organization):
    user = User(
        id=uuid4(),
        organization_id=test_organization.id,
        email="testuser@test.com",
        password_hash=AuthService.hash_password("Password123!"),
        first_name="Test",
        last_name="User",
        phone="+1234567890",
        role="admin",
        is_active=True,
        is_email_verified=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def test_token(test_user: User):
    return AuthService.create_access_token(
        data={"sub": str(test_user.id), "email": test_user.email}
    )

@pytest.fixture
def test_customer(db: Session, test_organization: Organization):
    customer = Customer(
        id=uuid4(),
        organization_id=test_organization.id,
        first_name="John",
        last_name="Doe",
        email="john@example.com",
        phone="+1234567890",
        company_name="Acme Corp",
        job_title="CEO",
        source="website",
        status="prospect"
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@pytest.fixture
def test_appointment(db: Session, test_organization: Organization, test_user: User, test_customer: Customer):
    start_time = datetime.utcnow() + timedelta(days=1)
    end_time = start_time + timedelta(hours=1)

    appointment = Appointment(
        id=uuid4(),
        organization_id=test_organization.id,
        customer_id=test_customer.id,
        assigned_to_id=test_user.id,
        created_by_id=test_user.id,
        title="Test Appointment",
        description="Test appointment description",
        appointment_type="consultation",
        start_time=start_time,
        end_time=end_time,
        duration_minutes=60,
        location="Test Location",
        status="confirmed",
        is_confirmed=True,
        confirmed_at=datetime.utcnow()
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment
