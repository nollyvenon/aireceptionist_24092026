"""Background task scheduler for reminders and automations"""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from uuid import UUID
import logging

from database import SessionLocal
from app.models.appointment import Appointment
from app.models.automation import Automation
from app.services.email_service import EmailService
from app.services.sms_service import SMSService

logger = logging.getLogger(__name__)

class TaskScheduler:
    @staticmethod
    def send_appointment_reminders():
        """Send appointment reminders 1 hour before scheduled time"""
        db = SessionLocal()
        try:
            reminder_time = datetime.utcnow() + timedelta(hours=1)
            reminder_end = reminder_time + timedelta(minutes=5)

            appointments = db.query(Appointment).filter(
                Appointment.start_time.between(reminder_time, reminder_end),
                Appointment.status == "confirmed",
                Appointment.reminder_sent_email == False
            ).all()

            for appointment in appointments:
                try:
                    if appointment.customer.email:
                        EmailService.send_appointment_reminder(
                            appointment.customer.email,
                            f"{appointment.customer.first_name} {appointment.customer.last_name}",
                            appointment.title,
                            appointment.start_time
                        )
                        appointment.reminder_sent_email = True

                    if appointment.customer.phone:
                        SMSService.send_appointment_reminder(
                            appointment.customer.phone,
                            appointment.title,
                            appointment.start_time
                        )
                        appointment.reminder_sent_sms = True

                    appointment.reminder_sent_at = datetime.utcnow()
                    db.add(appointment)
                    db.commit()

                except Exception as e:
                    logger.error(f"Error sending reminder for appointment {appointment.id}: {str(e)}")
                    db.rollback()

        finally:
            db.close()

    @staticmethod
    def execute_automations(trigger: str):
        """Execute automations for a given trigger"""
        db = SessionLocal()
        try:
            automations = db.query(Automation).filter(
                Automation.trigger == trigger,
                Automation.is_active == True
            ).all()

            for automation in automations:
                try:
                    automation.execution_count += 1

                    for action in automation.actions:
                        TaskScheduler._execute_action(action, db)

                    automation.success_count += 1
                    automation.last_executed_at = datetime.utcnow()

                except Exception as e:
                    logger.error(f"Error executing automation {automation.id}: {str(e)}")
                    automation.failure_count += 1

                db.add(automation)
                db.commit()

        finally:
            db.close()

    @staticmethod
    def _execute_action(action: dict, db: Session):
        """Execute a single automation action"""
        action_type = action.get("type")

        if action_type == "send_email":
            # Send email action
            EmailService.send_email(
                to_email=action.get("recipient"),
                subject=action.get("subject"),
                html_content=action.get("content"),
                plain_text=action.get("content")
            )

        elif action_type == "send_sms":
            # Send SMS action
            SMSService.send_sms(
                to_number=action.get("phone"),
                message=action.get("message")
            )

        elif action_type == "update_status":
            # Update customer status
            from app.services.customer_service import CustomerService
            customer_id = action.get("customer_id")
            status = action.get("status")

            if customer_id and status:
                from app.models.customer import Customer
                customer = db.query(Customer).filter(Customer.id == UUID(customer_id)).first()
                if customer:
                    customer.status = status
                    db.add(customer)

        logger.info(f"Executed action of type {action_type}")

    @staticmethod
    def cleanup_expired_tokens():
        """Clean up expired tokens and sessions"""
        db = SessionLocal()
        try:
            logger.info("Running token cleanup task")
        finally:
            db.close()

    @staticmethod
    def generate_daily_reports():
        """Generate daily analytics reports"""
        db = SessionLocal()
        try:
            logger.info("Generating daily reports")
        finally:
            db.close()
