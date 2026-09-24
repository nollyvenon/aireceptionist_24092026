"""Appointment API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime, date

from database import get_db
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentResponse, AppointmentListResponse
from app.services.appointment_service import AppointmentService
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/v1/appointments", tags=["appointments"])

def get_current_org(token: str = Query(...), db: Session = Depends(get_db)):
    """Get current organization"""
    token_data = AuthService.verify_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid token")

    from app.services.user_service import UserService
    user = UserService.get_user(token_data.user_id, db)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user

@router.post("", response_model=AppointmentResponse)
async def create_appointment(
    appointment_data: AppointmentCreate,
    user = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """Create new appointment"""
    try:
        appointment = AppointmentService.create_appointment(
            appointment_data,
            user.organization_id,
            user.id,
            db
        )
        return appointment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=AppointmentListResponse)
async def list_appointments(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: str = Query(None),
    customer_id: UUID = Query(None),
    user = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """List appointments"""
    appointments, total = AppointmentService.list_appointments(
        user.organization_id,
        db,
        skip=skip,
        limit=limit,
        status=status,
        customer_id=customer_id
    )

    return {
        "items": appointments,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: UUID,
    user = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """Get appointment by ID"""
    appointment = AppointmentService.get_appointment(appointment_id, db)

    if not appointment or appointment.organization_id != user.organization_id:
        raise HTTPException(status_code=404, detail="Appointment not found")

    return appointment

@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: UUID,
    appointment_data: AppointmentUpdate,
    user = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """Update appointment"""
    try:
        appointment = AppointmentService.update_appointment(
            appointment_id,
            appointment_data,
            user.organization_id,
            db
        )
        return appointment
    except ValueError as e:
        raise HTTPException(status_code=404 if "not found" in str(e) else 400, detail=str(e))

@router.post("/{appointment_id}/cancel")
async def cancel_appointment(
    appointment_id: UUID,
    cancellation_reason: str = Query(...),
    user = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """Cancel appointment"""
    try:
        appointment = AppointmentService.cancel_appointment(
            appointment_id,
            user.organization_id,
            cancellation_reason,
            user.id,
            db
        )
        return {"message": "Appointment cancelled", "appointment": appointment}
    except ValueError as e:
        raise HTTPException(status_code=404 if "not found" in str(e) else 400, detail=str(e))

@router.get("/availability/{assigned_to_id}")
async def get_available_slots(
    assigned_to_id: UUID,
    date: date = Query(...),
    duration_minutes: int = Query(60),
    user = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """Get available time slots for a date"""
    slots = AppointmentService.get_available_slots(
        user.organization_id,
        assigned_to_id,
        datetime.combine(date, datetime.min.time()),
        duration_minutes,
        db
    )

    return {"date": date, "available_slots": slots}

@router.post("/{appointment_id}/confirm")
async def confirm_appointment(
    appointment_id: UUID,
    user = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """Confirm appointment"""
    appointment = AppointmentService.get_appointment(appointment_id, db)

    if not appointment or appointment.organization_id != user.organization_id:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appointment.is_confirmed = True
    appointment.confirmed_at = datetime.utcnow()
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    return {"message": "Appointment confirmed", "appointment": appointment}
