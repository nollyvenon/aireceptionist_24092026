"""Email service"""

import os
from typing import List, Optional

try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail
except ImportError:
    SendGridAPIClient = None

class EmailService:
    def __init__(self):
        self.sendgrid_api_key = os.getenv("SENDGRID_API_KEY")
        self.from_email = os.getenv("SENDGRID_FROM_EMAIL", "noreply@glacierai.com")

        if self.sendgrid_api_key and SendGridAPIClient:
            self.sg = SendGridAPIClient(self.sendgrid_api_key)
        else:
            self.sg = None

    async def send_email(
        self,
        to: str,
        subject: str = "",
        body: str = "",
        html_content: str = "",
        plain_text: Optional[str] = None,
        organization_id=None
    ):
        """Send email using SendGrid"""
        content = html_content or body or ""
        to_email = to

        if not self.sg:
            print(f"[Email] To: {to_email}, Subject: {subject}")
            return {"id": "email_123", "status": "sent"}  # Mock success for development

        try:
            message = Mail(
                from_email=self.from_email,
                to_emails=to_email,
                subject=subject or "Message",
                plain_text_content=plain_text or "",
                html_content=content,
            )

            response = self.sg.send(message)
            if response.status_code in [200, 202]:
                return {"id": "email_123", "status": "sent"}
            else:
                return {"id": "email_123", "status": "failed"}
        except Exception as e:
            print(f"Email error: {str(e)}")
            return {"id": "email_123", "status": "failed"}

    def send_appointment_confirmation(
        self,
        to_email: str,
        customer_name: str,
        appointment_title: str,
        start_time: str,
        location: str
    ) -> bool:
        """Send appointment confirmation email"""
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Appointment Confirmation</h2>
                <p>Hi {customer_name},</p>
                <p>Your appointment has been confirmed:</p>
                <ul>
                    <li><strong>Title:</strong> {appointment_title}</li>
                    <li><strong>Date & Time:</strong> {start_time}</li>
                    <li><strong>Location:</strong> {location}</li>
                </ul>
                <p>Please arrive 10 minutes early.</p>
                <p>Best regards,<br>GLACIER AI Team</p>
            </body>
        </html>
        """

        return self.send_email(
            to_email,
            "Appointment Confirmation",
            html_content
        )

    def send_appointment_reminder(
        self,
        to_email: str,
        customer_name: str,
        appointment_title: str,
        start_time: str
    ) -> bool:
        """Send appointment reminder email"""
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Appointment Reminder</h2>
                <p>Hi {customer_name},</p>
                <p>This is a reminder about your upcoming appointment:</p>
                <ul>
                    <li><strong>Title:</strong> {appointment_title}</li>
                    <li><strong>Date & Time:</strong> {start_time}</li>
                </ul>
                <p>Please confirm your attendance or reschedule if needed.</p>
                <p>Best regards,<br>GLACIER AI Team</p>
            </body>
        </html>
        """

        return self.send_email(
            to_email,
            "Appointment Reminder",
            html_content
        )

    def send_payment_receipt(
        self,
        to_email: str,
        customer_name: str,
        amount: str,
        description: str
    ) -> bool:
        """Send payment receipt email"""
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Payment Receipt</h2>
                <p>Hi {customer_name},</p>
                <p>Thank you for your payment:</p>
                <ul>
                    <li><strong>Description:</strong> {description}</li>
                    <li><strong>Amount:</strong> {amount}</li>
                </ul>
                <p>Best regards,<br>GLACIER AI Team</p>
            </body>
        </html>
        """

        return self.send_email(
            to_email,
            "Payment Receipt",
            html_content
        )
