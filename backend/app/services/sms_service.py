"""SMS service with Twilio"""

import os
from typing import Optional

try:
    from twilio.rest import Client
except ImportError:
    Client = None

class SMSService:
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.from_number = os.getenv("TWILIO_PHONE_NUMBER")

        if self.account_sid and self.auth_token and Client:
            self.client = Client(self.account_sid, self.auth_token)
        else:
            self.client = None

    def send_sms(
        self,
        to_number: str,
        message: str
    ) -> bool:
        """Send SMS message"""
        if not self.client or not self.from_number:
            print(f"[SMS] To: {to_number}, Message: {message}")
            return True  # Mock success for development

        try:
            msg = self.client.messages.create(
                body=message,
                from_=self.from_number,
                to=to_number
            )
            return msg.sid is not None
        except Exception as e:
            print(f"SMS error: {str(e)}")
            return False

    def send_appointment_confirmation(
        self,
        to_number: str,
        appointment_title: str,
        start_time: str
    ) -> bool:
        """Send appointment confirmation SMS"""
        message = f"Hi! Your appointment '{appointment_title}' is confirmed for {start_time}. Reply CONFIRM to confirm or CANCEL to cancel."
        return self.send_sms(to_number, message)

    def send_appointment_reminder(
        self,
        to_number: str,
        appointment_title: str,
        start_time: str
    ) -> bool:
        """Send appointment reminder SMS"""
        message = f"Reminder: Your appointment '{appointment_title}' is coming up at {start_time}. Reply CONFIRM or call if you need to reschedule."
        return self.send_sms(to_number, message)

    def send_payment_confirmation(
        self,
        to_number: str,
        amount: str,
        description: str
    ) -> bool:
        """Send payment confirmation SMS"""
        message = f"Payment received: ${amount} for {description}. Thank you!"
        return self.send_sms(to_number, message)

    def send_verification_code(
        self,
        to_number: str,
        code: str
    ) -> bool:
        """Send verification code"""
        message = f"Your verification code is: {code}. This code expires in 10 minutes."
        return self.send_sms(to_number, message)

    def send_password_reset(
        self,
        to_number: str,
        reset_url: str
    ) -> bool:
        """Send password reset link"""
        message = f"Click this link to reset your password: {reset_url}"
        return self.send_sms(to_number, message)
