"""Customer service"""

from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate

class CustomerService:
    @staticmethod
    def create_customer(
        customer_data: CustomerCreate,
        organization_id: UUID,
        db: Session
    ) -> Customer:
        """Create new customer"""
        db_customer = Customer(
            organization_id=organization_id,
            first_name=customer_data.first_name,
            last_name=customer_data.last_name,
            email=customer_data.email,
            phone=customer_data.phone,
            company_name=customer_data.company_name,
            job_title=customer_data.job_title,
            source=customer_data.source,
            first_contact_at=datetime.utcnow(),
        )

        db.add(db_customer)
        db.commit()
        db.refresh(db_customer)
        return db_customer

    @staticmethod
    def get_customer(customer_id: UUID, db: Session) -> Customer:
        """Get customer by ID"""
        return db.query(Customer).filter(Customer.id == customer_id).first()

    @staticmethod
    def update_customer(
        customer_id: UUID,
        customer_data: CustomerUpdate,
        db: Session
    ) -> Customer:
        """Update customer"""
        db_customer = CustomerService.get_customer(customer_id, db)
        if not db_customer:
            raise ValueError("Customer not found")

        update_data = customer_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_customer, field, value)

        db_customer.updated_at = datetime.utcnow()
        db.add(db_customer)
        db.commit()
        db.refresh(db_customer)
        return db_customer

    @staticmethod
    def list_organization_customers(
        organization_id: UUID,
        db: Session,
        skip: int = 0,
        limit: int = 50,
        status: str = None,
    ) -> tuple[list[Customer], int]:
        """List customers in organization"""
        query = db.query(Customer).filter(Customer.organization_id == organization_id)

        if status:
            query = query.filter(Customer.status == status)

        total = query.count()
        customers = query.offset(skip).limit(limit).all()
        return customers, total

    @staticmethod
    def search_customers(
        organization_id: UUID,
        search_query: str,
        db: Session,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[list[Customer], int]:
        """Search customers by name or email"""
        query = db.query(Customer).filter(Customer.organization_id == organization_id)
        query = query.filter(
            (Customer.first_name.ilike(f"%{search_query}%")) |
            (Customer.last_name.ilike(f"%{search_query}%")) |
            (Customer.email.ilike(f"%{search_query}%"))
        )

        total = query.count()
        customers = query.offset(skip).limit(limit).all()
        return customers, total

    @staticmethod
    def get_lead_score(customer_id: UUID, db: Session) -> float:
        """Calculate lead score for customer"""
        customer = CustomerService.get_customer(customer_id, db)
        if not customer:
            raise ValueError("Customer not found")

        return customer.get_lead_score()
