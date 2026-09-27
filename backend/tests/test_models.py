"""Tests for database models"""

import pytest
from sqlalchemy.orm import Session
from uuid import uuid4
from datetime import datetime, timedelta

from app.models.user import User
from app.models.organization import Organization
from app.models.customer import Customer
from app.models.appointment import Appointment
from app.models.payment import Payment, PaymentStatus
from app.models.activity import Activity, ActivityType
from app.models.automation import Automation
from app.models.settings import Settings
from app.services.auth_service import AuthService


class TestUserModel:
    """Test User model"""
    
    def test_create_user(self, db: Session, test_organization):
        """Test creating a user"""
        user = User(
            id=uuid4(),
            organization_id=test_organization.id,
            email="newuser@test.com",
            password_hash=AuthService.hash_password("Password123!"),
            first_name="New",
            last_name="User",
            role="staff"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        assert user.email == "newuser@test.com"
        assert user.role == "staff"
        assert user.organization_id == test_organization.id
    
    def test_user_password_hashing(self, db: Session, test_organization):
        """Test password hashing"""
        password = "SecurePass123!"
        user = User(
            id=uuid4(),
            organization_id=test_organization.id,
            email="hash@test.com",
            password_hash=AuthService.hash_password(password),
            first_name="Hash",
            last_name="Test"
        )
        
        assert user.password_hash != password
        assert len(user.password_hash) > 20


class TestCustomerModel:
    """Test Customer model"""
    
    def test_create_customer(self, db: Session, test_organization):
        """Test creating a customer"""
        customer = Customer(
            id=uuid4(),
            organization_id=test_organization.id,
            first_name="Jane",
            last_name="Smith",
            email="jane@example.com",
            phone="+9876543210",
            status="customer"
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)
        
        assert customer.email == "jane@example.com"
        assert customer.status == "customer"


class TestAppointmentModel:
    """Test Appointment model"""
    
    def test_create_appointment(self, db: Session, test_organization, test_user, test_customer):
        """Test creating an appointment"""
        start = datetime.utcnow() + timedelta(days=2)
        end = start + timedelta(hours=1)
        
        appointment = Appointment(
            id=uuid4(),
            organization_id=test_organization.id,
            customer_id=test_customer.id,
            assigned_to_id=test_user.id,
            created_by_id=test_user.id,
            title="Follow-up Consultation",
            start_time=start,
            end_time=end,
            duration_minutes=60,
            status="scheduled"
        )
        db.add(appointment)
        db.commit()
        db.refresh(appointment)
        
        assert appointment.status == "scheduled"
        assert appointment.duration_minutes == 60


class TestPaymentModel:
    """Test Payment model"""
    
    def test_create_payment(self, db: Session, test_organization, test_customer):
        """Test creating a payment"""
        payment = Payment(
            id=uuid4(),
            organization_id=test_organization.id,
            customer_id=test_customer.id,
            amount_cents=25000,
            currency="USD",
            payment_method="card",
            status=PaymentStatus.PENDING
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)
        
        assert payment.amount_cents == 25000
        assert payment.get_amount_dollars() == 250.00
        assert payment.status == PaymentStatus.PENDING


class TestActivityModel:
    """Test Activity model"""
    
    def test_create_activity(self, db: Session, test_organization, test_customer, test_user):
        """Test creating an activity"""
        activity = Activity(
            id=uuid4(),
            organization_id=test_organization.id,
            customer_id=test_customer.id,
            activity_type=ActivityType.CALL,
            title="Outbound Call",
            description="Customer consultation",
            created_by_id=test_user.id,
            duration_minutes=15,
            call_outcome="successful"
        )
        db.add(activity)
        db.commit()
        db.refresh(activity)
        
        assert activity.activity_type == ActivityType.CALL
        assert activity.title == "Outbound Call"
