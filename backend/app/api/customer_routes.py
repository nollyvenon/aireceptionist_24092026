"""Customer API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse, CustomerListResponse
from app.services.customer_service import CustomerService
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/v1/customers", tags=["customers"])

def get_current_org(token: str = Query(...), db: Session = Depends(get_db)):
    """Get current organization from token"""
    token_data = AuthService.verify_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid token")

    from app.services.user_service import UserService
    user = UserService.get_user(token_data.user_id, db)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user.organization_id

@router.post("", response_model=CustomerResponse)
async def create_customer(
    customer_data: CustomerCreate,
    organization_id: UUID = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """Create new customer"""
    try:
        customer = CustomerService.create_customer(customer_data, organization_id, db)
        return customer
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=CustomerListResponse)
async def list_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: str = Query(None),
    organization_id: UUID = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """List customers"""
    customers, total = CustomerService.list_organization_customers(
        organization_id,
        db,
        skip=skip,
        limit=limit,
        status=status
    )

    return {
        "items": customers,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/search")
async def search_customers(
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    organization_id: UUID = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """Search customers"""
    customers, total = CustomerService.search_customers(
        organization_id,
        q,
        db,
        skip=skip,
        limit=limit
    )

    return {
        "items": customers,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: UUID,
    organization_id: UUID = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """Get customer by ID"""
    customer = CustomerService.get_customer(customer_id, db)

    if not customer or customer.organization_id != organization_id:
        raise HTTPException(status_code=404, detail="Customer not found")

    return customer

@router.put("/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: UUID,
    customer_data: CustomerUpdate,
    organization_id: UUID = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """Update customer"""
    customer = CustomerService.get_customer(customer_id, db)

    if not customer or customer.organization_id != organization_id:
        raise HTTPException(status_code=404, detail="Customer not found")

    try:
        updated_customer = CustomerService.update_customer(customer_id, customer_data, db)
        return updated_customer
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{customer_id}/lead-score")
async def get_lead_score(
    customer_id: UUID,
    organization_id: UUID = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """Get lead score for customer"""
    customer = CustomerService.get_customer(customer_id, db)

    if not customer or customer.organization_id != organization_id:
        raise HTTPException(status_code=404, detail="Customer not found")

    try:
        score = CustomerService.get_lead_score(customer_id, db)
        return {"customer_id": customer_id, "lead_score": score}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
