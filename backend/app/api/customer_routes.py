"""Customer API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse, CustomerListResponse
from app.services.customer_service import CustomerService
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/v1/customers", tags=["customers"])

@router.post("", response_model=CustomerResponse)
async def create_customer(
    customer_data: CustomerCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new customer"""
    try:
        customer = CustomerService.create_customer(customer_data, current_user.organization_id, db)
        return customer
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=CustomerListResponse)
async def list_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: str = Query(None),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List customers"""
    customers, total = CustomerService.list_organization_customers(
        current_user.organization_id,
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
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search customers"""
    customers, total = CustomerService.search_customers(
        current_user.organization_id,
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
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get customer by ID"""
    customer = CustomerService.get_customer(customer_id, db)

    if not customer or customer.organization_id != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Customer not found")

    return customer

@router.put("/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: UUID,
    customer_data: CustomerUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update customer"""
    customer = CustomerService.get_customer(customer_id, db)

    if not customer or customer.organization_id != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Customer not found")

    try:
        updated_customer = CustomerService.update_customer(customer_id, customer_data, db)
        return updated_customer
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{customer_id}/lead-score")
async def get_lead_score(
    customer_id: UUID,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get lead score for customer"""
    customer = CustomerService.get_customer(customer_id, db)

    if not customer or customer.organization_id != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Customer not found")

    try:
        score = CustomerService.get_lead_score(customer_id, db)
        return {"customer_id": customer_id, "lead_score": score}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
