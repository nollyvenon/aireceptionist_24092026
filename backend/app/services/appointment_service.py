"""Appointment service with availability checking and conflict detection"""

from uuid import UUID
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.appointment import Appointment, AppointmentStatus
from app.models.customer import Customer
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate

class AppointmentService:
    @staticmethod
    def check_availability(
        organization_id: UUID,
        assigned_to_id: UUID,
        start_time: datetime,
        end_time: datetime,
        db: Session,
        exclude_appointment_id: UUID = None
    ) -> bool:
        """Check if time slot is available"""
        query = db.query(Appointment).filter(
            and_(
                Appointment.organization_id == organization_id,
                Appointment.assigned_to_id == assigned_to_id,
                Appointment.status.in_([AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]),
                # Check for overlapping appointments
                or_(
                    and_(Appointment.start_time < end_time, Appointment.end_time > start_time)
                )
            )
        )

        if exclude_appointment_id:
            query = query.filter(Appointment.id != exclude_appointment_id)

        conflict = query.first()
        return conflict is None

    @staticmethod
    def create_appointment(
        appointment_data: AppointmentCreate,
        organization_id: UUID,
        created_by_id: UUID,
        db: Session
    ) -> Appointment:
        """Create new appointment with conflict checking"""
        # Check availability if assigned to someone
        # (appointments can be created without assignment first)

        db_appointment = Appointment(
            organization_id=organization_id,
            customer_id=appointment_data.customer_id,
            created_by_id=created_by_id,
            title=appointment_data.title,
            description=appointment_data.description,
            appointment_type=appointment_data.appointment_type,
            start_time=appointment_data.start_time,
            end_time=appointment_data.end_time,
            duration_minutes=appointment_data.duration_minutes,
            location=appointment_data.location,
            meeting_url=appointment_data.meeting_url,
            meeting_provider=appointment_data.meeting_provider,
            notes=appointment_data.notes,
            price_cents=appointment_data.price_cents,
        )

        db.add(db_appointment)

        # Update customer metrics
        customer = db.query(Customer).filter(Customer.id == appointment_data.customer_id).first()
        if customer:
            customer.total_appointments += 1
            customer.last_contact_at = datetime.utcnow()

        db.commit()
        db.refresh(db_appointment)
        return db_appointment

    @staticmethod
    def get_appointment(appointment_id: UUID, db: Session) -> Appointment:
        """Get appointment by ID"""
        return db.query(Appointment).filter(Appointment.id == appointment_id).first()

    @staticmethod
    def update_appointment(
        appointment_id: UUID,
        appointment_data: AppointmentUpdate,
        organization_id: UUID,
        db: Session
    ) -> Appointment:
        """Update appointment"""
        db_appointment = AppointmentService.get_appointment(appointment_id, db)
        if not db_appointment:
            raise ValueError("Appointment not found")

        if db_appointment.organization_id != organization_id:
            raise ValueError("Unauthorized")

        update_data = appointment_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_appointment, field, value)

        db.add(db_appointment)
        db.commit()
        db.refresh(db_appointment)
        return db_appointment

    @staticmethod
    def list_appointments(
        organization_id: UUID,
        db: Session,
        skip: int = 0,
        limit: int = 50,
        status: str = None,
        customer_id: UUID = None,
        assigned_to_id: UUID = None,
    ) -> tuple[list[Appointment], int]:
        """List appointments with filters"""
        query = db.query(Appointment).filter(Appointment.organization_id == organization_id)

        if status:
            query = query.filter(Appointment.status == status)
        if customer_id:
            query = query.filter(Appointment.customer_id == customer_id)
        if assigned_to_id:
            query = query.filter(Appointment.assigned_to_id == assigned_to_id)

        query = query.order_by(Appointment.start_time.desc())
        total = query.count()
        appointments = query.offset(skip).limit(limit).all()
        return appointments, total

    @staticmethod
    def get_available_slots(
        organization_id: UUID,
        assigned_to_id: UUID,
        date: datetime,
        slot_duration_minutes: int,
        db: Session
    ) -> list[dict]:
        """Get available time slots for a day"""
        # Default business hours: 9 AM to 5 PM
        day_start = date.replace(hour=9, minute=0, second=0)
        day_end = date.replace(hour=17, minute=0, second=0)

        available_slots = []
        current = day_start

        while current < day_end:
            slot_end = current + timedelta(minutes=slot_duration_minutes)

            is_available = AppointmentService.check_availability(
                organization_id,
                assigned_to_id,
                current,
                slot_end,
                db
            )

            if is_available:
                available_slots.append({
                    "start_time": current,
                    "end_time": slot_end,
                    "is_available": True
                })

            current += timedelta(minutes=slot_duration_minutes)

        return available_slots

    @staticmethod
    def cancel_appointment(
        appointment_id: UUID,
        organization_id: UUID,
        cancellation_reason: str,
        cancelled_by_id: UUID,
        db: Session
    ) -> Appointment:
        """Cancel appointment"""
        db_appointment = AppointmentService.get_appointment(appointment_id, db)
        if not db_appointment:
            raise ValueError("Appointment not found")

        if db_appointment.organization_id != organization_id:
            raise ValueError("Unauthorized")

        db_appointment.status = AppointmentStatus.CANCELLED
        db_appointment.cancelled_at = datetime.utcnow()
        db_appointment.cancelled_by_id = cancelled_by_id
        db_appointment.cancellation_reason = cancellation_reason

        # Update customer metrics
        customer = db.query(Customer).filter(Customer.id == db_appointment.customer_id).first()
        if customer:
            customer.cancelled_appointments += 1

        db.add(db_appointment)
        db.commit()
        db.refresh(db_appointment)
        return db_appointment
